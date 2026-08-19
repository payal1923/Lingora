import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingName() {
    const [name, setName] = useState("");
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        if (savedName) {
            setName(savedName);
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/language");
    };

    const handleContinue = () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        localStorage.setItem("lingora_onboarding_name", trimmedName);
        navigate("/onboarding/profile-picture");
    };

    const isDisabled = name.trim().length === 0;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50">
            <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col px-6 pb-12 pt-8 sm:pt-10">
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Go back"
                    className="mb-8 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 hover:bg-slate-100 cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>

                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight leading-snug">
                    Nice to meet you.
                    <br />
                    What&apos;s your name?
                </h1>

                <div className="mt-10">
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={50}
                        placeholder="Enter your name in English"
                        className="w-full border-0 border-b-2 border-slate-300 bg-transparent px-1 py-3 text-xl text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors duration-200"
                    />
                </div>

                <div className="mt-auto pt-16">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isDisabled}
                        className={`w-full rounded-2xl py-4 text-base font-bold text-white transition-colors duration-200 ${isDisabled
                                ? "bg-blue-200 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
