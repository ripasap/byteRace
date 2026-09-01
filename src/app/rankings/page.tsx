"use client";

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import HomeButton from '../components/HomeButton';
import { ThemeContext } from '../../context/ThemeContext';

interface LeaderboardUser {
    id: string;
    username: string;
    wins: number;
    losses: number;
}

const RankingsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mainLeaderboard, setMainLeaderboard] = useState<LeaderboardUser[]>([]);
    
    const themeContext = useContext(ThemeContext);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(`${apiUrl}/api/users/leaderboard/multiplayer`, { headers });
                setMainLeaderboard(res.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (!themeContext) {
        throw new Error('ThemeContext is undefined. Ensure that ThemeProvider is wrapping the component.');
    }

    const { colors } = themeContext;

    if (loading) return <p style={{ color: colors.text }}>Loading...</p>;
    if (error) return <p style={{ color: colors.text }}>Error: {error}</p>;

    return (
        <div
            style={{
                fontFamily: 'JetBrains Mono',
                color: colors.text,
                backgroundColor: colors.background,
                minHeight: '100vh',
                padding: '20px',
            }}
        >
            <nav className="relative flex items-center w-full px-5">
                <div className="flex-shrink-0">
                    <HomeButton />
                </div>
                <h2
                    className="absolute left-1/2 transform -translate-x-1/2 text-center"
                    style={{ color: colors.text }}
                >
                    Your Multiplayer Rankings
                </h2>
            </nav>

            <table
                style={{
                    width: '80%',
                    marginInline: 'auto',
                    borderCollapse: 'collapse',
                    marginTop: '20px',
                    backgroundColor: colors.cardBackground,
                    borderRadius: '10px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                }}
            >
                <thead>
                    <tr
                        style={{
                            backgroundColor: colors.buttonBackground,
                            color: colors.text,
                        }}
                    >
                        <th style={{ padding: '10px', textAlign: 'left' }}>Rank</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Opponent</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Wins</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Losses</th>
                    </tr>
                </thead>
                <tbody>
                    {mainLeaderboard.map((user, index) => (
                        <tr
                            key={index}
                            style={{
                                backgroundColor: index % 2 === 0 ? colors.background : colors.cardBackground,
                                color: colors.text,
                            }}
                        >
                            <td
                                style={{
                                    padding: '10px',
                                    textAlign: 'left',
                                    borderBottom: `1px solid ${colors.text}`,
                                }}
                            >
                                {index + 1}
                            </td>
                            <td
                                style={{
                                    padding: '10px',
                                    textAlign: 'left',
                                    borderBottom: `1px solid ${colors.text}`,
                                }}
                            >
                                {user.username}
                            </td>
                            <td
                                style={{
                                    padding: '10px',
                                    textAlign: 'right',
                                    borderBottom: `1px solid ${colors.text}`,
                                }}
                            >
                                {user.wins}
                            </td>
                            <td
                                style={{
                                    padding: '10px',
                                    textAlign: 'right',
                                    borderBottom: `1px solid ${colors.text}`,
                                }}
                            >
                                {user.losses}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RankingsPage;
