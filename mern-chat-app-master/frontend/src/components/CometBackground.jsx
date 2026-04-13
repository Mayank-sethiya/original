import { useEffect, useState } from "react";

const CometBackground = () => {
    const [stars, setStars] = useState([]);

    useEffect(() => {
        // Increased to 100 stars for a richer sky
        const newStars = Array.from({ length: 100 }).map(() => ({
            id: Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            // Longer delays and durations for a much softer, breathing twinkle
            delay: Math.random() * 5,
            duration: Math.random() * 6 + 4, 
        }));
        setStars(newStars);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            
            <style>{`
                /* Softer opacity curve for a realistic, gentle fade */
                @keyframes twinkleSoft {
                    0%, 100% { opacity: 0.15; }
                    50% { opacity: 0.8; }
                }
                
                /* The Sweeping Ambient Glow - Fixed the snap! */
                @keyframes sweepGlow {
                    0% { transform: translateX(-30%); }
                    100% { transform: translateX(0%); }
                }

                /* Comet Trajectories */
                @keyframes cometMiddle {
                    0% { transform: translate3d(120vw, -20vw, 0) rotate(-45deg); opacity: 1; }
                    100% { transform: translate3d(-20vw, 120vw, 0) rotate(-45deg); opacity: 0; }
                }
                
                @keyframes cometTop {
                    0% { transform: translate3d(100vw, -60vw, 0) rotate(-45deg); opacity: 1; }
                    100% { transform: translate3d(-60vw, 100vw, 0) rotate(-45deg); opacity: 0; }
                }
                
                @keyframes cometBottom {
                    0% { transform: translate3d(150vw, 10vw, 0) rotate(-45deg); opacity: 1; }
                    100% { transform: translate3d(-20vw, 180vw, 0) rotate(-45deg); opacity: 0; }
                }

                .hardware-accelerated {
                    will-change: transform, opacity;
                }
            `}</style>

            {/* The Sweeping Glow Layer 
                Notice the 'alternate' added to the animation. 
                This makes it pan back and forth smoothly instead of snapping.
            */}
            <div 
                className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.07)_50%,transparent_75%)] w-[200%] hardware-accelerated"
                style={{ animation: 'sweepGlow 12s ease-in-out infinite alternate' }}
            />

            {/* Twinkling Stars */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-white hardware-accelerated"
                    style={{
                        top: `${star.y}%`,
                        left: `${star.x}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        animation: `twinkleSoft ${star.duration}s infinite ${star.delay}s ease-in-out`,
                    }}
                />
            ))}

            {/* Comet 1: Middle (Blue) */}
            <div
                className="absolute top-0 left-0 flex items-center hardware-accelerated opacity-0"
                style={{ animation: 'cometMiddle 4.5s linear infinite 1s' }}
            >
                <div className="w-[3px] h-[3px] bg-white rounded-full shadow-[0_0_10px_2px_#fff,0_0_20px_4px_#60a5fa]" />
                <div className="w-[150px] h-[1px] bg-gradient-to-r from-white via-blue-400/50 to-transparent" />
            </div>

            {/* Comet 2: Top Half (Purple) */}
            <div
                className="absolute top-0 left-0 flex items-center hardware-accelerated opacity-0"
                style={{ animation: 'cometTop 3.5s linear infinite 4.5s' }}
            >
                <div className="w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_8px_2px_#fff,0_0_15px_4px_#a855f7]" />
                <div className="w-[100px] h-[1px] bg-gradient-to-r from-purple-200 via-purple-400/40 to-transparent" />
            </div>

            {/* Comet 3: Bottom Half (Blue/White) */}
            <div
                className="absolute top-0 left-0 flex items-center hardware-accelerated opacity-0"
                style={{ animation: 'cometBottom 5s linear infinite 8s' }}
            >
                <div className="w-[3px] h-[3px] bg-white rounded-full shadow-[0_0_10px_2px_#fff,0_0_20px_4px_#60a5fa]" />
                <div className="w-[120px] h-[1px] bg-gradient-to-r from-white via-blue-400/50 to-transparent" />
            </div>

        </div>
    );
};

export default CometBackground;