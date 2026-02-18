
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPushInstructions = async (subscriptionJson: string) => {
  const prompt = `
    I have a Web Push Subscription JSON:
    ${subscriptionJson}

    Please provide a comprehensive guide for a senior engineer to set up a Cloudflare Worker as a Push Server:
    1. Instructions to generate VAPID keys (e.g., using 'npx web-push generate-vapid-keys').
    2. A complete, copy-pasteable Cloudflare Worker script (using the 'web-push' library or native fetch if possible) that takes a POST request and sends a notification to this device.
    3. How to store the VAPID Private Key as an environment variable in the Cloudflare dashboard.
    4. A quick cURL command to test the Worker once deployed.

    Format the response with clear headings and code blocks. Make it highly technical and concise.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};
