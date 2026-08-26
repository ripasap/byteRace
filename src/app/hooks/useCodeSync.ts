import { useEffect, useState, useRef } from 'react';

interface UseCodeSyncProps {
    roomId: string; // Room ID for the WebSocket connection
    initialCode: string; // Initial code in the editor
    onCodeUpdate: (newCode: string) => void; // Callback to update the local editor when remote user sends new code
}

export const useCodeSync = ({ roomId, initialCode, onCodeUpdate }: UseCodeSyncProps) => {
    const [currentCode, setCurrentCode] = useState<string>(initialCode);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Create WebSocket connection
        const socket = new WebSocket(`ws://localhost:8080?roomId=${roomId}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Connected to WebSocket for room:', roomId);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Handle receiving new code from other users
            if (data.type === 'codeUpdate' && data.roomId === roomId) {
                setCurrentCode(data.code);
                onCodeUpdate(data.code); // Update the local editor with the new code
            }
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Cleanup on unmount
        return () => {
            socket.close();
        };
    }, [roomId, onCodeUpdate]);

    // Function to send code update to the WebSocket server
    const sendCodeUpdate = (newCode: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                type: 'codeUpdate',
                roomId: roomId,
                code: newCode,
            });
            socketRef.current.send(message);
        }
    };

    // Update the current code locally and notify other users
    const updateCode = (newCode: string) => {
        setCurrentCode(newCode);
        sendCodeUpdate(newCode); // Notify the server and other users
    };

    return { currentCode, updateCode };
};