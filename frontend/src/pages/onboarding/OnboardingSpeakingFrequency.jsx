import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const speakingFrequencies = [
    {
        value: "never",
        emoji: "🤐",
        title: "Almost never",
        description: "I rarely or never speak English.",
        preview:
            "Lingora will start with simple, low-pressure speaking exercises to help you feel comfortable.",
    },
    {
        value: "sometimes",
        emoji: "🌱",
        title: "Sometimes",
        description: "I speak English occasionally when I need to.",
        preview:
            "Lingora will help you practice common conversations and build speaking confidence step by step.",
    },
    {
        value: "weekly",
        emoji: "💬",
        title: "A few times a week",
        description: "I use spoken English several times during the week.",
        preview:
            "Lingora will focus on smoother conversations, stronger responses, and speaking more naturally.",
    },
    {
        value: "daily",
        emoji: "🔥",
        title: "Every day",
        description: "I speak English almost every day.",
        preview:
            "Lingora will challenge you with more natural conversations, useful expressions, and fluency practice.",
    },
    {
        value: "mostly_english",
        emoji: "🚀",
        title: "Most of the time",
        description: "English is one of the main languages I use when speaking.",
        preview:
            "Lingora will focus on fluency, precision, natural expression, and advanced speaking confidence.",
    },
];

const VALID_FREQUENCY_VALUES = speakingFrequencies.map(
    (frequency) => frequency.value
);

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingSpeakingFrequency() {
    const [selectedFrequency, setSelectedFrequency] = useState("");
    const [firstName, setFirstName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedFrequency = localStorage.getItem(
            "lingora_onboarding_speaking_frequency"
        );
        if (VALID_FREQUENCY_VALUES.includes(savedFrequency)) {
            setSelectedFrequency(savedFrequency);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/interests");
    };

    const handleSelect = (value) => {
        setSelectedFrequency(value);
    };

    const handleContinue = () => {
        if (!selectedFrequency) return;
        localStorage.setItem(
            "lingora_onboarding_speaking_frequency",
            selectedFrequency
        );
        navigate("/onboarding/daily-goal");
    };

    const isDisabled = !selectedFrequency;
    const activeFrequency = speakingFrequencies.find(
        (frequency) => frequency.value === selectedFrequency
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
                            How often do you speak
                            <br />
                            English, {firstName}?
                        </>
                    ) : (
                        <>
                            How often do you
                            <br />
                            speak English?
                        </>
                    )}
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    Be honest — this helps Lingora personalize your speaking practice.
                </p>

                <div className="flex flex-col gap-4">
                    {speakingFrequencies.map((frequency) => {
                        const isSelected = selectedFrequency === frequency.value;

                        return (
                            <button
                                key={frequency.value}
                                type="button"
                                onClick={() => handleSelect(frequency.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select ${frequency.title} speaking frequency`}
                                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                        : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                                        <span className="text-3xl" role="img" aria-hidden="true">
                                            {frequency.emoji}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                                            {frequency.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                            {frequency.description}
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
                        Your speaking plan
                    </p>
                    <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                        {activeFrequency
                            ? activeFrequency.preview
                            : "Choose how often you speak English to preview your personalized speaking focus."}
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
