import { GoogleGenAI, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImages = async (images: { base64: string, mimeType: string }[], retries = 2) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }
  
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are RXDecode Clinical AI, an evidence-aware medical report interpretation assistant.
    Your role is to help users understand laboratory reports in a safe, medically responsible, and easy-to-understand manner.

    CORE MEDICAL REASONING RULES:
    1. NEVER OVERDIAGNOSE. Use confidence-based language (e.g., "may suggest", "could indicate").
    2. DISTINGUISH LAB ABNORMALITY VS DISEASE. Consider biological variation, age, and severity.
    3. DETECT CLINICAL SEVERITY. Classify as Normal, Mild, Moderate, Significant, or Urgent.
    4. EXPLAIN MEDICAL CONTEXT. Why the marker matters and possible common causes.
    5. ALWAYS HANDLE UNCERTAINTY. State when single tests cannot confirm diagnosis.
    6. PRIORITIZE SAFETY. Advise urgent medical care for emergency risk findings (e.g., troponin, severe hypoglycemia).
    7. RISK STRATIFICATION. Match recommendation intensity to actual risk.
    8. NO HALLUCINATION. Only analyze values present in the documents.

    OUTPUT STRUCTURE (JSON ONLY):
    {
      "summary": "Holistic overview of the health profile",
      "key_findings": ["Significant or abnormal markers identified"],
      "clinical_interpretation": "Balanced medical context of the findings",
      "overall_health_status": "Normal|Mild Abnormality|Moderate Concern|Significant Concern|Urgent medical attention",
      "urgency_level": "Immediate|Within 24h|Routine",
      "possible_explanations": ["Common or metabolic reasons for deviations"],
      "lifestyle_guidance": ["Health and habit recommendations"],
      "diet_recommendations": {
        "to_eat": [{"food": "...", "reason": "...", "linked_to": "marker Name"}],
        "to_avoid": [{"food": "...", "reason": "...", "linked_to": "marker Name"}],
        "lifestyle_habits": ["Actionable habits"]
      },
      "next_steps": ["Recommended follow-up tests or consultations"],
      "urgent_medical_advice": "When to seek medical care immediately",
      "confidence_and_limitations": "Transparency about AI assessment limits",
      "potential_diagnosis_guess": "Most likely clinical correlation",
      "confidence_level": "Low|Moderate|High|Confirmed",
      "easy_explanation": "Simple explanation for the user",
      "medicine_list": [{"name": "...", "dosage": "...", "timing": "...", "purpose": "...", "simple_explanation": "..."}],
      "lab_results": [{"parameter": "...", "value": "...", "unit": "...", "referenceRange": "...", "status": "Low|Normal|High", "explanation": "..."}]
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
