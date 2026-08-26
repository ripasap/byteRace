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

const filePath = path.join(__dirname, '../../src/data/questions.json');
questionsRouter.get('/', (req: Request, res: Response) => {
    let questionsData: Question[] = [];
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        questionsData = JSON.parse(fileContents).questions as Question[];
    } catch (error: any) {
        console.error(`Error reading questions: ${error.message}`);
        return res.status(500).json({ error: 'Failed to load questions' });
    }

    const { difficulty } = req.query;
    if (!difficulty) {
        return res.json(questionsData);
    }
    const filtered = questionsData.filter(q => q.difficulty === difficulty);
    res.json(filtered);
});
