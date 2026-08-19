// PrivacySettingsModal.jsx
// ------------------------
// Real privacy settings modal (replaces the old "coming soon" alert).
// Stores the visibility preference in the shared preferences module.

import { useState } from "react";
import { getPreference, setPreference } from "../config/preferences";

const OPTIONS = [
    { key: "public", label: "Public", hint: "Anyone can see your profile on the leaderboard", icon: "🌍" },
    { key: "friends", label: "Friends Only", hint: "Only your connections can see your activity", icon: "👥" },
    { key: "private", label: "Private", hint: "Only you can see your activity", icon: "🔒" },
];

const TOGGLES = [
    { key: "privacy_showxp", label: "Show XP on Leaderboard", hint: "Display your XP publicly" },
    { key: "privacy_showstreak", label: "Show Streak", hint: "Display your streak count" },
    { key: "privacy_showprogress", label: "Show Learning Progress", hint: "Let others see your lesson progress" },
];

export default function PrivacySettingsModal({ open, onClose }) {
    const [visibility, setVisibility] = useState(() => getPreference("privacy") || "friends");
    const [toggles, setToggles] = useState(() => {
        const saved = {};
        TOGGLES.forEach((t) => {
            saved[t.key] = getPreference(t.key) ?? true;
        });
        return saved;
    });

    if (!open) return null;

    const handleVisibility = (key) => {
        setVisibility(key);
        setPreference("privacy", key);
    };

    const handleToggle = (key) => {
        setToggles((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            setPreference(key, next[key]);
            return next;
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:px-4">
            <button
                type="button"
                aria-label="Close privacy settings"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xl pb-[env(safe-area-inset-bottom)]">
                <div className="sm:hidden sticky top-0 z-10 flex justify-center bg-white pt-3 pb-2">
                    <span className="h-1.5 w-10 rounded-full bg-slate-200" />
                </div>

                <div className="px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                                Privacy Settings
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Control who can see your Lingora activity.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer touch-manipulation"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Visibility */}
                    <div className="mt-5 flex flex-col gap-2.5">
                        {OPTIONS.map((opt) => {
                            const isSelected = visibility === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => handleVisibility(opt.key)}
                                    className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 touch-manipulation min-h-[52px] cursor-pointer ${isSelected
                                            ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-200"
                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                        }`}
                                >
                                    <span className="text-xl flex-shrink-0">{opt.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>
                                            {opt.label}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">{opt.hint}</p>
                                    </div>
                                    {isSelected && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-indigo-600 flex-shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Toggles */}
                    <div className="mt-5 flex flex-col gap-2.5">
                        {TOGGLES.map((t) => (
                            <div
                                key={t.key}
                                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">{t.hint}</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={toggles[t.key]}
                                    onClick={() => handleToggle(t.key)}
                                    className={`relative inline-flex h-6 w-11 min-h-[24px] min-w-[44px] flex-shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer touch-manipulation ${toggles[t.key] ? "bg-indigo-600" : "bg-slate-300"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${toggles[t.key] ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer touch-manipulation min-h-[48px]"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
