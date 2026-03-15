import { GoogleGenAI, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImage = async (base64Image: string, mimeType: string, retries = 2) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable in your deployment settings.");
  }
  
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a Medical Document Analysis Engine. Follow this pipeline:
    1. OCR: Extract all raw text from the image accurately.
    2. VISION: Identify the type of document (Prescription, Lab Report, ECG, etc.) and its visual state.
    3. NLP: Analyze the extracted text and visual context to interpret medical findings.
    4. EXTRACTION: Structure the data into the following JSON format.
    
    JSON ONLY:
    {
      "report_type": "prescription|lab_report|imaging_report|ecg|discharge_summary|raw_medical_image|other",
      "summary": "2-sentence patient-friendly summary",
      "main_findings": ["finding 1", "finding 2"],
      "ai_analysis": "detailed medical interpretation",
      "ocr_text": "full extracted raw text",
      "medicine_list": [{"name": "...", "dosage": "...", "timing": "...", "purpose": "...", "side_effects": "..."}],
      "lab_results": [{"parameter": "...", "value": "...", "reference_range": "...", "is_abnormal": bool, "explanation": "..."}],
      "imaging_details": {"impressions": "...", "observations": "..."},
      "ecg_details": {"heart_rate": "...", "rhythm": "...", "interpretation": "..."}
    }
  `;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
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
