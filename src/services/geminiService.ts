import { GoogleGenAI, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeMedicalImages = async (images: { base64: string, mimeType: string }[], retries = 2) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }
  
  const model = "gemini-3.5-flash";
  
  const prompt = `
    You are RXDecode Clinical AI, an extremely powerful, high-precision evidence-aware medical report OCR and interpretation assistant.
    Your absolute top priority is extreme, surgical textual accuracy. You must read every single word, number, decimal point, prefix, symbol, and micro-detail printed on the document with 100% precision. Medical professionals and patients count on your precision.

    OCR & INFORMATION EXTRACTION RULES:
    1. EXTREME PRECISION: Identify patient and laboratory metadata with incredible accuracy. Scan all edges, corners, headers, footers, stamps, and small fonts for any printed text.
    2. BLUR, ROTATION, & LOW-LIGHT HANDLING: Handle blurred, rotated, or low-light document images by performing a multi-step verification process, confirming extracted data against secondary markers found elsewhere on the page (such as structured page boundaries, administrative headers/footers, barcode metadata, or unit alignments) to guarantee flawless transcription confidence.
    3. PATIENT BIO: Find patient's full name ("name"), age ("age"), and sex/gender ("gender") if on the document. Never assume or synthesize fake names/fallback names.
    4. SOURCE & CLINICAL DETAILS: Locate the testing laboratory, clinic, or hospital name ("lab_name"), the prescribing or attending Dr./physician ("doctor_name"), and the exact collection/report date ("test_date").
    5. ACCURATE NUMERIC DATA: For all parameter entries in lab results:
       - Transcribe the exact parameter name completely (do not shorten or truncate, e.g. "Thyroid Stimulating Hormone (TSH)" not just "TSH").
       - Pay flawless attention to decimal points (e.g., 2.3 vs 23) and comparison symbols (e.g. "<", ">").
       - Transcribe exact units (e.g. pg, fL, mg/dL, mmol/L) and reference range values exactly as written.
       - Analyze whether the found value falls below, within, or above the laboratory's specific normal reference range and flag it ("Low|Normal|High") accordingly.

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
      "patient_details": {
        "name": "Full name of the patient as literally printed on the document (or null if not found)",
        "age": "Age of the patient as printed (e.g., '36 Years', '28') (or null if not found)",
        "gender": "Gender / Sex of the patient as printed (e.g., 'Male', 'Female') (or null if not found)",
        "lab_name": "Full name of the laboratory or facility where the test was conducted (or null if not found)",
        "doctor_name": "Name of the presenting physician or primary doctor (or null if not found)",
        "test_date": "Exact report or collection date (e.g., 'May 21, 2026') (or null if not found)"
      },
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
