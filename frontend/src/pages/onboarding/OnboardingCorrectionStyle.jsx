import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const correctionStyles = [
    {
        value: "gentle",
        emoji: "🌱",
        title: "Gentle corrections",
        shortLabel: "Gentle",
        description:
            "Encourage me first, then explain my mistake in a friendly way.",
        example:
            "Good try! 😊 A more natural sentence is: \u201cI went to college yesterday.\u201d",
    },
    {
        value: "direct",
        emoji: "🎯",
        title: "Direct corrections",
        shortLabel: "Direct",
        description:
            "Tell me clearly when something is wrong and show me the correct sentence.",
        example:
            "Incorrect: \u201cI go to college yesterday.\u201d Correct: \u201cI went to college yesterday.\u201d",
    },
    {
        value: "detailed",
        emoji: "🔍",
        title: "Detailed explanations",
        shortLabel: "Detailed",
        description: "Explain why my sentence is wrong and teach me the grammar rule.",
        example:
            "\u201cYesterday\u201d shows the past, so use the past tense of \u201cgo\u201d, which is \u201cwent\u201d.",
    },
];

const VALID_STYLE_VALUES = correctionStyles.map((style) => style.value);

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingCorrectionStyle() {
    const [selectedStyle, setSelectedStyle] = useState("");
    const [firstName, setFirstName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedStyle = localStorage.getItem(
            "lingora_onboarding_correction_style"
        );
        if (VALID_STYLE_VALUES.includes(savedStyle)) {
            setSelectedStyle(savedStyle);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/learning-goal");
    };

    const handleSelect = (value) => {
        setSelectedStyle(value);
    };

    const handleContinue = () => {
        if (!selectedStyle) return;
        localStorage.setItem("lingora_onboarding_correction_style", selectedStyle);
        navigate("/onboarding/interests");
    };

    const isDisabled = !selectedStyle;
    const activeStyle = correctionStyles.find(
        (style) => style.value === selectedStyle
    );

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
                            How should I correct you,
                            <br />
                            {firstName}?
                        </>
                    ) : (
                        <>
                            How should Lingora
                            <br />
                            correct you?
                        </>
                    )}
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    Choose the feedback style that helps you learn best.
                </p>

                <div className="flex flex-col gap-4">
                    {correctionStyles.map((style) => {
                        const isSelected = selectedStyle === style.value;

                        return (
                            <button
                                key={style.value}
                                type="button"
                                onClick={() => handleSelect(style.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select ${style.title} correction style`}
                                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                    : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                                        <span className="text-3xl" role="img" aria-hidden="true">
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

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
                    <p className="text-sm font-semibold text-blue-700">
                        How Lingora may correct you
                    </p>
                    <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                        {activeStyle
                            ? activeStyle.example
                            : "Choose a correction style to preview your feedback experience."}
                    </p>
                </div>

                <div className="mt-auto pt-10">
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
