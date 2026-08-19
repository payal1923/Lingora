import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const dailyGoals = [
    {
        value: "5",
        minutes: 5,
        emoji: "🌱",
        title: "5 minutes",
        label: "Easy start",
        description: "A quick daily English practice.",
        preview:
            "Perfect for building a simple daily English habit without feeling overwhelmed.",
    },
    {
        value: "10",
        minutes: 10,
        emoji: "☕",
        title: "10 minutes",
        label: "Casual",
        description: "A short and comfortable daily session.",
        preview:
            "Lingora will give you short daily practice with vocabulary, speaking, and simple learning activities.",
    },
    {
        value: "15",
        minutes: 15,
        emoji: "🔥",
        title: "15 minutes",
        label: "Recommended",
        description: "A balanced daily learning routine.",
        preview:
            "A balanced goal for steady progress. Lingora can combine lessons, vocabulary, and speaking practice.",
    },
    {
        value: "20",
        minutes: 20,
        emoji: "🚀",
        title: "20 minutes",
        label: "Focused",
        description: "A focused daily English session.",
        preview:
            "Lingora will recommend deeper practice with longer lessons, conversations, and skill-building activities.",
    },
    {
        value: "30",
        minutes: 30,
        emoji: "🏆",
        title: "30 minutes",
        label: "Intensive",
        description: "A serious daily English learning routine.",
        preview:
            "Lingora will create a more intensive learning routine with stronger daily practice and faster progression.",
    },
];

const VALID_DAILY_GOAL_VALUES = dailyGoals.map((goal) => goal.value);

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingDailyGoal() {
    const [selectedGoal, setSelectedGoal] = useState("");
    const [firstName, setFirstName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedGoal = localStorage.getItem("lingora_onboarding_daily_goal");
        if (VALID_DAILY_GOAL_VALUES.includes(savedGoal)) {
            setSelectedGoal(savedGoal);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/speaking-frequency");
    };

    const handleSelect = (value) => {
        setSelectedGoal(value);
    };

    const handleContinue = () => {
        if (!selectedGoal) return;
        localStorage.setItem("lingora_onboarding_daily_goal", selectedGoal);
        navigate("/onboarding/assessment-intro");
    };

    const isDisabled = !selectedGoal;
    const activeGoal = dailyGoals.find((goal) => goal.value === selectedGoal);

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
                            How much time can you
                            <br />
                            practice daily, {firstName}?
                        </>
                    ) : (
                        <>
                            How much time can you
                            <br />
                            practice every day?
                        </>
                    )}
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    Choose a realistic daily goal. Consistency matters more than
                    studying for hours.
                </p>

                <div className="flex flex-col gap-4">
                    {dailyGoals.map((goal) => {
                        const isSelected = selectedGoal === goal.value;
                        const isRecommended = goal.label === "Recommended";

                        return (
                            <button
                                key={goal.value}
                                type="button"
                                onClick={() => handleSelect(goal.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select ${goal.title} daily learning goal`}
                                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                        : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                                        <span className="text-3xl" role="img" aria-hidden="true">
                                            {goal.emoji}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                                                {goal.title}
                                            </h2>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isRecommended
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-slate-100 text-slate-500"
                                                    }`}
                                            >
                                                {goal.label}
                                            </span>
                                        </div>
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

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
                    <p className="text-sm font-semibold text-blue-700">
                        Your daily plan
                    </p>
                    <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                        {activeGoal
                            ? activeGoal.preview
                            : "Choose a daily goal to preview your recommended Lingora learning routine."}
                    </p>
                    {activeGoal && (
                        <p className="mt-3 text-sm font-semibold text-blue-600">
                            Daily target: {activeGoal.minutes} minutes
                        </p>
                    )}
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
