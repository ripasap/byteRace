import { useState, useEffect } from "react";

export const usePyodide = () => {
    const [pyodide, setPyodide] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPyodide = async () => {
            if (typeof window !== "undefined") {
                try {
                    const pyodideScript = document.createElement("script");
                    pyodideScript.src = "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js";
                    pyodideScript.async = true;
                    pyodideScript.onload = async () => {
                        try {
                            const pyodideInstance = await (window as any).loadPyodide();
                            console.log("Pyodide loaded successfully.");
                            setPyodide(pyodideInstance);
                            setIsLoading(false);
                        } catch (error) {
                            console.error("Error loading Pyodide: ", error);
                        }
                    };
                    document.body.appendChild(pyodideScript);
                } catch (error) {
                    console.error("Failed to load Pyodide script: ", error);
                }
            }
        };

        loadPyodide();
    }, []);

    return { pyodide, isLoading };
};