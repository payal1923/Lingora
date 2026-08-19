import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccentVoiceDemo from "../../components/AccentVoiceDemo";
import { ACCENTS, getPreference, setPreferredAccent } from "../../config/preferences";

export default function OnboardingEnglishPreference() {
    const [selectedPreference, setSelectedPreference] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Read from the shared preferences module first (so a returning user
        // who changed their accent in Profile sees it pre-selected), then fall
        // back to the legacy onboarding key for backward compatibility.
        const shared = getPreference("preferredAccent");
        if (shared === "american" || shared === "british") {
            setSelectedPreference(shared);
            return;
        }
        const legacy = localStorage.getItem("lingora_onboarding_english_preference");
        if (legacy === "american" || legacy === "british") {
            setSelectedPreference(legacy);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/profile-picture");
    };

    const handleSelect = (value) => {
        setSelectedPreference(value);
    };

    const handleContinue = () => {
        if (!selectedPreference) return;

        // Save to BOTH the shared preferences module (so Profile and every
        // audio module read the same source of truth) and the legacy
        // onboarding key (backward compatibility with any code that still
        // reads it directly).
        setPreferredAccent(selectedPreference);
        localStorage.setItem(
            "lingora_onboarding_english_preference",
            selectedPreference
        );

        navigate("/onboarding/teacher-style");
    };

    const isDisabled = !selectedPreference;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white via-blue-50/40 to-indigo-50/30">
            <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] sm:px-6 sm:pt-10">
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Go back"
                    className="mb-6 flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 hover:bg-slate-100 active:bg-slate-200 cursor-pointer touch-manipulation"
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

                <div className="mb-6">
                    <span className="inline-flex items-center rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-700">
                        🎧 Accent
                    </span>
                    <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight leading-snug">
                        Which English do you
                        <br />
                        want to learn?
                    </h1>
                    <p className="mt-3 text-base text-slate-500 leading-relaxed">
                        Choose the accent Lingora should use while teaching you. Tap{" "}
                        <span className="font-semibold text-slate-700">Play Demo</span>{" "}
                        to hear each one.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {ACCENTS.map((preference) => {
                        const isSelected = selectedPreference === preference.key;

                        return (
                            <div
                                key={preference.key}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSelect(preference.key)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleSelect(preference.key);
                                    }
                                }}
                                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer touch-manipulation ${isSelected
                                        ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-200 shadow-md"
                                        : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-3xl">
                                        <span role="img" aria-label={preference.label}>
                                            {preference.flag}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                                            {preference.label}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                            {preference.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${isSelected
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

                                {/* Voice demo row — stops click propagation so
                                    tapping Play doesn't also toggle selection. */}
                                <div
                                    className="mt-4 flex items-center justify-between gap-3"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="text-xs text-slate-400">
                                        Hear a sample
                                    </span>
                                    <AccentVoiceDemo
                                        accent={preference}
                                        active={isSelected}
                                        size="sm"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto pt-10">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isDisabled}
                        className={`w-full rounded-2xl py-4 text-base font-bold text-white transition-colors duration-200 touch-manipulation min-h-[52px] ${isDisabled
                                ? "bg-blue-200 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
                            }`}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
