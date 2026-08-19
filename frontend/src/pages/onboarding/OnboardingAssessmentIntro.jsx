import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const englishLevelLabels = {
    beginner: "Beginner",
    elementary: "Elementary",
    intermediate: "Intermediate",
    upper_intermediate: "Upper Intermediate",
    advanced: "Advanced",
};

const VALID_ENGLISH_LEVELS = Object.keys(englishLevelLabels);

const infoRows = [
    {
        emoji: "⚡",
        title: "5 quick questions",
        description: "Short and simple.",
    },
    {
        emoji: "⏱️",
        title: "About 2 minutes",
        description: "Finish at your own pace.",
    },
    {
        emoji: "🌱",
        title: "Mistakes are okay",
        description: "They help Lingora understand what to teach you.",
    },
];

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingAssessmentIntro() {
    const [firstName, setFirstName] = useState("");
    const [englishLevel, setEnglishLevel] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedLevel = localStorage.getItem("lingora_onboarding_english_level");
        if (VALID_ENGLISH_LEVELS.includes(savedLevel)) {
            setEnglishLevel(savedLevel);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/daily-goal");
    };

    const handleStartAssessment = () => {
        localStorage.removeItem("lingora_onboarding_assessment_answers");
        localStorage.removeItem("lingora_onboarding_assessment_question_index");
        navigate("/onboarding/assessment");
    };

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

                <div
                    className="relative mx-auto flex h-52 w-52 items-center justify-center"
                    aria-hidden="true"
                >
                    <div className="absolute h-44 w-44 rounded-full bg-blue-300/40 blur-2xl animate-pulse" />

                    <div className="absolute -top-1 right-6 h-3 w-3 rounded-full bg-blue-300 animate-pulse" />
                    <div className="absolute bottom-6 -left-2 h-2 w-2 rounded-full bg-indigo-300 animate-pulse" />
                    <div className="absolute top-10 -right-3 h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />

                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.8}
                                stroke="currentColor"
                                className="h-12 w-12 text-blue-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 15.75 3 21l1.5-5.25M3.75 9a8.25 8.25 0 1 1 4.106 7.128L3.75 17.25V9Z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m8.25 12 2.25 2.25L15 9.75"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="mt-6 text-center text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight leading-snug">
                    {firstName ? (
                        <>
                            Let&apos;s find your English
                            <br />
                            starting point, {firstName}
                        </>
                    ) : (
                        <>
                            Let&apos;s find your English
                            <br />
                            starting point
                        </>
                    )}
                </h1>

                <p className="mt-3 mx-auto max-w-md text-center text-base text-slate-500 leading-relaxed">
                    Take a quick English check so Lingora can personalize your learning
                    journey more accurately.
                </p>

                {englishLevel && (
                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            You selected{" "}
                            <span className="font-semibold text-blue-700">
                                {englishLevelLabels[englishLevel]}
                            </span>{" "}
                            earlier. This quick check helps Lingora understand your skills a
                            little better.
                        </p>
                    </div>
                )}

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">
                        Your quick English check
                    </p>
                    <div className="mt-4 flex flex-col gap-4">
                        {infoRows.map((row) => (
                            <div key={row.title} className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                                    <span className="text-xl" role="img" aria-hidden="true">
                                        {row.emoji}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                                        {row.title}
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">
                                        {row.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="mt-5 text-center text-sm font-medium text-blue-700">
                    Don&apos;t overthink your answers. Just choose what feels right.
                </p>

                <div className="mt-auto pt-10">
                    <button
                        type="button"
                        onClick={handleStartAssessment}
                        className="w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-blue-700 cursor-pointer"
                    >
                        Start quick check
                    </button>
                </div>
            </div>
        </div>
    );
}
