import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Lead } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

// This function is now ONLY intended for SERVER-SIDE use.
// The API_KEY is securely read from environment variables on the server.
export const parseLeadInfoWithGemini = async (rawText: string): Promise<Partial<Lead>> => {
  console.log("Starting Gemini parsing for:", rawText);
  
  const key = process.env.API_KEY;

  if (!key) {
    throw new Error("Gemini API key is not configured on the server.");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  const prompt = `Extract lead info from this text as JSON: "${rawText}". 

Return only JSON with these fields (omit if not found): firstName, lastName, address, time, claimInfo.

Example: {"firstName": "John", "lastName": "Smith", "address": "123 Main St"}`;

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Gemini API timeout after 5 seconds")), 5000);
  });

  // Main API call promise
  const apiCallPromise = async (): Promise<Partial<Lead>> => {
    try {
      console.log("Sending request to Gemini API...");
      const startTime = Date.now();
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 200,
        },
      });
      
      const endTime = Date.now();
      console.log(`Gemini response received in ${endTime - startTime}ms`);

      let jsonStr = response.text?.trim() || '';
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedData = JSON.parse(jsonStr) as Partial<Lead>;
      return parsedData;

    } catch (error) {
      console.error("Error calling Gemini API or parsing response:", error);
      if (error instanceof Error) {
          throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error("An unknown error occurred while communicating with the AI.");
    }
  };

  // Race between API call and timeout
  return Promise.race([apiCallPromise(), timeoutPromise]);
};