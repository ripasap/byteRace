import { useRouter } from "next/navigation";
import React, { useState } from 'react';

const HomeButton = () => {
    const [isClicked, setIsClicked] = useState(false);
    const router = useRouter();

    return (
        <a
            href="#_"
            className={`m-5 relative inline-flex items-center justify-end py-3 pl-12 pr-4 overflow-hidden font-semibold text-white transition-all duration-300 ease-in-out rounded hover:pr-10 hover:pl-6 bg-transparent group ${isClicked ? 'clicked' : ''}`}
            onClick={(e) => {
                e.preventDefault();
                setIsClicked(true);
                router.push(`/`);
                setTimeout(() => setIsClicked(false), 3000);
            }}
        >
            <span
                className={`absolute top-0 right-0 w-full transition-all duration-300 ease-in-out bg-white ${isClicked ? 'top-auto bottom-0 h-0' : 'h-0 group-hover:h-full'
                    }`}
            />


            <span className={`absolute left-0 pl-4 duration-300 ease-out transform ${isClicked ? '-translate-x-full' : 'group-hover:-translate-x-12'}`}>
                <svg className={`w-5 h-5 transition-colors duration-300 ease-in-out ${isClicked ? 'text-black' : 'text-white group-hover:text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </span>
            <span className={`absolute right-0 pr-2.5 translate-x-12 duration-300 ease-out transform ${isClicked ? '-translate-x-full' : 'group-hover:translate-x-0'}`}>
                <svg className={`w-5 h-5 transition-colors duration-300 ease-in-out ${isClicked ? 'text-black' : 'text-white group-hover:text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </span>
            <span className={`relative w-full text-right transition-all duration-300 ease-in-out group-hover:text-black ${isClicked ? 'opacity-0' : 'opacity-100'}`}>
                coderace.io
            </span>
        </a>
    );
};

export default HomeButton;