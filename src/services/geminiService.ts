import { GoogleGenAI, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImages = async (images: { base64: string, mimeType: string }[], retries = 2) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }
  
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a Senior Medical Diagnostic Engine. You are provided with one or more medical documents belonging to the same patient.
    
    TASK:
    1. Analyze ALL provided documents together.
    2. Provide a HOLISTIC summary of the patient's health based on all documents.
    3. Extract key findings from each document.
    4. GUESS the potential disease or condition based on the symptoms, lab results, and prescriptions found across ALL documents.
    5. Provide a patient-friendly explanation.
    6. Suggest specific dietary recommendations (fruits, vegetables, etc.) that help manage or reduce the identified condition, with a short explanation for each.

    JSON ONLY:
    {
      "overall_health_status": "Critical|Attention Needed|Stable|Good",
      "urgency_level": "Immediate|Within 24h|Routine",
      "holistic_summary": "Overall summary of the patient's condition across all reports",
      "potential_diagnosis_guess": "The most likely disease or condition based on findings",
      "confidence_level": "Low|Medium|High",
      "easy_explanation": "Simple explanation for the patient",
      "combined_symptoms": ["symptom 1", "symptom 2"],
      "dietary_recommendations": [
        {
          "food": "Name of fruit/veg/food",
          "benefit": "Short explanation of why it helps"
        }
      ],
      "reports_breakdown": [
        {
          "type": "prescription|lab_report|...",
          "summary": "summary of this specific doc",
          "findings": ["finding 1", "finding 2"]
        }
      ],
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
