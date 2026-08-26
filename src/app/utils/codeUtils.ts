import { eventBus } from './EventBus';

export const fetchGPT = async (message: string) => {
    const apiKey = "sk-6XDotiko00geiYygRa-cB3bZbfXQ2M1UntRQ0mxEvjT3BlbkFJO1JR-Ug4VbXmPMNQZPF-nmwimw5FMe4xtGbyDYCxAA"; // Replace with your actual API key

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
        }),
    });

    if (!response.ok) {
        throw new Error(`GPT API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json(); // Parse the JSON response
    return data; // Return the parsed data (should contain 'choices')
};

// Run Python code using Pyodide instance
export const runPythonCode = async (code: string, pyodide: any, setOutput: (output: string) => void) => {
    if (pyodide) {
        try {
            // Redirect Python print output
            pyodide.runPython(`
                import sys
                from io import StringIO
                sys.stdout = StringIO()
            `);
            await pyodide.runPythonAsync(code); // Run the user's Python code
            const result = pyodide.runPython('sys.stdout.getvalue()'); // Get the printed output
            setOutput(result || 'No output');
        } catch (error: unknown) {
            if (error instanceof Error) {
                setOutput(`Error: ${error.message}`);
            } else {
                setOutput('An unknown error occurred.');
            }
        }
    } else {
        setOutput('Pyodide is not ready yet');
    }
};

// Run JavaScript code using eval
export const runJavaScriptCode = (code: string, setOutput: (output: string) => void) => {
    try {
        const result = eval(code);
        setOutput(result !== undefined ? result.toString() : 'No output');
    } catch (error: unknown) {
        if (error instanceof Error) {
            setOutput(`Error: ${error.message}`);
        } else {
            setOutput('An unknown error occurred.');
        }
    }
};

// Run the user's code based on language and gather results for examples
export const runCode = async (
    language: "python" | "javascript",
    code: string,
    pyodide: any,
    currentQuestion: {
        test_cases: {
            input: string;
            expected_output: string;
            python_driver: string;
            javascript_driver: string;
        }[];
    } | null,
    setOutput: (output: string) => void,
    setExampleOutputs: (outputs: {
        name: string;
        input: string;
        userOutput: string;
        expectedOutput: string;
        isCorrect: boolean;
    }[]) => void,
    setActiveTab: (tab: number) => void,
) => {
    if (!currentQuestion) {
        setOutput('No question selected');
        return;
    }

    if (!currentQuestion.test_cases) {
        const errorMsg = '⚠️ SCHEMA MISMATCH: The backend is returning the old question format. Please restart your backend server (`npm run dev` in the backend folder) so it can load the new test_cases.';
        setOutput(errorMsg);
        setExampleOutputs([{
            name: "Error",
            input: "N/A",
            userOutput: errorMsg,
            expectedOutput: "N/A",
            isCorrect: false
        }]);
        setActiveTab(0);
        return;
    }

    let userOutputs: string[] = [];

    // Running user's code for each example
    if (language === 'javascript') {
        try {
            let capturedOutput = '';
            const originalLog = console.log;
            console.log = (msg) => { capturedOutput += msg + '\n'; };
            
            for (let i = 0; i < currentQuestion.test_cases.length; i++) {
                const testCase = currentQuestion.test_cases[i];
                capturedOutput = '';
                const codeToRun = code + "\n\n" + testCase.javascript_driver;
                try {
                    const result = eval(codeToRun);
                    const finalStr = (capturedOutput + (result !== undefined && result !== null && typeof result !== 'object' && result !== '' ? '\n' + result.toString() : '')).trim();
                    userOutputs.push(finalStr || 'No output');
                } catch (err: any) {
                    userOutputs.push(`Error: ${err.message}`);
                }
            }
            console.log = originalLog;
            const finalOutput = userOutputs[0] || 'No output';
            setOutput(finalOutput);
            eventBus.emit("output", { message: finalOutput });
        } catch (error) {
            const errOut = error instanceof Error ? `Error: ${error.message}` : 'An unknown error occurred.';
            userOutputs.push(errOut);
            setOutput(errOut);
            eventBus.emit("output", { message: errOut });
        }
    } else if (language === 'python' && pyodide) {
        try {
            for (let i = 0; i < currentQuestion.test_cases.length; i++) {
                const testCase = currentQuestion.test_cases[i];
                pyodide.runPython(`
                    import sys
                    from io import StringIO
                    sys.stdout = stdout = StringIO()
                    sys.stderr = stderr = StringIO()
                `);
                const codeToRun = code + "\n\n" + testCase.python_driver;
                try {
                    const result = await pyodide.runPythonAsync(codeToRun); // Run the user's Python code
                    const stdout = pyodide.runPython('stdout.getvalue()');
                    const stderr = pyodide.runPython('stderr.getvalue()');
                    // Avoid appending unprintable or generic object results to stdout
                    const resultStr = result !== undefined && result !== null && typeof result !== 'object' && result !== '' ? '\n' + result.toString() : '';
                    const output = stderr ? `Error: ${stderr}` : (stdout + resultStr).trim();
                    userOutputs.push(output || 'No output');
                } catch (err: any) {
                    userOutputs.push(`Error: ${err.message}`);
                }
            }
            const finalOutput = userOutputs[0] || 'No output';
            setOutput(finalOutput);
            eventBus.emit("output", { message: finalOutput });
        } catch (error) {
            const errOut = error instanceof Error ? `Error: ${error.message}` : 'An unknown error occurred.';
            userOutputs.push(errOut);
            setOutput(errOut);
            eventBus.emit("output", { message: errOut });
        }
    } else {
        userOutputs.push('Pyodide is not ready yet');
        setOutput('Pyodide is not ready yet');
    }

    // Generate example outputs including the isCorrect flag
    const exampleOutputs = currentQuestion.test_cases.map((testCase, index) => {
        return {
            name: `Test Case ${index + 1}`,
            input: testCase.input,
            userOutput: userOutputs[index] || 'No output',
            expectedOutput: testCase.expected_output,
            isCorrect: (userOutputs[index] || '').trim() === testCase.expected_output.trim()
        };
    });

    setExampleOutputs(exampleOutputs);
    setActiveTab(0);
    return exampleOutputs;
};
