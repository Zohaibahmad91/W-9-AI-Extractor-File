
import { GoogleGenAI, Type } from "@google/genai";
import { W9Data } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const W9_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    businessName: {
      type: Type.STRING,
      description: "Name as shown on your income tax return (Line 1).",
    },
    disregardedEntityName: {
      type: Type.STRING,
      description: "Business name/disregarded entity name, if different from above (Line 2).",
    },
    taxClassification: {
      type: Type.STRING,
      description: "Check the appropriate box for federal tax classification (Line 3). Examples: Individual/sole proprietor, C Corporation, S Corporation, Partnership, Trust/estate, Limited liability company, Other.",
    },
    otherClassification: {
      type: Type.STRING,
      description: "If 'Other' was selected, specify the classification.",
    },
    address: {
      type: Type.STRING,
      description: "Address (number, street, and apt. or suite no.) (Line 5).",
    },
    cityStateZip: {
      type: Type.STRING,
      description: "City, state, and ZIP code (Line 6).",
    },
    tin: {
      type: Type.STRING,
      description: "Part I Taxpayer Identification Number (SSN or EIN).",
    }
  },
  required: ["businessName", "taxClassification", "address", "cityStateZip", "tin"],
};

export const extractW9Data = async (file: File): Promise<Partial<W9Data>> => {
  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type || 'application/pdf';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract information from this W-9 form. Be precise. If a field is empty, return an empty string. For the TIN, look specifically at Part I and capture either the SSN or the EIN provided."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: W9_SCHEMA,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No data returned from AI");

    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error extracting W9 data:", error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
