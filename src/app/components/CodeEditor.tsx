import React, { useRef, useEffect, useState, useContext } from 'react';
import { useCodeMirror } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import axios from 'axios';
import LoadingAnimation from './LoadingAnimation';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext
import { usePyodide } from '../hooks/usePyodide'; // Import usePyodide hook
import { EditorView } from "@codemirror/view";
import { eventBus } from '../utils/EventBus';

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    runCode: () => Promise<any>;
    checkCode: (evaluation: any[]) => void;
    language: 'python' | 'javascript';
    setLanguage: (language: 'python' | 'javascript') => void;
    isLoading?: boolean;
    currentProblem: {
        question: string;
        expected_output: string;
        example_1: string;
        example_2: string;
        example_3: string;
    } | null;
    setStartTimer?: (shouldStart: boolean) => void;
    moveToNextProblem: () => void;
    mode?: 'single' | 'multiplayer';
    gameStarted: boolean;
    isDisabled?: boolean;
    isSubmitBlocked?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    code,
    setCode,
    runCode,
    checkCode,
    language,
    setLanguage,
    currentProblem,
    setStartTimer,
    moveToNextProblem,
    mode,
    gameStarted,
    isDisabled = false,
    isSubmitBlocked = false,
}) => {
    const { pyodide, isLoading: isPyodideLoading } = usePyodide();
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocalAsyncAwaitActive, setIsLocalAsyncAwaitActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);  // Timer state
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Make sure you are using ThemeProvider to wrap the component.');
    }

    const { colors } = themeContext;

    // Timer handling functions
    const startTimer = () => {
        if (!timerIntervalRef.current) {
            timerIntervalRef.current = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        }
    };

    const stopTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    const resetTimer = () => {
        setElapsedTime(0);
        stopTimer();
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getDefaultCode = (lang: 'python' | 'javascript'): string => {
        switch (lang) {
            case 'python':
                return "# Write your Python code here...";
            case 'javascript':
                return "// Write your JavaScript code here...";
            default:
                return "";
        }
    };



    // Initialize the code editor with the current problem's code
    const { setContainer } = useCodeMirror({
        container: editorRef.current,
        value: code,
        height: "300px",
        extensions: [
            language === "python" ? python() : javascript(),
        ],
        onChange: (value) => {
            setCode(value);
            console.log('Code updated: ', value);  // Debug logging
        },
    });

    // Ensure the code editor is set up correctly
    useEffect(() => {
        if (editorRef.current) {
            setContainer(editorRef.current);
        }
    }, [editorRef.current, setContainer, language]);

    // Reset code when language changes
    useEffect(() => {
        setCode(getDefaultCode(language));
    }, [language, setCode]);

    const handleRunCode = async () => {
        console.log('Running code...');
        if (!currentProblem) {
            console.error("No problem selected to run code against.");
            return;
        }
        setIsRunning(true);
        try {
            await runCode();
        } catch (error) {
            console.error("Error running code:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        console.log('Submitting code:', code);
        if (!currentProblem) {
            alert("No problem selected.");
            return;
        }

        setIsSubmitting(true);

        try {
            const evaluationResults = await runCode();

            if (evaluationResults) {
                checkCode(evaluationResults);

                const allCorrect = evaluationResults.every((result: any) => result.isCorrect);

                // Stop the timer if the code is correct
                if (allCorrect) {
                    stopTimer();  // Stop the timer on successful code submission
                }
            }
        } catch (error) {
            console.error("Error submitting code:", error);
            alert("An error occurred while submitting the code.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isSubmitBlocked || isLocalAsyncAwaitActive) {
            stopTimer();
        } else if (gameStarted) {
            startTimer();
        } else {
            resetTimer();
        }
    }, [gameStarted, isSubmitBlocked, isLocalAsyncAwaitActive]);

    useEffect(() => {
        setElapsedTime(0);
    }, [currentProblem]);

    useEffect(() => {
        const handleAsyncAwait = () => {
            setIsLocalAsyncAwaitActive(true);
            setTimeout(() => {
                setIsLocalAsyncAwaitActive(false);
            }, 30000); // 30 seconds
        };
        window.addEventListener('asyncAwaitActivated', handleAsyncAwait);
        return () => window.removeEventListener('asyncAwaitActivated', handleAsyncAwait);
    }, []);

    useEffect(() => {
        return () => stopTimer();
    }, []);

    return (
        <div
            id="code-editor"
            style={{
                width: '48%',
                backgroundColor: colors.background,
                padding: '20px',
                borderRadius: '15px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '300px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                color: colors.text,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.25em',
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ color: colors.text }}>Code Interpreter</h3>
                {/* Timer Display */}
                <div style={{ fontSize: '1.25em', color: colors.text }}>Timer: {formatTime(elapsedTime)}</div>
            </div>

            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'python' | 'javascript')}
                style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.text}`,
                    cursor: 'pointer',
                    appearance: 'none',
                    transition: 'background-color 0.3s ease',
                }}
            >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
            </select>

            <div ref={editorRef} style={{ marginTop: "10px" }} />

            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
                <button
                    onClick={handleRunCode}
                    style={{
                        backgroundColor: (isRunning || isSubmitting || isDisabled) ? '#555' : colors.buttonBackground,
                        color: colors.buttonTextRun,
                        padding: '10px',
                        borderRadius: '10px',
                        cursor: (isRunning || isSubmitting || isDisabled) ? 'not-allowed' : 'pointer',
                        fontSize: '25px',
                        opacity: isDisabled ? 0.5 : 1
                    }}
                    disabled={isRunning || isSubmitting || isDisabled}
                    title={isDisabled ? "Start the game to run code!" : ""}
                >
                    {isRunning ? <LoadingAnimation /> : "Run Code"}
                </button>

                <button
                    onClick={handleSubmitCode}
                    style={{
                        backgroundColor: (isRunning || isSubmitting || isDisabled || isSubmitBlocked) ? '#555' : colors.buttonBackground,
                        color: colors.buttonTextSubmit,
                        padding: '10px',
                        borderRadius: '10px',
                        cursor: (isRunning || isSubmitting || isDisabled || isSubmitBlocked) ? 'not-allowed' : 'pointer',
                        fontSize: '25px',
                        opacity: (isDisabled || isSubmitBlocked) ? 0.5 : 1
                    }}
                    disabled={isRunning || isSubmitting || isDisabled || isSubmitBlocked}
                    title={isDisabled ? "Start the game to submit code!" : (isSubmitBlocked ? "Opponent activated Async Await! Submissions are blocked for 30s." : "")}
                >
                    {isSubmitting ? <LoadingAnimation /> : "Submit Code"}
                </button>
            </div>
        </div>
    );
};

export default CodeEditor;
