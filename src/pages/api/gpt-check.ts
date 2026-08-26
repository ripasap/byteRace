import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, expected_output } = req.body;

    if (!code || !expected_output) {
        return res.status(400).json({ error: "Missing code or expected_output" });
    }

    try {
        // We use the public Piston API for free code execution
        const response = await axios.post(
            'https://emkc.org/api/v2/piston/execute',
            {
                language: 'python',
                version: '3.10.0', // Piston supports 3.10.0
                files: [
                    {
                        content: code
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const runResult = response.data.run;
        
        // If there is an error during execution
        if (runResult.stderr) {
            return res.status(200).json({
                evaluation: `Error during execution:\n${runResult.stderr}`,
                isCorrect: false
            });
        }

        const actualOutput = runResult.stdout.trim();
        const expected = expected_output.trim();

        const isCorrect = actualOutput === expected;

        let evaluation = isCorrect 
            ? "Correct! Your code produced the expected output." 
            : `Incorrect. Expected:\n${expected}\n\nBut got:\n${actualOutput || 'No output'}`;

        // Send both the evaluation text and whether it's correct
        return res.status(200).json({ evaluation, isCorrect });

    } catch (error: any) {
        console.error('Error with Piston API:', error.response?.data || error.message);
        return res.status(500).json({
            error: 'Failed to evaluate code.',
            details: error.response?.data || error.message,
        });
    }
}