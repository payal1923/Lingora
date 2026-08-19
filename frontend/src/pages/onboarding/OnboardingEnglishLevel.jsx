import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const englishLevels = [
    {
        value: "beginner",
        level: 1,
        title: "Beginner",
        description: "I can say a few basic English words.",
        preview:
            "Lingora will start with basic words, simple grammar, and easy conversations.",
    },
    {
        value: "elementary",
        level: 2,
        title: "Elementary",
        description: "I can use simple sentences about familiar topics.",
        preview:
            "Lingora will help you build stronger sentences and everyday vocabulary.",
    },
    {
        value: "intermediate",
        level: 3,
        title: "Intermediate",
        description: "I can have short conversations in English.",
        preview:
            "Lingora will focus on conversation confidence, grammar, and practical vocabulary.",
    },
    {
        value: "upper_intermediate",
        level: 4,
        title: "Upper Intermediate",
        description: "I can discuss different topics and explain my ideas.",
        preview:
            "Lingora will help you express ideas naturally and discuss more complex topics.",
    },
    {
        value: "advanced",
        level: 5,
        title: "Advanced",
        description:
            "I speak English quite fluently and understand complex conversations.",
        preview:
            "Lingora will focus on fluency, precision, natural expressions, and complex conversations.",
    },
];

const VALID_LEVEL_VALUES = englishLevels.map((level) => level.value);

export default function OnboardingEnglishLevel() {
    const [selectedLevel, setSelectedLevel] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedLevel = localStorage.getItem("lingora_onboarding_english_level");
        if (VALID_LEVEL_VALUES.includes(savedLevel)) {
            setSelectedLevel(savedLevel);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/age");
    };

    const handleSelect = (value) => {
        setSelectedLevel(value);
    };

    const handleContinue = () => {
        if (!selectedLevel) return;
        localStorage.setItem("lingora_onboarding_english_level", selectedLevel);
        navigate("/onboarding/learning-goal");
    };

    const isDisabled = !selectedLevel;
    const activeLevel = englishLevels.find(
        (level) => level.value === selectedLevel
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
                    What&apos;s your English level?
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    Choose the option that best describes your English right now.
                </p>

                <div className="flex flex-col gap-4">
                    {englishLevels.map((level) => {
                        const isSelected = selectedLevel === level.value;

                        return (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => handleSelect(level.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select ${level.title} English level`}
                                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                        : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${isSelected
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {level.level}
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                                            {level.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                            {level.description}
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
                        {activeLevel
                            ? activeLevel.preview
                            : "Choose your level and Lingora will personalize your learning difficulty."}
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
