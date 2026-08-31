"use client";

import React, { useEffect, useState, useContext } from "react";
import axios from 'axios';
import HomeButton from "../components/HomeButton";
import { ThemeContext } from '../../context/ThemeContext';

interface LeaderboardUser {
    id: string;
    username: string;
    wins: number;
    losses: number;
}

const LeaderboardPage: React.FC = () => {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const themeContext = useContext(ThemeContext);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await axios.get(`${apiUrl}/api/users/leaderboard`);
                setUsers(res.data);
            } catch (error) {
                console.error("Error fetching leaderboard: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (!themeContext) {
        console.error('ThemeContext is unavailable!');
        return null;
    }

    const { colors } = themeContext;

    if (loading) {
        return <div style={{ color: colors.text, padding: '16px' }}>Loading...</div>;
    }

    return (
        <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '20px' }}>
            <HomeButton />
            <div
                style={{
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    padding: '24px',
                    maxWidth: '800px',
                    margin: '40px auto 0',
                    borderRadius: '10px',
                    boxShadow: `0px 4px 8px rgba(0, 0, 0, 0.3)`,
                }}
            >
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', color: colors.text, textAlign: 'center' }}>
                    Global Leaderboard
                </h1>
                
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${colors.text}40` }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Rank</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Wins</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Losses</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} style={{ borderBottom: `1px solid ${colors.text}20` }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{index + 1}</td>
                                <td style={{ padding: '12px' }}>{user.username}</td>
                                <td style={{ padding: '12px', textAlign: 'center', color: '#43A146' }}>{user.wins}</td>
                                <td style={{ padding: '12px', textAlign: 'center', color: '#ff4c4c' }}>{user.losses}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: colors.text }}>
                                    No players found on the leaderboard yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardPage;
