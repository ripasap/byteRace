"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuthComponent: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState('');
    
    const { login } = useAuth();

    const handleAuth = async () => {
        setError('');
        try {
            if (isSignUp) {
                const res = await axios.post('http://localhost:4000/api/auth/register', { username, email, password });
                login(res.data.token, res.data.user);
            } else {
                const res = await axios.post('http://localhost:4000/api/auth/login', { username, password });
                login(res.data.token, res.data.user);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "An error occurred");
        }
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg text-white max-w-sm mx-auto mt-10">
            <h2 className="text-xl font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            {error && <p className="text-red-500">{error}</p>}
            
            {isSignUp && (
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="p-2 bg-gray-700 rounded text-white"
                />
            )}
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="p-2 bg-gray-700 rounded text-white"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="p-2 bg-gray-700 rounded text-white"
            />
            <button onClick={handleAuth} className="bg-blue-500 p-2 rounded font-bold hover:bg-blue-600">
                {isSignUp ? "Sign Up" : "Sign In"}
            </button>
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-400 mt-2 hover:text-white">
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
        </div>
    );
};

export default AuthComponent;
