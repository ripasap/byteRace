"use client";

import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import HomeButton from "../components/HomeButton";
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from "../context/AuthContext";

interface UserProfile {
    username: string;
    email: string;
    wins: number;
    losses: number;
}

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const { token, loading: authLoading } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const themeContext = useContext(ThemeContext);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (authLoading) return; // Wait for auth context

            if (!token) {
                router.push("/"); // Redirect to login/home
                return;
            }

            try {
                const res = await axios.get("http://localhost:4000/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserProfile(res.data);
            } catch (error) {
                console.error("Error fetching user profile: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [token, authLoading, router]);

    if (!themeContext) {
        console.error('ThemeContext is unavailable!');
        return null;
    }

    const { colors } = themeContext;

    if (loading || authLoading) {
        return <div style={{ color: colors.text, padding: '16px' }}>Loading...</div>;
    }

    if (!userProfile) {
        return <div style={{ color: colors.text, padding: '16px' }}>User profile not found.</div>;
    }

    return (
        <div style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '20px' }}>
            <HomeButton />
            <div
                style={{
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    padding: '24px',
                    maxWidth: '600px',
                    margin: '40px auto 0',
                    borderRadius: '10px',
                    boxShadow: `0px 4px 8px rgba(0, 0, 0, 0.3)`,
                }}
            >
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px', color: colors.text }}>
                    {userProfile.username}
                </h1>
                <div style={{ marginBottom: '8px', color: colors.text }}>
                    <strong>Email:</strong> {userProfile.email}
                </div>
                <div style={{ marginBottom: '8px', color: colors.text }}>
                    <strong>Wins:</strong> {userProfile.wins}
                </div>
                <div style={{ marginBottom: '8px', color: colors.text }}>
                    <strong>Losses:</strong> {userProfile.losses}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
