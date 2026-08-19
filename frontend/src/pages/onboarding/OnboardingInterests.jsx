import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const interests = [
    { value: "technology", emoji: "💻", title: "Technology" },
    { value: "business", emoji: "💼", title: "Business" },
    { value: "travel", emoji: "✈️", title: "Travel" },
    { value: "music", emoji: "🎵", title: "Music" },
    { value: "movies", emoji: "🎬", title: "Movies & TV" },
    { value: "sports", emoji: "⚽", title: "Sports" },
    { value: "gaming", emoji: "🎮", title: "Gaming" },
    { value: "food", emoji: "🍕", title: "Food" },
    { value: "fitness", emoji: "🏋️", title: "Fitness" },
    { value: "science", emoji: "🔬", title: "Science" },
    { value: "finance", emoji: "💰", title: "Finance" },
    { value: "fashion", emoji: "👕", title: "Fashion" },
    { value: "books", emoji: "📖", title: "Books" },
    { value: "social", emoji: "🗣️", title: "Social life" },
    { value: "culture", emoji: "🌍", title: "Culture" },
];

const VALID_INTEREST_VALUES = interests.map((interest) => interest.value);
const MIN_INTERESTS = 3;

function getFirstName(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[0] : "";
}

export default function OnboardingInterests() {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [firstName, setFirstName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setFirstName(getFirstName(savedName));

        const savedInterests = localStorage.getItem("lingora_onboarding_interests");
        let parsedInterests = [];

        try {
            const parsed = JSON.parse(savedInterests);
            if (Array.isArray(parsed)) {
                parsedInterests = parsed;
            }
        } catch {
            parsedInterests = [];
        }

        const validUniqueInterests = Array.from(
            new Set(
                parsedInterests.filter((value) => VALID_INTEREST_VALUES.includes(value))
            )
        );

        setSelectedInterests(validUniqueInterests);
    }, []);

    const handleBack = () => {
        navigate("/onboarding/correction-style");
    };

    const handleToggleInterest = (value) => {
        setSelectedInterests((previousInterests) => {
            if (previousInterests.includes(value)) {
                return previousInterests.filter((interest) => interest !== value);
            }

            return [...previousInterests, value];
        });
    };

    const handleContinue = () => {
        if (selectedInterests.length < MIN_INTERESTS) return;
        localStorage.setItem(
            "lingora_onboarding_interests",
            JSON.stringify(selectedInterests)
        );
        navigate("/onboarding/speaking-frequency");
    };

    const count = selectedInterests.length;
    const hasMinimum = count >= MIN_INTERESTS;
    const isDisabled = !hasMinimum;

    const selectionLabel =
        count === 0
            ? "Select at least 3 interests"
            : count === 1
                ? "1 interest selected"
                : `${count} interests selected`;

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
                            What are you interested in,
                            <br />
                            {firstName}?
                        </>
                    ) : (
                        <>
                            What are you
                            <br />
                            interested in?
                        </>
                    )}
                </h1>
                <p className="mt-3 text-base text-slate-500 leading-relaxed">
                    Choose at least 3 topics. Lingora will use them to make your English
                    practice more interesting.
                </p>

                <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-600">
                        {selectionLabel}
                    </span>
                    <span
                        className={`text-sm font-semibold ${hasMinimum ? "text-blue-600" : "text-slate-400"
                            }`}
                    >
                        {count}/{MIN_INTERESTS} minimum
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {interests.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.value);

                        return (
                            <button
                                key={interest.value}
                                type="button"
                                onClick={() => handleToggleInterest(interest.value)}
                                aria-pressed={isSelected}
                                aria-label={
                                    isSelected
                                        ? `Remove ${interest.title} interest`
                                        : `Select ${interest.title} interest`
                                }
                                className={`relative rounded-2xl border bg-white px-4 py-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                    : "border-slate-200"
                                    }`}
                            >
                                <span
                                    className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected
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
                                            className="h-3 w-3"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m4.5 12.75 6 6 9-13.5"
                                            />
                                        </svg>
                                    )}
                                </span>

                                <span
                                    className="block text-3xl sm:text-4xl"
                                    role="img"
                                    aria-hidden="true"
                                >
                                    {interest.emoji}
                                </span>
                                <span className="mt-3 block text-sm sm:text-base font-semibold text-slate-800">
                                    {interest.title}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <span className="text-lg" role="img" aria-hidden="true">
                        ✨
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {hasMinimum
                            ? "Great choices! Lingora will use these topics to make your English practice more relevant to you."
                            : "Choose at least 3 topics so Lingora can personalize your examples and conversations."}
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
