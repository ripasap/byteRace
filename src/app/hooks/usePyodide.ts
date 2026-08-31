import { useState, useEffect } from "react";

let pyodidePromise: Promise<any> | null = null;

export const usePyodide = () => {
    const [pyodide, setPyodide] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadPyodide = async () => {
            if (typeof window !== "undefined") {
                try {
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