import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImage = async (base64Image: string, mimeType: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this medical document (prescription or lab report).
    Extract the following information in JSON format:
    {
      "type": "prescription" | "lab_report",
      "summary": "Short summary of what this document is about",
      "medicines": [
        {
          "name": "Name of medicine",
          "dosage": "e.g. 500mg",
          "frequency": "e.g. Twice a day",
          "purpose": "What is it for?"
        }
      ],
      "labResults": [
        {
          "testName": "Name of test",
          "value": "Result value",
          "referenceRange": "Normal range",
          "interpretation": "Is it normal, high, or low?"
        }
      ],
      "recommendations": ["List of advice or next steps"]
    }
    If it's a prescription, focus on medicines. If it's a lab report, focus on labResults.
    Be accurate and concise.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};
