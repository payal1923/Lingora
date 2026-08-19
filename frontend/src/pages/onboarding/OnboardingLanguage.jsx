import { useState } from "react";
import { useNavigate } from "react-router-dom";

const popularLanguages = [
    { name: "Marathi", nativeName: "मराठी", value: "marathi" },
    { name: "Hindi", nativeName: "हिन्दी", value: "hindi" },
    { name: "English", nativeName: "", value: "english" },
    { name: "Gujarati", nativeName: "ગુજરાતી", value: "gujarati" },
    { name: "Tamil", nativeName: "தமிழ்", value: "tamil" },
    { name: "Telugu", nativeName: "తెలుగు", value: "telugu" },
];

const allLanguages = [
    { name: "Bengali", nativeName: "বাংলা", value: "bengali" },
    { name: "Kannada", nativeName: "ಕನ್ನಡ", value: "kannada" },
    { name: "Malayalam", nativeName: "മലയാളം", value: "malayalam" },
    { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", value: "punjabi" },
    { name: "Urdu", nativeName: "اردو", value: "urdu" },
    { name: "Arabic", nativeName: "عربي", value: "arabic" },
    { name: "Spanish", nativeName: "Español", value: "spanish" },
    { name: "Portuguese", nativeName: "Português", value: "portuguese" },
    { name: "French", nativeName: "Français", value: "french" },
    { name: "German", nativeName: "Deutsch", value: "german" },
    { name: "Japanese", nativeName: "日本語", value: "japanese" },
    { name: "Chinese (Simplified)", nativeName: "简体字", value: "chinese_simplified" },
];

export default function OnboardingLanguage() {
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const navigate = useNavigate();

    const handleSelect = (value) => {
        setSelectedLanguage(value);
    };

    const handleContinue = () => {
        if (!selectedLanguage) return;
        localStorage.setItem("lingora_onboarding_language", selectedLanguage);
        navigate("/onboarding/name");
    };

    const renderLanguageCard = (language) => {
        const isSelected = selectedLanguage === language.value;

        return (
            <button
                key={language.value}
                type="button"
                onClick={() => handleSelect(language.value)}
                className={`w-full flex items-center gap-2 rounded-2xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                        ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200 shadow-sm"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}
            >
                <span className="font-semibold text-slate-800">{language.name}</span>
                {language.nativeName && (
                    <>
                        <span className="text-slate-300">|</span>
                        <span className="font-normal text-slate-600">{language.nativeName}</span>
                    </>
                )}
            </button>
        );
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50">
            <div className="mx-auto w-full max-w-[700px] px-6 pb-12 pt-14 sm:pt-20">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                    What&apos;s your native language?
                </h1>
                <p className="mt-3 mb-8 text-base text-slate-500 leading-relaxed">
                    You&apos;ll get feedback and assistance in your native language.
                </p>

                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Popular
                </h2>
                <div className="flex flex-col gap-3 mb-10">
                    {popularLanguages.map((language) => renderLanguageCard(language))}
                </div>

                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    All languages
                </h2>
                <div className="flex flex-col gap-3 mb-10">
                    {allLanguages.map((language) => renderLanguageCard(language))}
                </div>

                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!selectedLanguage}
                    className={`w-full rounded-2xl py-4 text-base font-bold text-white transition-colors duration-200 ${selectedLanguage
                            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            : "bg-blue-200 cursor-not-allowed"
                        }`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
