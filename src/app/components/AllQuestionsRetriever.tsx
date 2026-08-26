import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Question {
    id: number;
    question: string;
}

interface AllQuestionsRetrieverProps {
    onQuestionsFetched: (questions: Question[] | null) => void;
}

const AllQuestionsRetriever: React.FC<AllQuestionsRetrieverProps> = ({ onQuestionsFetched }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Fetch all questions (no difficulty filter)
                const res = await axios.get('http://localhost:4000/api/questions');
                onQuestionsFetched(res.data);
            } catch (err: any) {
                console.error("Error fetching questions:", err);
                setError(err.message || 'Error fetching questions');
                onQuestionsFetched(null);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [onQuestionsFetched]);

    if (loading) return <p>Loading questions...</p>;

    if (error) return <p>Error loading questions: {error}</p>;

    return null; // This component does not render anything itself
};

export default AllQuestionsRetriever;