import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImage = async (base64Image: string, mimeType: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this medical document (prescription or lab report).
    
    1. Extract all text (OCR).
    2. Classify as "prescription" or "lab_report".
    3. Summarize for a patient.
    4. If prescription: Extract medicines (name, dosage, timing, purpose, side effects).
    5. If lab report: Extract results (parameter, value, range, abnormal status, explanation).
    
    Return JSON:
    {
      "report_type": "prescription" | "lab_report",
      "summary": "...",
      "ai_analysis": "...",
      "ocr_text": "...",
      "medicine_list": [{"name": "...", "dosage": "...", "timing": "...", "purpose": "...", "side_effects": "..."}],
      "lab_results": [{"parameter": "...", "value": "...", "reference_range": "...", "is_abnormal": bool, "explanation": "..."}]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image,
              mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });

  return JSON.parse(response.text || "{}");
};
