"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import HomeButton from '../components/HomeButton';

const TestPage: React.FC = () => {
    const router = useRouter();
    const { user, token } = useAuth();
    const [fakePlayerElo, setFakePlayerElo] = useState<number | null>(null);

    const handleAddRandomElo = () => {
        const randomElo = Math.floor(Math.random() * 800) + 1200;
        setFakePlayerElo(randomElo);
    };

    const handleWinOrLose = async (win: boolean) => {
        if (!user || !token) {
            alert("You must be logged in to update your record");
            router.push('/login');
            return;
        }

        try {
            await axios.post('http://localhost:4000/api/users/match', { win }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert(`Match ${win ? "won" : "lost"} recorded successfully!`);
        } catch (error: any) {
            console.error("Error updating record: ", error.message);
            alert("Error updating record");
        }
    };

    return (
        <div className="p-6 text-white">
            <HomeButton />
            <h1 className="text-2xl mb-4">Test Page</h1>
            <p className="mb-6">This is a test page</p>
            <button
                onClick={handleAddRandomElo}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
            >
                Add Random Elo (Fake Player)
            </button>
            {fakePlayerElo !== null && (
                <p className="text-lg mb-4">Generated Fake Player Elo: {fakePlayerElo}</p>
            )}
            <br />
            <button
                onClick={() => handleWinOrLose(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-4"
            >
                Win Match
            </button>
            <button
                onClick={() => handleWinOrLose(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Lose Match
            </button>
        </div>
    );
};

export default TestPage;
