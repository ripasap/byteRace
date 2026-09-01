"use client";

import React from "react";
import LoginForm from "../components/LoginForm";
import HomeButton from "../components/HomeButton";

const LoginPage: React.FC = () => {
    return (
        <div className="relative flex items-center justify-center h-screen overflow-hidden bg-black text-white">
            <div className="absolute top-0 left-0 z-10">
                <HomeButton />
            </div>
            <LoginForm />
        </div>
    );
};

export default LoginPage;
