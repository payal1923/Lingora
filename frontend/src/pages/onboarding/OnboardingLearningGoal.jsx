import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const learningGoals = [
    {
        value: "speak_confidently",
        emoji: "💬",
        title: "Speak confidently",
        description:
            "Feel comfortable speaking English in everyday conversations.",
        preview:
            "Lingora will prioritize speaking practice, everyday conversations, and confidence-building exercises.",
    },
    {
        value: "career",
        emoji: "💼",
        title: "Career & interviews",
        description:
            "Improve English for jobs, interviews, and professional communication.",
        preview:
            "Lingora will focus on interview English, professional vocabulary, and workplace communication.",
    },
    {
        value: "study",
        emoji: "🎓",
        title: "Study & exams",
        description:
            "Build English skills for college, exams, and academic learning.",
        preview:
            "Lingora will focus on academic English, clear grammar, reading, and exam-friendly learning.",
    },
    {
        value: "travel",
        emoji: "✈️",
        title: "Travel",
        description:
            "Speak and understand English while travelling and meeting new people.",
        preview:
            "Lingora will prioritize practical travel conversations, listening, and useful everyday phrases.",
    },
    {
        value: "grammar",
        emoji: "📝",
        title: "Improve grammar",
        description:
            "Understand grammar and build more accurate English sentences.",
        preview:
            "Lingora will give extra focus to grammar patterns, sentence building, and accurate English.",
    },
    {
        value: "vocabulary",
        emoji: "📚",
        title: "Build vocabulary",
        description: "Learn useful words, phrases, and natural English expressions.",
        preview:
            "Lingora will help you learn useful words, phrases, and natural expressions step by step.",
    },
    {
        value: "fluency",
        emoji: "🚀",
        title: "Become fluent",
        description:
            "Improve overall English and communicate naturally with confidence.",
        preview:
            "Lingora will balance speaking, vocabulary, grammar, and natural conversation to build overall fluency.",
    },
];

const VALID_GOAL_VALUES = learningGoals.map((goal) => goal.value);

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingLearningGoal() {
    const [selectedGoal, setSelectedGoal] = useState("");
    const [firstName, setFirstName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedGoal = localStorage.getItem("lingora_onboarding_learning_goal");
        if (VALID_GOAL_VALUES.includes(savedGoal)) {
            setSelectedGoal(savedGoal);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/english-level");
    };

    const handleSelect = (value) => {
        setSelectedGoal(value);
    };

    const handleContinue = () => {
        if (!selectedGoal) return;
        localStorage.setItem("lingora_onboarding_learning_goal", selectedGoal);
        navigate("/onboarding/correction-style");
    };

    const isDisabled = !selectedGoal;
    const activeGoal = learningGoals.find((goal) => goal.value === selectedGoal);

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
                            What&apos;s your main goal,
                            <br />
                            {firstName}?
                        </>
                    ) : (
                        <>
                            What&apos;s your main
                            <br />
                            English goal?
                        </>
                    )}
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    Choose the one goal that matters most to you right now.
                </p>

                <div className="flex flex-col gap-4">
                    {learningGoals.map((goal) => {
                        const isSelected = selectedGoal === goal.value;

                        return (
                            <button
                                key={goal.value}
                                type="button"
                                onClick={() => handleSelect(goal.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select ${goal.title} as your main learning goal`}
                                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                        : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                                        <span className="text-2xl" role="img" aria-hidden="true">
                                            {goal.emoji}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                                            {goal.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                            {goal.description}
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

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <span className="text-lg" role="img" aria-hidden="true">
                        ✨
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {activeGoal
                            ? activeGoal.preview
                            : "Choose your main goal and Lingora will shape your learning journey around it."}
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
