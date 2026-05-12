import { GoogleGenAI, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImages = async (images: { base64: string, mimeType: string }[], retries = 2) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }
  
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a Senior Medical Diagnostic Engine for "RXDecode AI". Your task is to analyze one or more medical documents (lab reports, prescriptions, etc.) and provide a comprehensive, patient-friendly interpretation.
    
    TASK:
    1. Analyze ALL provided documents together for a holistic view.
    2. Identify KEY FINDINGS (especially abnormal values or critical observations).
    3. Provide a SIMPLE EXPLANATION of what these findings mean in plain language.
    4. Provide HEALTH INSIGHTS (potential underlying conditions or trends).
    5. Suggest DIET RECOMMENDATIONS (highly personalized). For every food item, explicitly link it to a specific parameter or finding from the report (e.g., "Eat Spinach because your Hemoglobin is low").
    6. Provide a section for MEAL TIMING & HABITS (e.g., "Eat dinner 3 hours before bed" if acid reflux is suspected).
    7. List PRECAUTIONS and NEXT STEPS (e.g., follow-up tests, lifestyle changes).
    8. GUESS the potential disease or condition based on the findings.

    JSON ONLY OUTPUT:
    {
      "overall_health_status": "Critical|Attention Needed|Stable|Good",
      "urgency_level": "Immediate|Within 24h|Routine",
      "holistic_summary": "A professional summary of the patient's condition across all reports",
      "potential_diagnosis_guess": "The most likely disease or condition based on findings",
      "confidence_level": "Low|Medium|High",
      "easy_explanation": "A very simple, empathetic explanation for the patient",
      "key_findings": ["Finding 1: Detail"],
      "health_insights": ["Insight 1"],
      "diet_recommendations": {
        "to_eat": [{"food": "...", "reason": "...", "linked_to": "Specific Parameter Name"}],
        "to_avoid": [{"food": "...", "reason": "...", "linked_to": "Specific Parameter Name"}],
        "lifestyle_habits": ["Actionable habit 1", "Actionable habit 2"]
      },
      "precautions": ["Precaution 1"],
      "next_steps": ["Step 1"],
      "medicine_list": [{"name": "...", "dosage": "...", "timing": "...", "purpose": "...", "simple_explanation": "..."}],
      "lab_results": [{"parameter": "...", "value": "...", "unit": "...", "min_ref": 0, "max_ref": 0, "status": "Low|Normal|High", "explanation": "..."}]
    }
  `;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.base64.includes(',') ? img.base64.split(',')[1] : img.base64,
      mimeType: img.mimeType
    }
  }));

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              ...imageParts
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        }
      });

      const text = response.text;
      if (!text) {
        if (attempt < retries) continue;
        throw new Error("No response from AI model");
      }
      
      try {
        // More robust JSON extraction: find the first { and last }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
          throw new Error("No valid JSON object found in response");
        }
        
        const jsonContent = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonContent);
      } catch (e) {
        console.error("Failed to parse AI response:", text);
        if (attempt < retries) continue;
        throw new Error("Failed to interpret the medical document. Please try a clearer image.");
      }
    } catch (error: any) {
      console.error(`Gemini API attempt ${attempt + 1} failed:`, error);
      if (attempt === retries) {
        throw new Error(error.message || "AI Analysis failed. Please try again.");
      }
      // Wait less before retrying
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
};
