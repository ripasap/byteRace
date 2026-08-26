import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface TestCase {
    input: string;
    expected_output: string;
    python_driver: string;
    javascript_driver: string;
}

interface Question {
    id: string;
    difficulty: string;
    question: string;
    python_template: string;
    javascript_template: string;
    test_cases: TestCase[];
}

interface QuestionRetrieverProps {
    difficulty?: string;
    onQuestionsFetched: (questions: Question[]) => void;
}

const QuestionRetriever: React.FC<QuestionRetrieverProps> = ({ difficulty, onQuestionsFetched }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const url = difficulty ? `http://localhost:4000/api/questions?difficulty=${difficulty}` : `http://localhost:4000/api/questions`;
                const res = await axios.get(url);
                onQuestionsFetched(res.data);
            } catch (err: any) {
                console.error("Error loading questions:", err.message);
                setError(err.message || 'Error fetching questions');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [difficulty, onQuestionsFetched]);

    if (loading) return <p>Loading questions...</p>;
    if (error) return <p>Error loading questions</p>;

    return null;
};

export default QuestionRetriever;