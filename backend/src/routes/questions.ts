import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const questionsRouter = Router();

interface TestCase {
    input: string;
    expected_output: string;
    python_driver: string;
    javascript_driver: string;
}

interface Question {
    id: number;
    difficulty: string;
    question: string;
    python_template: string;
    javascript_template: string;
    test_cases: TestCase[];
}

// In-memory cache for questions
let cachedQuestions: Question[] = [];

const loadQuestions = (): Question[] => {
    const candidatePaths = [
        path.join(__dirname, '../data/questions.json'),
        path.join(__dirname, '../../src/data/questions.json'),
        path.join(process.cwd(), 'src/data/questions.json'),
        path.join(process.cwd(), 'backend/src/data/questions.json')
    ];

    for (const filePath of candidatePaths) {
        if (fs.existsSync(filePath)) {
            try {
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const parsed = JSON.parse(fileContents);
                const questions = (parsed.questions || parsed) as Question[];
                console.log(`✅ Loaded ${questions.length} questions from ${filePath}`);
                return questions;
            } catch (error) {
                console.error(`Error parsing questions file at ${filePath}:`, error);
            }
        }
    }

    console.warn('⚠️ Warning: questions.json not found in candidate paths. Initializing with empty list.');
    return [];
};

// Pre-load questions into memory on module load
cachedQuestions = loadQuestions();

questionsRouter.get('/', (req: Request, res: Response) => {
    // If cache is empty, attempt reload once
    if (cachedQuestions.length === 0) {
        cachedQuestions = loadQuestions();
    }

    const { difficulty } = req.query;
    if (!difficulty || typeof difficulty !== 'string') {
        return res.json(cachedQuestions);
    }

    const filtered = cachedQuestions.filter(
        q => q.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
    res.json(filtered);
});
