import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, language, input, expected_output, error_message } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Missing code" });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API key is not configured.' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
You are a helpful and encouraging coding tutor. A student has written some ${language || 'code'} that is failing a test case.

User's Code:
\`\`\`${language || ''}
${code}
\`\`\`

${input ? `Test Case Input:\n${input}\n` : ''}
${expected_output ? `Expected Output:\n${expected_output}\n` : ''}
${error_message ? `Runtime Error/Actual Output:\n${error_message}\n` : ''}

Provide a brief, encouraging hint to help the student find their mistake. 
Do NOT give away the exact solution or write the corrected code for them. 
Focus on what concept they might be missing or where they should look in their code. Keep it under 3-4 sentences. Format your response in clean markdown, but DO NOT use LaTeX or math formatting (like $ or $$). Use standard text for numbers and operators.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        return res.status(200).json({ hint: response.text });

    } catch (error: any) {
        console.error('Error with Gemini API:', error);
        return res.status(500).json({
            error: 'Failed to generate hint.',
            details: error.message,
        });
    }
}
