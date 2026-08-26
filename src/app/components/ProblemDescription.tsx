import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ThemeContext } from '../../context/ThemeContext';  // Import ThemeContext
import questionsData from '../data/questions.json';

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

interface ProblemDescriptionProps {
    mode: "multiplayer" | "single";
    isConnected: boolean;
    ws: WebSocket | null;
    roomCode: string;
    playerCount: number;
    onStartMatch: () => void;
    validatorOutput: string;
    isCorrect: boolean | null;
    onProblemFetched: (problem: Question | null) => void;
    moveToNextProblem: () => void;
    currentProblemIndex: number;
    setStartTimer: (shouldStart: boolean) => void;
    gameStarted: boolean;
    currentQuestion: Question | null;
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
    mode,
    isConnected,
    ws,
    roomCode,
    playerCount,
    onStartMatch,
    validatorOutput,
    isCorrect,
    onProblemFetched,
    moveToNextProblem,
    currentProblemIndex,
    setStartTimer,
    gameStarted,
    currentQuestion
}) => {
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [isQuestionBlurred, setIsQuestionBlurred] = useState(true);
    const [showNextButton, setShowNextButton] = useState(false); // Show "Next" button after correct answer

    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors } = themeContext;

    const activeQuestion = currentQuestion;

    // React to the parent's gameStarted prop
    useEffect(() => {
        if (gameStarted) {
            setIsQuestionBlurred(false);
            setHasGameStarted(true);
            setStartTimer(true);
        } else if (mode === 'multiplayer' || mode === 'single') {
            setIsQuestionBlurred(true);
            setHasGameStarted(false);
            setStartTimer(false);
        }
    }, [gameStarted, mode, setStartTimer]);

    // Handle Start Game
    const handleStartGame = () => {
        setIsQuestionBlurred(false);
        setStartTimer(true);
        setHasGameStarted(true);
        onStartMatch();
    };



    return (
        <div
            style={{
                width: '48%',
                backgroundColor: colors.background,
                padding: '10px',
                borderRadius: '10px', // Adjusted border-radius
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start', // Align items to the top
                minHeight: '300px', // Ensure the height remains constant
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                color: colors.text,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: "1.25em",
            }}
        >

            {/* Problem Info */}
            <div style={{ width: '100%', filter: isQuestionBlurred ? 'blur(5px)' : 'none', transition: 'filter 0.3s ease' }}>
                <h3>{activeQuestion?.question || "Waiting for question to load..."}</h3>
                <p><strong>Difficulty:</strong> <span style={{ color: activeQuestion?.difficulty === 'easy' ? 'green' : activeQuestion?.difficulty === 'medium' ? 'orange' : 'red' }}>
                    {activeQuestion?.difficulty}
                </span></p>
                <div style={{ marginTop: '10px' }}>
                    <strong>Test Cases:</strong>
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {activeQuestion?.test_cases.map((testCase, index) => (
                            <li key={index} style={{ marginBottom: '10px', backgroundColor: colors.buttonBackground, padding: '10px', borderRadius: '5px' }}>
                                <div><strong>Input:</strong> <span style={{ fontFamily: 'monospace', color: colors.buttonTextRun }}>{testCase.input}</span></div>
                                <div><strong>Expected Output:</strong> <span style={{ fontFamily: 'monospace', color: colors.buttonTextSubmit }}>{testCase.expected_output}</span></div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>


            {/* Start Game Button */}
            {!hasGameStarted && mode === 'single' && (
                <button
                    onClick={handleStartGame}
                    style={{
                        backgroundColor: colors.buttonBackground,
                        color: colors.buttonTextRun,
                        padding: '10px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '16px', // Adjusted font-size for better alignment
                        marginTop: '10px',  // Adjusted margin-top
                        border: 'none',
                    }}
                >
                    Start Game
                </button>
            )}
        </div>
    );
};

export default ProblemDescription;
