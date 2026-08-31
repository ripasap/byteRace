import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext
import ReactMarkdown from 'react-markdown';
import { getShadows } from '../../context/shadows';
interface CodeOutputProps {
    exampleOutputs: {
        name: string;
        userOutput: string;
        expectedOutput: string;
        input?: string;
        evaluation?: string;
        isCorrect: boolean;
    }[];
    activeTab: number;
    setActiveTab: (index: number) => void;
    validatorOutput: string;
    isValidating: boolean;
    isCorrect: boolean | null;
    code: string;
    language: string;
}

const formatErrorOutput = (output: string) => {
    let title = 'Runtime Error';
    let message = output;

    if (!output) return { title, message };

    if (message.startsWith('Error: \n')) {
        message = message.substring(8);
    } else if (message.startsWith('Error: ')) {
        message = message.substring(7);
    }

    const lines = message.split('\n');

    if (message.includes('Traceback (most recent call last):')) {
        const filteredLines = [];
        let isInternalFrame = false;
        let lastLine = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (i >= lines.length - 3 && /^[A-Z][a-zA-Z0-9]+Error:/.test(line)) {
                title = line.split(':')[0];
            } else if (i >= lines.length - 3 && line.startsWith('SyntaxError:')) {
                title = 'Syntax Error';
            }

            if (line.trim().startsWith('File "/lib/python') || line.trim().startsWith('File "/usr/local/lib/python') || line.trim().startsWith('File "/opt/')) {
                isInternalFrame = true;
                continue;
            }
            if (isInternalFrame && (line.startsWith('    ') || line.trim().startsWith('^') || line.trim().startsWith('~'))) {
                continue;
            }

            if (line.trim().startsWith('File "')) {
                isInternalFrame = false;
            }

            if (!isInternalFrame) {
                filteredLines.push(line);
            }

            if (line.trim() !== '') {
                lastLine = line;
            }
        }

        if (title === 'Runtime Error') {
            const match = lastLine.match(/^([A-Z][a-zA-Z0-9]+Error|Exception):/);
            if (match) {
                title = match[1];
                if (title === 'SyntaxError' || title === 'IndentationError') {
                    title = 'Syntax Error';
                }
            }
        }

        message = filteredLines.join('\n').trim();
    } else if (message.includes('Error:') && lines.some(l => l.trim().startsWith('at '))) {
        const filteredLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (i === 0 || (i === 1 && line.includes('Error:'))) {
                const match = line.match(/^([A-Z][a-zA-Z0-9]+Error):/);
                if (match) {
                    title = match[1];
                    if (title === 'SyntaxError') title = 'Syntax Error';
                }
            }

            if (line.trim().startsWith('at ') && (line.includes('node:internal/') || line.includes('node_modules/'))) {
                continue;
            }
            filteredLines.push(line);
        }
        message = filteredLines.join('\n').trim();
    } else {
        for (let i = 0; i < Math.min(3, lines.length); i++) {
            if (lines[i].toLowerCase().includes('syntax error')) {
                title = 'Syntax Error';
                break;
            } else if (lines[i].toLowerCase().includes('error:')) {
                const match = lines[i].match(/^([A-Za-z0-9_]+Error):/);
                if (match) {
                    title = match[1];
                }
            }
        }
    }

    return { title, message };
};

