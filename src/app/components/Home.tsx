'use client';

import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import Navbar from './Navbar';
import ProblemDescription from './ProblemDescription';
import CodeEditor from './CodeEditor';
import CodeOutput from './CodeOutput';
import Modal from './Modals';
import { runCode } from '../utils/codeUtils';
import { usePyodide } from '../hooks/usePyodide';
import NavigationModal from './NavigationModal';
import PowerUpsBar from './PowerUpsBar';
import WrappedMultipleQuestionRetriever from './WrappedMultipleQuestionRetriever';  // Import the retriever
import { ThemeContext } from '../../context/ThemeContext';  // Import ThemeContext
import { useAuth } from '../context/AuthContext';

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

const Home: React.FC = () => {
    const [output, setOutput] = useState<string>("");
    const [language, setLanguage] = useState<'python' | 'javascript'>('python');
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [validatorOutput, setValidatorOutput] = useState<string>("");
    const [isValidating, setIsValidating] = useState(false);
    const [showHostModal, setShowHostModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [exampleOutputs, setExampleOutputs] = useState<{
        name: string;
        userOutput: string;
        expectedOutput: string;
        evaluation?: string;
        isCorrect: boolean;
    }[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [connectedPlayers, setConnectedPlayers] = useState<boolean[]>([false, false]);
    const [mode, setMode] = useState<"multiplayer" | "single">("single");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [roomCode, setRoomCode] = useState<string>('');
    const [serverStatus, setServerStatus] = useState<string>('');
    const { user } = useAuth();
    const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(() => Math.floor(Math.random() * 1000));
    const [problemSet, setProblemSet] = useState<Question[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null);
    const myPlayerIndexRef = useRef<number | null>(null);
    const [matchResult, setMatchResult] = useState<"win" | "lose" | "draw" | null>(null);

    const [isFlashed, setIsFlashed] = useState<boolean>(false);
    const [trashTalkMessage, setTrashTalkMessage] = useState<string | null>(null);
    const [flashOpacity, setFlashOpacity] = useState<number>(0);
    const [isSubmitBlocked, setIsSubmitBlocked] = useState<boolean>(false);
    
    const [hasUsedPowerup, setHasUsedPowerup] = useState<boolean>(false);
    const [powerupNotification, setPowerupNotification] = useState<string | null>(null);
    const [showSinglePlayerWin, setShowSinglePlayerWin] = useState<boolean>(false);
    
    const [hasClickedNext, setHasClickedNext] = useState<boolean>(false);

    const isOpponentPowerupActive = isFlashed || isSubmitBlocked || (trashTalkMessage !== null);

    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Make sure you are using ThemeProvider to wrap the component.');
    }

    const { colors } = themeContext;
    const { pyodide } = usePyodide();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const toggleModal = () => {
        setIsModalVisible(prev => !prev);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalVisible(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const moveToNextProblem = (nextIndex?: number) => {
        if (nextIndex !== undefined) {
            setCurrentProblemIndex(nextIndex);
        } else {
            setCurrentProblemIndex(Math.floor(Math.random() * 1000));
        }
    };

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setWs(socket);

        socket.onopen = () => {
            console.log("WebSocket connection established globally");
        };

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (data.type === 'playerJoined') {
                if (myPlayerIndexRef.current === null && data.playerIndex === 0) {
                    setMyPlayerIndex(0);
                    myPlayerIndexRef.current = 0;
                }
                setConnectedPlayers((prev) => {
                    const updated = [...prev];
                    updated[data.playerIndex] = true;
                    return updated;
                });
            } else if (data.type === "roomCreated") {
                setRoomCode(data.roomCode);
                if (data.startingIndex !== undefined) {
                    setCurrentProblemIndex(data.startingIndex);
                }
            } else if (data.type === "joinedRoom") {
                setRoomCode(data.roomCode);
                if (data.startingIndex !== undefined) {
                    setCurrentProblemIndex(data.startingIndex);
                }
                setServerStatus(`Successfully joined room: ${data.roomCode}`);
                setMyPlayerIndex(1);
                myPlayerIndexRef.current = 1;
                setConnectedPlayers([true, true]);
                setShowJoinModal(false);
            } else if (data.type === "error") {
                setServerStatus(data.message);
            } else if (data.type === "matchResult") {
                if (myPlayerIndexRef.current === data.winnerIndex) {
                    setMatchResult("win");
                } else {
                    setMatchResult("lose");
                }
            } else if (data.type === "bothFinished") {
                setMatchResult("draw");
            } else if (data.type === "nextQuestion") {
                moveToNextProblem(data.nextIndex);
                setMatchResult(null);
                setIsCorrect(null);
                setHasUsedPowerup(false);
                setHasClickedNext(false);
            } else if (data.type === "playerLeft") {
                setConnectedPlayers((prev) => {
                    const updated = [...prev];
                    updated[data.playerIndex] = false;
                    return updated;
                });
                if (data.playerIndex !== myPlayerIndexRef.current) {
                    alert('Your opponent has left the room.');
                    setServerStatus('Opponent left the room.');
                }
            } else if (data.type === "powerUp") {
                setPowerupNotification(`Opponent used ${data.name}!`);
                setTimeout(() => setPowerupNotification(null), 4000);

                if (data.name === 'Flashbang') {
                    setIsFlashed(true);
                    setTimeout(() => {
                        setIsFlashed(false);
                    }, 3000);
                } else if (data.name === 'Critical Hit') {
                    setCode((prevCode: string) => {
                        const lines = prevCode.split('\n');
                        const validLineIndices: number[] = [];
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (line.trim() === '') continue;
                            if (/^\s*(def|function|class)\b/.test(line)) continue;
                            if (line.includes('=>')) continue;
                            validLineIndices.push(i);
                        }
                        
                        if (validLineIndices.length > 0) {
                            const randomIndex = validLineIndices[Math.floor(Math.random() * validLineIndices.length)];
                            lines.splice(randomIndex, 1);
                            return lines.join('\n');
                        }
                        return prevCode;
                    });
                } else if (data.name === 'Trash Talk') {
                    setTrashTalkMessage(data.message || "You suck!");
                } else if (data.name === 'Async Await') {
                    setIsSubmitBlocked(true);
                    setTimeout(() => setIsSubmitBlocked(false), 30000);
                } else if (data.name === 'Bad Trip') {
                    if (themeContext) {
                        themeContext.setTheme('ludicrous');
                    }
                }
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
            socket.close();
        };
    }, []);

    useEffect(() => {
        if (mode === 'multiplayer' && connectedPlayers[0] && connectedPlayers[1]) {
            setGameStarted(true);
        } else if (mode === 'multiplayer' && (!connectedPlayers[0] || !connectedPlayers[1])) {
            setGameStarted(false);
        }
    }, [mode, connectedPlayers]);

    const handleProblemFetched = useCallback((questions: Question | Question[] | null) => {
        if (questions) {
            if (Array.isArray(questions) && questions.length > 0) {
                setProblemSet(questions);
            } else if (mode === "single" && questions) {
                const singleQuestion = questions as Question;
                setProblemSet([singleQuestion]);
            }
        }
    }, [mode]);

    const handleCheckCode = (evaluationResults: any[]) => {
        setExampleOutputs(evaluationResults);
        const allCorrect = evaluationResults.every((result) => result.isCorrect);
        setIsCorrect(allCorrect);

        if (allCorrect) {
            if (mode === "multiplayer" && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'playerFinished', roomCode }));
            } else if (mode === "single") {
                setShowSinglePlayerWin(true);
            }
        }
    };

    useEffect(() => {
        if (problemSet.length > 0) {
            const problem = problemSet[currentProblemIndex % problemSet.length];
            setCurrentQuestion(problem);
            const fallbackCode = language === 'python' ? "# Please restart your backend server to load templates" : "// Please restart your backend server to load templates";
            setCode((language === 'python' ? problem.python_template : problem.javascript_template) || fallbackCode);
            setExampleOutputs([]);
            setActiveTab(0);
        }
    }, [problemSet, currentProblemIndex, language]);

    const handleRunCode = async () => {
        return await runCode(language, code, pyodide, currentQuestion, setOutput, setExampleOutputs, setActiveTab);
    };

    const [code, setCode] = useState<string>("# Write your Python code here...");

    const currentQuestionItem = problemSet.length > 0 ? problemSet[currentProblemIndex % problemSet.length] : null;

    const handleLeaveRoom = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'leaveRoom', roomCode }));
        }
        setRoomCode('');
        setConnectedPlayers([false, false]);
        setMyPlayerIndex(null);
        myPlayerIndexRef.current = null;
        setMatchResult(null);
        setServerStatus('Left the room.');
        
        setCurrentProblemIndex(Math.floor(Math.random() * 1000));
        setProblemSet([]);
        setIsFlashed(false);
        setTrashTalkMessage(null);
        setIsSubmitBlocked(false);
        setHasUsedPowerup(false);
        setPowerupNotification(null);
        setIsCorrect(null);
        setGameStarted(false);
        setHasClickedNext(false);
    };

    return (
        <>
            {powerupNotification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ff4c4c',
                    color: '#fff',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    zIndex: 10001,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    animation: 'slideDown 0.5s, fadeOut 0.5s 3.5s forwards'
                }}>
                    <style>{`
                        @keyframes slideDown {
                            from { top: -50px; opacity: 0; }
                            to { top: 20px; opacity: 1; }
                        }
                        @keyframes fadeOut {
                            to { opacity: 0; visibility: hidden; }
                        }
                    `}</style>
                    {powerupNotification}
                </div>
            )}

            {trashTalkMessage && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10000,
                    animation: 'bounceIn 0.5s',
                }}>
                    <style>{`
                        @keyframes bounceIn {
                            0% { transform: scale(0.1); opacity: 0; }
                            60% { transform: scale(1.2); opacity: 1; }
                            100% { transform: scale(1); }
                        }
                        @keyframes shake {
                            0% { transform: translate(1px, 1px) rotate(0deg); }
                            10% { transform: translate(-1px, -2px) rotate(-1deg); }
                            20% { transform: translate(-3px, 0px) rotate(1deg); }
                            30% { transform: translate(3px, 2px) rotate(0deg); }
                            40% { transform: translate(1px, -1px) rotate(1deg); }
                            50% { transform: translate(-1px, 2px) rotate(-1deg); }
                            60% { transform: translate(-3px, 1px) rotate(0deg); }
                            70% { transform: translate(3px, 1px) rotate(-1deg); }
                            80% { transform: translate(-1px, -1px) rotate(1deg); }
                            90% { transform: translate(1px, 2px) rotate(0deg); }
                            100% { transform: translate(1px, -2px) rotate(-1deg); }
                        }
                    `}</style>
                    <div style={{
                        backgroundColor: '#ff4c4c',
                        padding: '50px',
                        borderRadius: '20px',
                        border: '10px solid #fff',
                        textAlign: 'center',
                        maxWidth: '80%',
                        boxShadow: '0 0 50px rgba(255, 76, 76, 0.8)',
                        animation: 'shake 0.5s infinite'
                    }}>
                        <h1 style={{ fontSize: '4rem', color: '#fff', textTransform: 'uppercase', marginBottom: '20px', textShadow: '2px 2px 4px #000' }}>
                            Incoming Message!
                        </h1>
                        <p style={{ fontSize: '2rem', color: '#fff', marginBottom: '40px', fontWeight: 'bold' }}>
                            "{trashTalkMessage}"
                        </p>
                        <button 
                            onClick={() => setTrashTalkMessage(null)}
                            style={{
                                fontSize: '1.5rem',
                                padding: '15px 40px',
                                backgroundColor: '#fff',
                                color: '#ff4c4c',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}
                        >
                            Whatever.
                        </button>
                    </div>
                </div>
            )}

            {isFlashed && (
                <>
                    <style>{`
                        @keyframes flashbangWhite {
                            0% { opacity: 1; }
                            15% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                        @keyframes flashbangBlur {
                            0% { filter: blur(15px) brightness(1.5); }
                            15% { filter: blur(15px) brightness(1.5); }
                            100% { filter: blur(0px) brightness(1); }
                        }
                        .flash-overlay {
                            animation: flashbangWhite 3s ease-out forwards;
                        }
                        .flash-blur {
                            animation: flashbangBlur 3s ease-out forwards;
                        }
                    `}</style>
                    <div
                        className="flash-overlay"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: '#ffffff',
                            zIndex: 9999,
                            pointerEvents: 'all'
                        }}
                    />
                </>
            )}
            <div className={isFlashed ? "flash-blur" : ""} style={{ fontFamily: "JetBrains Mono", color: colors.text, backgroundColor: colors.background, minHeight: "100vh", pointerEvents: isFlashed ? 'none' : 'auto' }}>
            {showSinglePlayerWin && mode === 'single' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: colors.cardBackground, padding: '40px', borderRadius: '15px', textAlign: 'center', minWidth: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative' }}>
                        <button 
                            onClick={() => setShowSinglePlayerWin(false)}
                            style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: colors.text, fontSize: '1.5em', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <h2 style={{ color: '#43A146', fontSize: '2.5em', marginBottom: '20px' }}>
                            Success!
                        </h2>
                        <p style={{ color: colors.text, fontSize: '1.2em', marginBottom: '20px' }}>All test cases passed.</p>
                        <button
                            style={{
                                width: '100%',
                                backgroundColor: colors.buttonBackground,
                                color: colors.buttonTextRun,
                                padding: '15px',
                                fontSize: '1.2em',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginTop: '10px'
                            }}
                            onClick={() => {
                                setShowSinglePlayerWin(false);
                                moveToNextProblem();
                            }}
                        >
                            Next Question
                        </button>
                    </div>
                </div>
            )}

            {matchResult && mode === 'multiplayer' && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: colors.cardBackground, padding: '40px', borderRadius: '15px', textAlign: 'center', minWidth: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            <h2 style={{ color: matchResult === 'win' ? '#43A146' : matchResult === 'lose' ? '#ff4c4c' : '#aaaaaa', fontSize: '2.5em', marginBottom: '20px' }}>
                                {matchResult === 'win' ? 'You Won!' : matchResult === 'lose' ? 'You Lost!' : 'Draw!'}
                            </h2>
                            {!hasClickedNext ? (
                                <>
                                    <button
                                        style={{
                                            width: '100%',
                                            backgroundColor: colors.buttonBackground,
                                            color: colors.text,
                                            padding: '15px',
                                            fontSize: '1.2em',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            marginTop: '10px'
                                        }}
                                        onClick={() => {
                                            if (ws && ws.readyState === WebSocket.OPEN) {
                                                ws.send(JSON.stringify({ type: 'readyForNext', roomCode }));
                                                setHasClickedNext(true);
                                            }
                                        }}
                                    >
                                        Next Question
                                    </button>
                                    <button
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#ff4c4c',
                                            color: '#fff',
                                            padding: '15px',
                                            fontSize: '1.2em',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            marginTop: '10px'
                                        }}
                                        onClick={handleLeaveRoom}
                                    >
                                        Leave Room
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p style={{ color: '#aaaaaa', fontSize: '1.2em', marginBottom: '20px' }}>Waiting for opponent input...</p>
                                    <button
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#ff4c4c',
                                            color: '#fff',
                                            padding: '15px',
                                            fontSize: '1.2em',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            marginTop: '10px'
                                        }}
                                        onClick={handleLeaveRoom}
                                    >
                                        Leave Room
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div style={{ fontSize: "2em", display: "flex", justifyContent: "center", padding: "20px" }}>
                    coderace.io
                </div>

                <div style={{ width: "80%", margin: "0 auto" }}>
                    <Navbar
                        setShowJoinModal={setShowJoinModal}
                        setShowHostModal={setShowHostModal}
                        mode={mode}
                        setMode={setMode}
                        connectedPlayers={connectedPlayers}
                        user={user}
                        roomCode={roomCode}
                        leaveRoom={handleLeaveRoom}
                    />
                    
                    <WrappedMultipleQuestionRetriever
                        onQuestionsFetched={handleProblemFetched}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <ProblemDescription
                            mode={mode}
                            isConnected={connectedPlayers.some(Boolean)}
                            ws={ws}
                            roomCode={roomCode}
                            playerCount={connectedPlayers.filter(Boolean).length}
                            onStartMatch={() => setGameStarted(true)}
                            validatorOutput={validatorOutput}
                            isCorrect={isCorrect}
                            onProblemFetched={handleProblemFetched}
                            moveToNextProblem={moveToNextProblem}
                            currentProblemIndex={currentProblemIndex}
                            setStartTimer={() => { }}
                            gameStarted={gameStarted}
                            currentQuestion={currentQuestion}
                        />

                        {/* PlayerConnectionStatus handles all WebSocket connection logic */}

                        {mode === "multiplayer" && (
                            <div style={{ padding: "0 10px", opacity: mode === 'single' ? 0.5 : 1, pointerEvents: mode === 'single' ? 'none' : 'auto' }}>
                                <PowerUpsBar 
                                    ws={ws} 
                                    roomCode={roomCode} 
                                    hasUsedPowerup={hasUsedPowerup}
                                    isOpponentPowerupActive={isOpponentPowerupActive}
                                    onPowerupUsed={() => setHasUsedPowerup(true)}
                                />
                            </div>
                        )}

                        <CodeEditor
                            code={code}
                            setCode={setCode}
                            runCode={handleRunCode}  // This is the function handling the code execution
                            checkCode={handleCheckCode}  // This checks whether the code output is correct
                            language={language}
                            setLanguage={setLanguage}
                            currentProblem={currentQuestion}  // Pass the current problem here
                            moveToNextProblem={moveToNextProblem}  // Move to the next problem when correct
                            gameStarted={gameStarted}
                            isDisabled={!gameStarted}
                            isSubmitBlocked={isSubmitBlocked}
                        />
                    </div>

                    <CodeOutput
                        exampleOutputs={exampleOutputs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        validatorOutput={validatorOutput}
                        isValidating={isValidating}
                        isCorrect={isCorrect}
                        code={code}
                        language={language}
                    />

                </div>

                <Modal
                    show={showHostModal}
                    handleClose={() => setShowHostModal(false)}
                    isHostModal={true}
                    ws={ws}
                    roomCode={roomCode}
                    serverStatus={serverStatus}
                />
                <Modal
                    show={showJoinModal}
                    handleClose={() => setShowJoinModal(false)}
                    isHostModal={false}
                    ws={ws}
                    roomCode={roomCode}
                    serverStatus={serverStatus}
                />

                <div>
                    {/* Modal is triggered by Escape and closed by buttons inside the modal */}
                    <NavigationModal
                        isVisible={isModalVisible}
                        onClose={() => setIsModalVisible(false)}  // Close the modal via buttons inside
                    />
                </div>
            </div>
        </>
    );
};

export default Home;