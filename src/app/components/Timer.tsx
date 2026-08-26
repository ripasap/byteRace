import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
    setStartTimer: (fn: (shouldStart: boolean) => void) => void; // Function to start/stop the timer
}

const Timer: React.FC<TimerProps> = ({ setStartTimer }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Function to start or stop the timer based on the boolean flag
    const startTimer = (shouldStart: boolean) => {
        if (shouldStart) {
            setIsTimerRunning(true);
        } else {
            setIsTimerRunning(false);
        }
    };

    // Pass the startTimer function to the parent via setStartTimer
    useEffect(() => {
        setStartTimer(startTimer);
    }, [setStartTimer]);

    // Effect to handle the timer increments
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else if (!isTimerRunning && timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning]);

    // Function to format time as MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ color: "#aaaaaa", fontSize: "24px" }}>
            Timer: {formatTime(elapsedTime)}
        </div>
    );
};

export default Timer;