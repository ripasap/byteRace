"use client";

import React from "react";
import LoginForm from "../components/LoginForm";
import HomeButton from "../components/HomeButton";

const LoginPage: React.FC = () => {
    return (
        <div>
            <HomeButton />
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;
