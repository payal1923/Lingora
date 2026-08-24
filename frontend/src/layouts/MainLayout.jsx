import Navbar from "../components/Navbar";
import { Bot } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useModalBehavior from "../Hooks/useModalBehavior";

export default function MainLayout({ children }) {

    const navigate = useNavigate();
    const location = useLocation();
    const [showAI, setShowAI] = useState(false);
    useModalBehavior(showAI, () => setShowAI(false));


    return (
        <div className="min-h-screen bg-white">

            <Navbar />

            <main>{children}</main>
            {/* AI Popup */}

            {location.pathname === "/dashboard" && showAI && (

                <div className="mobile-modal-backdrop fixed inset-0 z-50 flex items-end justify-center px-4 sm:items-center">

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Lingora AI assistant"
                        className="mobile-modal-panel relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
                    >
                        <button
                            onClick={() => setShowAI(false)}
                            aria-label="Close"
                            className="absolute top-4 right-4 w-10 h-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-slate-100 transition flex items-center justify-center text-slate-500 hover:text-red-500 text-xl touch-manipulation cursor-pointer"
                        >
                            ✕
                        </button>

                        <h2 className="text-3xl font-bold text-center">

                            🤖 Lingora AI

                        </h2>

                        <p className="text-center text-slate-500 mt-4">
                            Hello, {JSON.parse(localStorage.getItem("user"))?.full_name || "Learner"} 👋
                        </p>

                        <p className="text-center text-slate-600 mt-2">

                            What would you like to do today?

                        </p>
                        <div className="mt-8">

                            <button
                                onClick={() => {
                                    setShowAI(false);
                                    navigate("/conversation");
                                }}
                                className="touch-target w-full flex items-center gap-4 p-5 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-all duration-300 border border-blue-200"
                            >

                                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl">
                                    💬
                                </div>

                                <div className="text-left">

                                    <h3 className="text-lg font-bold text-slate-800">
                                        AI Conversation
                                    </h3>

                                    <p className="text-slate-500 text-sm">
                                        Practice real conversations with Lingora AI.
                                    </p>

                                </div>

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* Floating AI Button — single global Lingora AI entry point.
                Respects Android safe-area so it clears the gesture bar. */}

            {location.pathname === "/dashboard" && (
                <div
                    className="fixed right-4 sm:right-8 z-50 group"
                    style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
                >
                    {/* Glow */}
                    <div className="absolute inset-0 rounded-full bg-blue-400 blur-xl opacity-40 animate-pulse"></div>

                    <button
                        onClick={() => setShowAI(true)}
                        aria-label="Open Lingora AI assistant"
                        className="relative w-16 h-16 min-h-[64px] min-w-[64px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl hover:scale-110 hover:animate-none animate-pulse transition-all duration-300 flex items-center justify-center touch-manipulation cursor-pointer"
                    >
                        <Bot size={30} strokeWidth={2.5} />
                    </button>

                    <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
                        Talk with Lingora AI
                    </div>
                </div>
            )}

        </div>
    );
}