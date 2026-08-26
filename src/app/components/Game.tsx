import React, { useEffect, useState } from 'react';

interface GameProps {
    webSocket: WebSocket | null;
    playerIndex: number;
}

const Game: React.FC<GameProps> = ({ webSocket, playerIndex }) => {
    const [readyState, setReadyState] = useState([false, false]);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (!webSocket) return;

        webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'playerReady') {
                const newReadyState = [...readyState];
                newReadyState[data.playerIndex] = true;
                setReadyState(newReadyState);
            }

            if (data.type === 'gameStarted') {
                setGameStarted(true);
                setTimeout(() => {
                    setGameStarted(false);  // Hide "Game Started" after a few seconds
                }, 3000);
            }
        };
    }, [webSocket, readyState]);

    const handleReadyClick = () => {
        if (webSocket) {
            webSocket.send(JSON.stringify({ type: 'playerReady' }));
        }
    };

    return (
        <div className="game">
            {gameStarted ? (
                <div className="game-started">Game Started!</div>
            ) : (
                <>
                    <h3>Player {playerIndex + 1}, Ready?</h3>
                    <button onClick={handleReadyClick} disabled={readyState[playerIndex]}>
                        {readyState[playerIndex] ? "Ready!" : "Click to Ready"}
                    </button>
                    <p>Player 1 is {readyState[0] ? "Ready" : "Not Ready"}</p>
                    <p>Player 2 is {readyState[1] ? "Ready" : "Not Ready"}</p>
                </>
            )}

            <style jsx>{`
        .game-started {
          font-size: 24px;
          font-weight: bold;
          animation: fadeInOut 3s;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default Game;