import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const teacherStyles = [
    {
        value: "clear",
        emoji: "🎓",
        title: "Clear & Structured",
        shortLabel: "Clear",
        description:
            "Simple explanations, step-by-step learning, and focused guidance.",
        example: "Let's break this into 3 simple steps.",
    },
    {
        value: "friendly",
        emoji: "😊",
        title: "Friendly & Supportive",
        shortLabel: "Friendly",
        description:
            "Warm explanations, positive encouragement, and patient feedback.",
        example: "Great question! You're doing well. Let's understand it together.",
    },
    {
        value: "casual",
        emoji: "💬",
        title: "Casual & Natural",
        shortLabel: "Casual",
        description: "Relaxed conversations, natural English, and everyday examples.",
        example: "No worries! Here's an easy way to think about it.",
    },
];

const VALID_STYLES = teacherStyles.map((style) => style.value);

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingTeacherStyle() {
    const [selectedStyle, setSelectedStyle] = useState("");
    const [firstName, setFirstName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedStyle = localStorage.getItem("lingora_onboarding_teacher_style");
        if (VALID_STYLES.includes(savedStyle)) {
            setSelectedStyle(savedStyle);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/english-preference");
    };

    const handleSelect = (value) => {
        setSelectedStyle(value);
    };

    const handleContinue = () => {
        if (!selectedStyle) return;
        localStorage.setItem("lingora_onboarding_teacher_style", selectedStyle);
        navigate("/onboarding/welcome");
    };

    const isDisabled = !selectedStyle;
    const activeStyle = teacherStyles.find((style) => style.value === selectedStyle);

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
                    {firstName ? (
                        <>
                            How should I teach you,
                            <br />
                            {firstName}?
                        </>
                    ) : (
                        <>
                            How should Lingora
                            <br />
                            teach you?
                        </>
                    )}
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    Choose the teaching style that feels most comfortable for you.
                </p>

                <div className="flex flex-col gap-4">
                    {teacherStyles.map((style) => {
                        const isSelected = selectedStyle === style.value;

                        return (
                            <button
                                key={style.value}
                                type="button"
                                onClick={() => handleSelect(style.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select ${style.title} teaching style`}
                                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                    : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                                        <span className="text-3xl" role="img" aria-label={style.title}>
                                            {style.emoji}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                                            {style.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                            {style.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${isSelected
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-slate-300 bg-white"
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={3}
                                                stroke="white"
                                                aria-hidden="true"
                                                className="h-3.5 w-3.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m4.5 12.75 6 6 9-13.5"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <p className="text-sm font-semibold text-blue-700">
                        🤖 Lingora AI Teacher
                    </p>
                    <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                        {activeStyle
                            ? activeStyle.example
                            : "Choose a style to preview how Lingora AI Teacher may respond."}
                    </p>
                </div>

                <div className="mt-auto pt-12">
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
