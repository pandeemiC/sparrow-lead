import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type GenerateParams = Parameters<typeof ai.models.generateContent>[0];

export async function generateContent(params: GenerateParams, retries = 3) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if ((status === 503 || status === 429) && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
}
