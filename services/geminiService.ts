
import { GoogleGenAI, Type } from '@google/genai';
import { VerificationResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const prompt = `
You are an advanced facial recognition system with implicit liveness detection.
You will be given the following:
1. A single live capture from a webcam.
2. A set of registered user's profile photos, showing them from slightly different angles to create a robust profile.

Your tasks are:
1.  **Liveness Check:** Analyze the live webcam capture. Determine if it's a real, live person or a spoof attempt (e.g., a photo of a photo, a screen). Look for cues like natural lighting, reflections, skin texture, and subtle signs of three-dimensionality.
2.  **Identity Check:** Compare the person in the live capture with the person shown in the set of profile photos. The photo set provides a more reliable representation of the user. Determine if they are the same individual.

You MUST respond ONLY with a valid JSON object in the following format. Do not include any other text, explanations, or markdown formatting like \`\`\`json.

{
  "isLive": <boolean>,
  "livenessReason": "<string: A brief explanation for your liveness decision.>",
  "isMatch": <boolean>,
  "matchReason": "<string: A brief explanation for your identity match decision.>"
}
`;


export const verifyUser = async (liveImageBase64: string, profileImagesBase64: string[]): Promise<VerificationResult | null> => {
  try {
    const liveImagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: liveImageBase64.split(',')[1],
      },
    };

    const profileImageParts = profileImagesBase64.map(base64 => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64.split(',')[1],
        }
    }));


    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: prompt }, liveImagePart, ...profileImageParts] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isLive: { type: Type.BOOLEAN },
                    livenessReason: { type: Type.STRING },
                    isMatch: { type: Type.BOOLEAN },
                    matchReason: { type: Type.STRING },
                },
                required: ["isLive", "livenessReason", "isMatch", "matchReason"]
            }
        }
    });

    const jsonString = response.text;
    const result: VerificationResult = JSON.parse(jsonString);
    return result;

  } catch (error) {
    console.error("Error verifying user with Gemini:", error);
    return null;
  }
};