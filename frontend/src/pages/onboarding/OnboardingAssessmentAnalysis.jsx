import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const levelDetails = {
    beginner: {
        title: "Beginner",
        emoji: "🌱",
        message:
            "You're building your English foundation. Lingora will help you learn essential words, simple sentences, and basic conversations.",
        focus: ["Basic vocabulary", "Simple sentences", "Everyday conversations"],
    },
    elementary: {
        title: "Elementary",
        emoji: "📘",
        message:
            "You already understand some English basics. Lingora will help you build stronger sentences and speak with more confidence.",
        focus: ["Sentence building", "Useful vocabulary", "Speaking confidence"],
    },
    intermediate: {
        title: "Intermediate",
        emoji: "💬",
        message:
            "You have a good English foundation. Lingora will help you communicate more naturally and improve your fluency.",
        focus: ["Natural conversations", "Grammar accuracy", "Practical vocabulary"],
    },
    upper_intermediate: {
        title: "Upper Intermediate",
        emoji: "🚀",
        message:
            "You can communicate well in English. Lingora will help you express complex ideas more naturally and confidently.",
        focus: ["Natural expressions", "Complex conversations", "Speaking fluency"],
    },
    advanced: {
        title: "Advanced",
        emoji: "🏆",
        message:
            "You have strong English skills. Lingora will help you refine your fluency, precision, and natural communication.",
        focus: ["Fluency", "Precision", "Advanced expressions"],
    },
};

const VALID_LEVELS = Object.keys(levelDetails);

function getFirstName(name) {
    if (!name) return "";

    const parts = name.trim().split(/\s+/).filter(Boolean);

    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingAssessmentAnalysis() {
    const [firstName, setFirstName] = useState("");
    const [assessedLevel, setAssessedLevel] = useState("beginner");
    const [assessmentScore, setAssessmentScore] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedLevel = localStorage.getItem(
            "lingora_onboarding_assessed_level"
        );

        const savedScore = localStorage.getItem(
            "lingora_onboarding_assessment_score"
        );

        if (VALID_LEVELS.includes(savedLevel)) {
            setAssessedLevel(savedLevel);
        }

        if (savedScore !== null) {
            setAssessmentScore(savedScore);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/assessment-intro");
    };

    const handleContinue = () => {
        navigate("/onboarding/personalization-ready");
    };

    const activeLevel = levelDetails[assessedLevel];

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50">
            <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col px-6 pb-12 pt-8 sm:pt-10">
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Go back"
                    className="mb-6 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 hover:bg-slate-100 cursor-pointer"
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

                <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-48 w-48 items-center justify-center">
                        <div className="absolute h-40 w-40 rounded-full bg-blue-300/40 blur-2xl animate-pulse" />

                        <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                                <span
                                    className="text-5xl"
                                    role="img"
                                    aria-label={activeLevel.title}
                                >
                                    {activeLevel.emoji}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Your English level
                    </p>

                    <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                        {activeLevel.title}
                    </h1>

                    <p className="mt-4 mx-auto max-w-md text-base text-slate-500 leading-relaxed">
                        {firstName
                            ? `${firstName}, ${activeLevel.message}`
                            : activeLevel.message}
                    </p>
                </div>

                {assessmentScore && (
                    <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center">
                        <p className="text-sm text-slate-600">
                            Quick check score
                        </p>

                        <p className="mt-1 text-xl font-bold text-blue-700">
                            {assessmentScore}
                        </p>
                    </div>
                )}

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-800">
                        Lingora will focus on
                    </p>

                    <div className="mt-4 flex flex-col gap-4">
                        {activeLevel.focus.map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2.5}
                                        stroke="currentColor"
                                        className="h-5 w-5 text-blue-600"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5"
                                        />
                                    </svg>
                                </div>

                                <span className="font-medium text-slate-700">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        ✨ Your level is only a starting point. Lingora will continuously
                        adapt as your English improves.
                    </p>
                </div>

                <div className="mt-auto pt-10">
                    <button
                        type="button"
                        onClick={handleContinue}
                        className="w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-blue-700 cursor-pointer"
                    >
                        Build my learning plan
                    </button>
                </div>
            </div>
        </div>
    );
}