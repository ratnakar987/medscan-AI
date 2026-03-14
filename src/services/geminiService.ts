import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImage = async (base64Image: string, mimeType: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable in your deployment settings.");
  }
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this medical image or document. It could be a text-based report (like a prescription or lab result) or a raw medical image (like a CT scan slice, MRI, X-ray, or ECG tracing).
    
    1. If it's a text document: Extract all text (OCR) and classify it.
    2. If it's a raw medical image (e.g., a CT scan of a body part): Describe what is visible, identify the body part, and provide general medical insights based on the visual features.
    3. Classify the document/image type (e.g., "prescription", "lab_report", "imaging_report", "ecg", "discharge_summary", "raw_medical_image", "other").
    4. Provide a concise summary (2-3 sentences max) for a patient. Use simple, non-medical language.
    5. Highlight 3-5 "main_findings" as bullet points. If there are complex medical terms, explain them briefly in brackets.
    6. If it's an imaging report or raw medical image: Extract or describe "impressions" and "key_observations".
    7. If it's an ECG: Extract "heart_rate", "rhythm", and "interpretation".
    8. If prescription: Extract medicines (name, dosage, timing, purpose, side effects).
    9. If lab report: Extract results (parameter, value, range, abnormal status, explanation).
    
    IMPORTANT: Always provide a "summary" and "ai_analysis" (detailed interpretation) even if the image contains no text. If you are unsure about specific details, provide general guidance and emphasize the need for professional medical consultation.

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

  const text = response.text;
  if (!text) throw new Error("No response from AI model");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to interpret the medical document. Please try a clearer image.");
  }
};