const CodeOutput: React.FC<CodeOutputProps> = ({
    exampleOutputs,
    activeTab,
    setActiveTab,
    validatorOutput,
    isValidating,
    isCorrect,
    code,
    language
}) => {
    const themeContext = useContext(ThemeContext);

    // Safety check to ensure ThemeContext is defined
    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors, theme } = themeContext;
    const currentShadows = getShadows(theme);

    // State for AI Hints
    const [aiHint, setAiHint] = useState<string | null>(null);
    const [isFetchingHint, setIsFetchingHint] = useState<boolean>(false);

    // Clear ai hint when active tab changes
    useEffect(() => {
        setAiHint(null);
    }, [activeTab]);

    const hasRequestedHint = aiHint !== null || isFetchingHint;

    const handleGetHint = async () => {
        if (!exampleOutputs[activeTab] || !code) return;

        setIsFetchingHint(true);
        setAiHint(null);

        try {
            const currentOutput = exampleOutputs[activeTab];
            const response = await fetch('/api/ai-hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    input: currentOutput.input,
                    expected_output: currentOutput.expectedOutput,
                    error_message: currentOutput.userOutput !== currentOutput.expectedOutput ? currentOutput.userOutput : undefined
                })
            });
            const data = await response.json();
            if (data.hint) {
                setAiHint(data.hint);
            } else {
                setAiHint('Could not generate a hint at this time.');
            }
        } catch (error) {
            setAiHint('An error occurred while fetching the hint.');
        } finally {
            setIsFetchingHint(false);
        }
    };



    return (
        <div
            style={{
                backgroundColor: colors.background,
                padding: '20px',
                borderRadius: '15px',
                marginTop: '20px',
                width: '100%',
                boxShadow: currentShadows.card,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                border: 'none',
            }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.5); }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: fadeIn 0.3s ease-out forwards; }
            ` }} />
            {/* Run Code Output Section with Tabs */}
            <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
                <h4 style={{ fontSize: "1.25em", color: '#888888', marginBottom: '5px', textAlign: 'center', marginTop: '0' }}>
                    Run Code Output
                </h4>

                {/* Tabs */}
                {exampleOutputs.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', alignItems: 'center' }}>
                        <div style={{ display: 'inline-flex', backgroundColor: 'rgba(128, 128, 128, 0.1)', padding: '4px', borderRadius: '12px' }}>
                            {exampleOutputs.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    style={{
                                        backgroundColor: activeTab === index ? colors.background : 'transparent',
                                        color: colors.text,
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        fontWeight: activeTab === index ? '600' : '500',
                                        transition: 'all 0.3s ease',
                                        boxShadow: activeTab === index ? currentShadows.subtle : 'none',
                                        margin: '0 2px',
                                        display: 'inline-flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {example.isCorrect ? <span style={{ color: '#43A146', marginRight: '6px', fontSize: '1.1em' }}>✓</span> : <span style={{ color: '#ff4c4c', marginRight: '6px', fontSize: '1.1em' }}>✗</span>}
                                    {example.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conditional rendering for example output */}
                {exampleOutputs.length > 0 && exampleOutputs[activeTab] ? (
                    <div
                        className="custom-scrollbar"
                        style={{
                            backgroundColor: colors.buttonBackground,
                            padding: '20px',
                            borderRadius: '10px',
                            minHeight: '150px',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            boxShadow: 'none',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            color: colors.text,
                            fontSize: "1.1em",
                            overflowY: 'auto',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div key={`output-${activeTab}`} className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            {(() => {
                                const currentOutput = exampleOutputs[activeTab];
                                const isError = currentOutput.userOutput.includes('Error:');

                                if (isError) {
                                    const { title, message } = formatErrorOutput(currentOutput.userOutput);
                                    return (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left', backgroundColor: theme === 'dark' ? '#3a1c1c' : '#f1dddd', border: theme === 'dark' ? '1px solid #5a2c2c' : '1px solid #e1c8c8', boxShadow: '0 1px 2px rgba(14, 30, 37, 0.04)', padding: '15px', borderRadius: '8px', boxSizing: 'border-box' }}>
                                            <h3 style={{ color: theme === 'dark' ? '#ff8888' : '#ff4c4c', margin: '0 0 10px 0', fontSize: '1.2em' }}>{title}</h3>
                                            <pre style={{ color: theme === 'dark' ? '#ffbaba' : '#ff4c4c', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9em' }}>
                                                {message}
                                            </pre>
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{ width: '100%' }}>
                                        <div style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}>
                                            <strong style={{ color: colors.header, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Input:</strong>
                                            <pre style={{ backgroundColor: colors.background, padding: '12px', borderRadius: '8px', marginTop: '8px', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', border: '1px solid rgba(128, 128, 128, 0.4)' }}>
                                                {currentOutput.input}
                                            </pre>
                                        </div>

                                        <div style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}>
                                            <strong style={{ color: colors.header, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Output:</strong>
                                            <pre style={{ backgroundColor: colors.background, padding: '12px', borderRadius: '8px', marginTop: '8px', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', color: currentOutput.userOutput !== currentOutput.expectedOutput ? '#ff4c4c' : colors.text, border: '1px solid rgba(128, 128, 128, 0.4)' }}>
                                                {currentOutput.userOutput}
                                            </pre>
                                        </div>

                                        <div style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}>
                                            <strong style={{ color: colors.header, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Expected Output:</strong>
                                            <pre style={{ backgroundColor: colors.background, padding: '12px', borderRadius: '8px', marginTop: '8px', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', border: '1px solid rgba(128, 128, 128, 0.4)' }}>
                                                {currentOutput.expectedOutput}
                                            </pre>
                                        </div>

                                        <div style={{ textAlign: 'left', width: '100%', marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${colors.background}` }}>
                                            <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: currentOutput.isCorrect ? '#43A146' : '#ff4c4c' }}>
                                                {currentOutput.isCorrect ? 'Accepted' : 'Wrong Answer'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                ) : (
                    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.header, textAlign: 'center', padding: '20px', opacity: 0.6 }}>
                        <span style={{ fontSize: "1.2em", fontWeight: 500 }}>No output available</span>
                        <span style={{ fontSize: "0.9em", marginTop: '5px' }}>Run your code to see the results here.</span>
                    </div>
                )}
            </div>

            {/* AI Hint Section */}
            {(() => {
                const hasOutput = exampleOutputs.length > 0 && exampleOutputs[activeTab];

                if (!hasRequestedHint) {
                    if (!hasOutput) return null;
                    return (
                        <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'center', marginTop: '10px', animation: 'fadeIn 0.3s ease-out' }}>
                            <button
                                onClick={handleGetHint}
                                disabled={exampleOutputs[activeTab].isCorrect}
                                style={{
                                    backgroundColor: 'rgba(168, 85, 247, 0.05)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    color: '#a855f7',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    cursor: exampleOutputs[activeTab].isCorrect ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: exampleOutputs[activeTab].isCorrect ? 0.6 : 1,
                                    boxShadow: '0 2px 4px rgba(168, 85, 247, 0.05)'
                                }}
                            >
                                {exampleOutputs[activeTab].isCorrect ? 'Test passed! No hint needed.' : 'Stuck? Get an AI Hint'}
                            </button>
                        </div>
                    );
                }

                return (
                    <div className="fade-in" style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ fontSize: "1.25em", color: '#888888', marginBottom: '5px', textAlign: 'center', marginTop: '0' }}>
                            AI Code Hint
                        </h4>

                        <div
                            className="custom-scrollbar"
                            style={{
                                backgroundColor: colors.buttonBackground,
                                padding: '20px',
                                borderRadius: '10px',
                                minHeight: '150px',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                color: colors.text,
                                fontSize: "1.1em",
                                overflowY: 'auto',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div key={`hint-${activeTab}`} className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                {(() => {
                                    const currentOutput = exampleOutputs[activeTab];
                                    const isError = currentOutput && currentOutput.userOutput && currentOutput.userOutput.includes('Error:');

                                    if (isError) {
                                        return (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left', backgroundColor: 'rgba(168, 85, 247, 0.05)', padding: '15px', borderRadius: '8px', boxSizing: 'border-box' }}>
                                                {aiHint ? (
                                                    <div style={{ fontFamily: 'JetBrains Mono, monospace', lineHeight: '1.6', width: '100%', color: colors.text, fontSize: '0.95em' }}>
                                                        <ReactMarkdown
                                                            components={{
                                                                code(props: any) {
                                                                    const { children, className, node, ...rest } = props;
                                                                    return (
                                                                        <code style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '2px 4px', borderRadius: '4px' }} {...rest}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            {aiHint}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, textAlign: 'center', color: colors.text, margin: 'auto' }}>
                                                        {isFetchingHint ? 'Generating analysis...' : ""}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left', backgroundColor: 'rgba(168, 85, 247, 0.05)', padding: '15px', borderRadius: '8px', boxSizing: 'border-box' }}>
                                            {aiHint ? (
                                                <div style={{ fontFamily: 'JetBrains Mono, monospace', lineHeight: '1.6', width: '100%', color: colors.text, fontSize: '0.95em' }}>
                                                    <ReactMarkdown
                                                        components={{
                                                            code(props: any) {
                                                                const { children, className, node, ...rest } = props;
                                                                return (
                                                                    <code style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '2px 4px', borderRadius: '4px' }} {...rest}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {aiHint}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', margin: 'auto' }}>
                                                    <span style={{ opacity: 0.6, color: colors.text }}>
                                                        {isFetchingHint ? 'Generating suggestion...' : ""}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default CodeOutput;
