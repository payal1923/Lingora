import { useEffect } from "react";
import { motion } from "framer-motion";
import lingoraLogo from "../assets/Lingora-logo.png";

const SplashScreen = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 5500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white select-none">
            <div className="flex flex-col items-center px-6">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="drop-shadow-[0_12px_30px_rgba(37,99,235,0.22)]"
                >
                    <img
                        src={lingoraLogo}
                        alt="Lingora Logo"
                        draggable={false}
                        className="w-28 h-28 md:w-36 md:h-36 object-contain"
                    />
                </motion.div>

                {/* Brand Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.7,
                        delay: 0.45,
                    }}
                    className="mt-6 text-4xl font-bold tracking-wide text-blue-600"
                >
                    Lingora
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{
                        delay: 0.8,
                        duration: 0.6,
                    }}
                    className="mt-2 text-gray-500 text-sm"
                >
                    Learn English Smarter with AI
                </motion.p>

                {/* Loading Dots */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        delay: 1.1,
                    }}
                    className="flex gap-2 mt-8"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-blue-600"
                            animate={{
                                y: [0, -6, 0],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Powered By */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{
                        delay: 1.5,
                        duration: 0.3,
                    }}
                    className="mt-10 text-xs tracking-[0.3em] uppercase text-gray-400"
                >
                    Powered by Lingora
                </motion.p>
            </div>
        </div>
    );
};

export default SplashScreen;