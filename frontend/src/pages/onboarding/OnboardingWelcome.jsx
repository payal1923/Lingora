import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const personalizationRows = [
    { emoji: "🎯", text: "Your English goals" },
    { emoji: "📚", text: "Your current English level" },
    { emoji: "✨", text: "Topics you enjoy" },
];

const teacherStyleMessages = {
    clear: "I'll keep your learning clear, simple, and structured.",
    friendly: "I'll support you with patient guidance and positive encouragement.",
    casual: "I'll help you learn through relaxed and natural English.",
};

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingWelcome() {
    const [firstName, setFirstName] = useState("");
    const [teacherLine, setTeacherLine] = useState(
        "I'll help you learn English step by step."
    );
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedStyle = localStorage.getItem("lingora_onboarding_teacher_style");
        if (savedStyle && teacherStyleMessages[savedStyle]) {
            setTeacherLine(teacherStyleMessages[savedStyle]);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/teacher-style");
    };

    const handleContinue = () => {
        navigate("/onboarding/age");
    };

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

                <div className="flex flex-col items-center">
                    <div
                        className="relative flex h-52 w-52 items-center justify-center"
                        aria-hidden="true"
                    >
                        <div className="absolute h-44 w-44 rounded-full bg-blue-300/40 blur-2xl animate-pulse" />

                        <div className="absolute -top-1 right-4 h-3 w-3 rounded-full bg-blue-300 animate-pulse" />
                        <div className="absolute bottom-4 -left-2 h-2 w-2 rounded-full bg-indigo-300 animate-pulse" />
                        <div className="absolute top-8 -right-3 h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />

                        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl">
                            <div className="absolute -top-4 h-6 w-1.5 rounded-full bg-gradient-to-b from-blue-400 to-indigo-400" />
                            <div className="absolute -top-6 h-3 w-3 rounded-full bg-blue-400" />

                            <div className="flex h-28 w-28 flex-col items-center justify-center gap-3 rounded-full bg-white">
                                <div className="flex gap-4">
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                </div>
                                <div className="h-2 w-8 rounded-full border-b-2 border-blue-500" />
                            </div>
                        </div>
                    </div>

                    <h1 className="mt-6 text-center text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight leading-snug">
                        {firstName ? (
                            <>
                                Are you ready,
                                <br />
                                {firstName}?
                            </>
                        ) : (
                            <>
                                Are you ready
                                <br />
                                to begin?
                            </>
                        )}
                    </h1>

                    <p className="mt-3 mx-auto max-w-md text-center text-base text-slate-500 leading-relaxed">
                        Just a few quick questions and I&apos;ll build a learning experience
                        around your English level, goals, and interests.
                    </p>

                    <p className="mt-3 text-center text-sm font-medium text-blue-700">
                        {teacherLine}
                    </p>
                </div>

                <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="mb-4 text-sm font-semibold text-slate-800">
                        Your Lingora journey will be personalized for:
                    </p>
                    <div className="flex flex-col gap-4">
                        {personalizationRows.map((row) => (
                            <div key={row.text} className="flex items-center gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                                    <span className="text-lg" role="img" aria-hidden="true">
                                        {row.emoji}
                                    </span>
                                </div>
                                <span className="font-medium text-slate-700">{row.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-10">
                    <button
                        type="button"
                        onClick={handleContinue}
                        className="w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-blue-700 cursor-pointer"
                    >
                        Let&apos;s do it
                    </button>
                </div>
            </div>
        </div>
    );
}
