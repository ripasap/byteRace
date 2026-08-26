import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext
import { eventBus } from '../utils/EventBus'; // Import the event bus

interface CodeOutputProps {
    exampleOutputs: {
        name: string;
        userOutput: string;
        expectedOutput: string;
        evaluation?: string;
        isCorrect: boolean;
    }[];
    activeTab: number;
    setActiveTab: (index: number) => void;
    validatorOutput: string;
    isValidating: boolean;
    isCorrect: boolean | null;
}

const CodeOutput: React.FC<CodeOutputProps> = ({
    exampleOutputs,
    activeTab,
    setActiveTab,
    validatorOutput,
    isValidating,
    isCorrect
}) => {
    const themeContext = useContext(ThemeContext);

    // Safety check to ensure ThemeContext is defined
    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors } = themeContext;

    // State to hold the output from the event bus
    const [outputMessage, setOutputMessage] = useState<string>('');

    // Set up event listener for the "output" event
    useEffect(() => {
        const handleOutputEvent = (data: { message: string }) => {
            setOutputMessage(data.message);
        };

        eventBus.on("output", handleOutputEvent);

        // Clean up the event listener when the component unmounts
        return () => {
            eventBus.off("output", handleOutputEvent);
        };
    }, []);

    return (
        <div
            style={{
                backgroundColor: colors.background,
                padding: '20px',
                borderRadius: '15px',
                marginTop: '20px',
                width: '100%',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '20px',
            }}
        >
            {/* Run Code Output Section with Tabs */}
            <div style={{ width: '48%' }}>
                <h4 style={{ fontSize: "1.25em", color: '#888888', marginBottom: '10px', textAlign: 'center' }}>
                    Run Code Output
                </h4>

                {/* Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
                    {exampleOutputs.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            style={{
                                backgroundColor: activeTab === index ? colors.buttonBackground : colors.background,
                                color: example.isCorrect ? '#43A146' : (example.userOutput.includes('Error:') ? '#ff4c4c' : '#ff4c4c'),
                                padding: '10px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                border: 'none',
                                fontWeight: activeTab === index ? 'bold' : 'normal',
                                transition: 'background-color 0.3s ease',
                            }}
                        >
                            {example.name}
                            {example.userOutput.includes('Error:') && <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>⚠️</span>}
                        </button>
                    ))}
                </div>

                {/* Conditional rendering for example output */}
                {exampleOutputs.length > 0 && exampleOutputs[activeTab] ? (
                    <div
                        style={{
                            backgroundColor: colors.buttonBackground,
                            padding: '20px',
                            borderRadius: '10px',
                            minHeight: '150px',
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
                        {(() => {
                            const currentOutput = exampleOutputs[activeTab];
                            const isError = currentOutput.userOutput.includes('Error:');

                            if (isError) {
                                return (
                                    <div style={{ width: '100%', textAlign: 'left', backgroundColor: 'rgba(255, 76, 76, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff4c4c', boxSizing: 'border-box' }}>
                                        <h3 style={{ color: '#ff4c4c', margin: '0 0 10px 0', fontSize: '1.2em' }}>Runtime Error</h3>
                                        <pre style={{ color: '#ff4c4c', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9em' }}>
                                            {currentOutput.userOutput}
                                        </pre>
                                    </div>
                                );
                            }

                            return (
                                <div style={{ width: '100%' }}>
                                    <div style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}>
                                        <strong style={{ color: colors.header, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Input:</strong>
                                        <pre style={{ backgroundColor: colors.background, padding: '12px', borderRadius: '8px', marginTop: '8px', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace' }}>
                                            {currentOutput.input}
                                        </pre>
                                    </div>

                                    <div style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}>
                                        <strong style={{ color: colors.header, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Output:</strong>
                                        <pre style={{ backgroundColor: colors.background, padding: '12px', borderRadius: '8px', marginTop: '8px', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', color: currentOutput.userOutput !== currentOutput.expectedOutput ? '#ff4c4c' : colors.text }}>
                                            {currentOutput.userOutput}
                                        </pre>
                                    </div>

                                    <div style={{ textAlign: 'left', width: '100%', marginBottom: '15px' }}>
                                        <strong style={{ color: colors.header, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Expected Output:</strong>
                                        <pre style={{ backgroundColor: colors.background, padding: '12px', borderRadius: '8px', marginTop: '8px', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace' }}>
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
                ) : (
                    <div style={{ fontSize: "1.25em", color: colors.header, textAlign: 'center', padding: '10px' }}>
                        No output available. Please submit the code.
                    </div>
                )}
            </div>

            {/* Validator Output Section */}
            {/* <div style={{ width: '48%' }}>
                <h4 style={{ fontSize: "1.25em", color: '#888888', marginBottom: '10px', textAlign: 'center' }}>
                    Validator Output
                </h4>

                <div
                    style={{
                        backgroundColor: colors.buttonBackground,
                        padding: '10px',
                        borderRadius: '10px',
                        minHeight: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: "1.25em",
                        whiteSpace: 'pre-wrap',
                        overflowY: 'auto',
                        color: isCorrect === null ? '#ffffff' : isCorrect ? '#43A146' : 'red',
                    }}
                >
                    {isValidating ? (
                        <p>Validating...</p>  // Replace with your loading animation if desired
                    ) : (
                        <pre>{validatorOutput}</pre>
                    )}
                </div>
            </div> */}

            {/* Output from Event Bus */}
            <div style={{
                width: '48%',  // Adjust the width to match the layout of other elements
                marginTop: '20px',
                padding: '10px 15px',  // Reduced padding for a compact appearance
                backgroundColor: colors.background,
                borderRadius: '10px',
                color: colors.text,
                minHeight: '120px',  // Adjust height to fit content properly
                display: 'flex',  // Use flexbox for alignment
                flexDirection: 'column',  // Stack the content vertically
                justifyContent: 'center',  // Center the content
            }}>
                <strong style={{ color: colors.header, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Real-time Output:</strong>
                <pre style={{
                    marginTop: '10px',  // Space between title and output
                    whiteSpace: 'pre-wrap',  // Preserve formatting but wrap text
                    overflowY: 'auto',  // Allow scrolling if content is long
                    maxHeight: '120px',  // Limit the height to fit in the layout
                    fontSize: '0.95em',  // Adjust font size for better readability
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '12px',
                    backgroundColor: colors.buttonBackground,
                    borderRadius: '8px',
                    color: outputMessage.includes('Error:') ? '#ff4c4c' : colors.text
                }}>{outputMessage || 'No output available.'}</pre>
            </div>
        </div>
    );
};

export default CodeOutput;
