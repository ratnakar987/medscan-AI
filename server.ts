import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for Combined Multimodal Analysis (Faster & More Accurate)
  app.post("/api/analyze-medical-report", async (req, res) => {
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    try {
      // Fetch the image and convert to base64
      const imageResponse = await fetch(image_url);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

      const model = "gemini-3-flash-preview";
      
      const prompt = `
        You are an expert medical assistant AI. Analyze this medical document image (prescription or lab report).
        
        Tasks:
        1. Perform high-accuracy OCR to extract all text.
        2. Identify if this is a "prescription" or a "lab_report".
        3. Provide a clear, patient-friendly summary of the document.
        4. If it's a prescription:
           - Extract all medicines with precise dosages, timings, and instructions.
           - For each medicine, provide a detailed but simple explanation of its purpose.
           - List common side effects and important safety warnings.
           - Provide detailed suggestions for the patient (e.g., diet, lifestyle, when to call a doctor).
        5. If it's a lab report:
           - Extract all key parameters, values, and reference ranges.
           - Identify abnormal values (high/low) and explain their significance in simple terms.
           - Provide actionable suggestions based on the results.
        
        Return the analysis in the following JSON format:
        {
          "report_type": "prescription" | "lab_report",
          "summary": "Simple explanation of the document",
          "ai_analysis": "Detailed breakdown and actionable suggestions for the patient",
          "ocr_text": "The full extracted text from the document",
          "medicine_list": [
            {
              "name": "Medicine Name",
              "dosage": "Dosage info",
              "timing": "When to take",
              "purpose": "Detailed simple explanation of why this is prescribed",
              "side_effects": "Common side effects and warnings"
            }
          ],
          "lab_results": [
            {
              "parameter": "Test Name",
              "value": "Result value",
              "reference_range": "Normal range",
              "is_abnormal": true/false,
              "explanation": "Simple explanation of this result and what it means"
            }
          ]
        }
      `;

      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Image,
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

      const analysis = JSON.parse(result.text || "{}");
      res.json(analysis);
    } catch (error: any) {
      console.error("Combined Analysis Error:", error);
      res.status(500).json({ error: "Failed to process medical report", details: error.message });
    }
  });

  // API Route for OCR Analysis (Legacy - kept for compatibility)
  app.post("/api/analyze-ocr", async (req, res) => {
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    try {
      // Fetch the image and convert to base64
      const imageResponse = await fetch(image_url);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

      const model = "gemini-3-flash-preview";
      
      const prompt = `
        Perform OCR on this medical document. 
        Extract all text and structure it clearly.
        If it's a prescription, list medicines with dosages and instructions.
        If it's a lab report, list tests and results.
        Return ONLY the extracted text in a clean, readable format.
      `;

      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Image,
                  mimeType
                }
              }
            ]
          }
        ]
      });

      const extractedText = result.text || "No text could be extracted.";

      res.json({ extracted_text: extractedText });
    } catch (error: any) {
      console.error("OCR Error:", error);
      res.status(500).json({ error: "Failed to process OCR", details: error.message });
    }
  });

  // API Route for AI Analysis of OCR Text
  app.post("/api/ai-analyze-report", async (req, res) => {
    const { ocr_text } = req.body;

    if (!ocr_text) {
      return res.status(400).json({ error: "ocr_text is required" });
    }

    try {
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        You are a medical assistant AI. Analyze the following OCR extracted text from a medical document.
        
        OCR Text:
        """
        ${ocr_text}
        """
        
        Tasks:
        1. Identify if this is a "prescription" or a "lab_report".
        2. Provide a simple, patient-friendly summary.
        3. If it's a prescription:
           - List all medicines.
           - For each medicine, extract: name, dosage, timing/instructions, explain its purpose in simple terms, and list common side effects.
        4. If it's a lab report:
           - List key parameters/tests.
           - Identify any abnormal values (high/low) and explain what they mean simply.
        
        Return the analysis in the following JSON format:
        {
          "report_type": "prescription" | "lab_report",
          "summary": "Simple explanation of the document",
          "ai_analysis": "Detailed breakdown and explanation for the patient",
          "medicine_list": [
            {
              "name": "Medicine Name",
              "dosage": "Dosage info",
              "timing": "When to take",
              "purpose": "Simple explanation of why this is prescribed",
              "side_effects": "Common side effects to watch for"
            }
          ],
          "lab_results": [
            {
              "parameter": "Test Name",
              "value": "Result value",
              "is_abnormal": true/false,
              "explanation": "Simple explanation of this result"
            }
          ]
        }
      `;

      const result = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const analysis = JSON.parse(result.text || "{}");
      res.json(analysis);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "Failed to perform AI analysis", details: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
