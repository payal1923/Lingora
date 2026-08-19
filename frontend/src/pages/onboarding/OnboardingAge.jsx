import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ageGroups = [
    { value: "under_12", label: "Under 12" },
    { value: "12_15", label: "12 – 15" },
    { value: "16_24", label: "16 – 24" },
    { value: "25_34", label: "25 – 34" },
    { value: "35_44", label: "35 – 44" },
    { value: "45_54", label: "45 – 54" },
    { value: "55_64", label: "55 – 64" },
    { value: "65_plus", label: "65 or older" },
];

const VALID_AGE_VALUES = ageGroups.map((age) => age.value);

export default function OnboardingAge() {
    const [selectedAge, setSelectedAge] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedAge = localStorage.getItem("lingora_onboarding_age_group");
        if (VALID_AGE_VALUES.includes(savedAge)) {
            setSelectedAge(savedAge);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/welcome");
    };

    const handleSelect = (value) => {
        setSelectedAge(value);
    };

    const handleContinue = () => {
        if (!selectedAge) return;
        localStorage.setItem("lingora_onboarding_age_group", selectedAge);
        navigate("/onboarding/english-level");
    };

    const isDisabled = !selectedAge;

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
                    How old are you?
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    This helps Lingora recommend learning content that feels relevant to
                    you.
                </p>

                <div className="flex flex-col gap-3">
                    {ageGroups.map((age) => {
                        const isSelected = selectedAge === age.value;

                        return (
                            <button
                                key={age.value}
                                type="button"
                                onClick={() => handleSelect(age.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select age group ${age.label}`}
                                className={`w-full flex items-center justify-between rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                        : "border-slate-200"
                                    }`}
                            >
                                <span className="text-base sm:text-lg font-semibold text-slate-800">
                                    {age.label}
                                </span>

                                <span
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
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-5 w-5 flex-shrink-0 text-blue-500"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.25 11.25h.008v.008h-.008V11.25Zm0-3.75h.008v.008h-.008V7.5ZM12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 12v4.5"
                        />
                    </svg>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Your age group helps Lingora choose more relevant examples and
                        conversation topics.
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
