import { useState, useEffect } from "react";

let pyodidePromise: Promise<any> | null = null;
let scriptInjected = false;

export const usePyodide = () => {
    const [pyodide, setPyodide] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadPyodide = async () => {
            if (typeof window !== "undefined") {
                try {
                    if (!scriptInjected && !document.querySelector('script[src*="pyodide.js"]')) {
                        scriptInjected = true;
                        const pyodideScript = document.createElement("script");
                        pyodideScript.src = "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js";
                        pyodideScript.async = true;
                        document.head.appendChild(pyodideScript);
                    }

                    while (!(window as any).loadPyodide) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    if (!pyodidePromise) {
                        pyodidePromise = (window as any).loadPyodide({
                            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/"
                        });
                    }

                    const pyodideInstance = await pyodidePromise;
                    if (isMounted) {
                        console.log("Pyodide loaded successfully.");
                        setPyodide(pyodideInstance);
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error("Error loading Pyodide: ", error);
                    if (isMounted) setIsLoading(false);
                }
            }
        };

        loadPyodide();
        return () => { isMounted = false; };
    }, []);

    return { pyodide, isLoading };
};