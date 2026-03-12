import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImage = async (base64Image: string, mimeType: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this medical document (e.g., prescription, lab report, CT scan, MRI, ECG, discharge summary, etc.).
    
    1. Extract all text (OCR).
    2. Classify the document type (e.g., "prescription", "lab_report", "imaging_report", "ecg", "discharge_summary", "other").
    3. Provide a concise summary (2-3 sentences max) for a patient. Use simple, non-medical language.
    4. Highlight 3-5 "main_findings" as bullet points. If there are complex medical terms, explain them briefly in brackets.
    5. If it's an imaging report (CT/MRI/X-Ray): Extract "impressions" and "key_observations".
    6. If it's an ECG: Extract "heart_rate", "rhythm", and "interpretation".
    7. If prescription: Extract medicines (name, dosage, timing, purpose, side effects).
    8. If lab report: Extract results (parameter, value, range, abnormal status, explanation).
    
    Return JSON:
    {
      "report_type": "string",
      "summary": "...",
      "main_findings": ["...", "..."],
      "ai_analysis": "...",
      "ocr_text": "...",
      "medicine_list": [{"name": "...", "dosage": "...", "timing": "...", "purpose": "...", "side_effects": "..."}],
      "lab_results": [{"parameter": "...", "value": "...", "reference_range": "...", "is_abnormal": bool, "explanation": "..."}],
      "imaging_details": {"impressions": "...", "observations": "..."},
      "ecg_details": {"heart_rate": "...", "rhythm": "...", "interpretation": "..."}
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
