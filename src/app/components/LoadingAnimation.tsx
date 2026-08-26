import React from 'react';


const CoolLoadingAnimation: React.FC<{ isCorrect?: boolean }> = ({ isCorrect }) => {
    return (
        <div className="loading-wrapper">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <style jsx>{`
                .loading-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }

                .circle {
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    background: ${isCorrect === true ? '#43A146' : isCorrect === false ? 'red' : '#888'};
                    animation: pulsate 0.6s infinite alternate;
                }

                .circle:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .circle:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes pulsate {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
};

export default CoolLoadingAnimation;