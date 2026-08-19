// NotificationsSettingsModal.jsx
// ------------------------------
// Real notification settings modal (replaces the old "coming soon" alert).
// Stores preferences in the shared preferences module so they persist and
// can be read by a future push-notification service.
//
// Toggles: Daily reminders, Lesson updates, Streak warnings, Achievement
// unlocks, Weekly progress. Plus a reminder-time picker.

import { useState } from "react";
import {
    getPreference,
    setPreference,
} from "../config/preferences";

const DEFAULTS = {
    notifications: true,
    reminderTime: "20:00",
};

const TOGGLES = [
    { key: "notif_daily", label: "Daily Reminders", hint: "Get nudged to keep your streak", icon: "🔔", storage: "notifications" },
    { key: "notif_lessons", label: "Lesson Updates", hint: "New lessons & roadmap changes", icon: "📚" },
    { key: "notif_streak", label: "Streak Warnings", hint: "Alert before you lose a streak", icon: "🔥" },
    { key: "notif_achievements", label: "Achievement Unlocks", hint: "Celebrate new badges", icon: "🏆" },
    { key: "notif_weekly", label: "Weekly Progress", hint: "Summary of your week", icon: "📊" },
];

const TIME_SLOTS = [
    "06:00", "07:00", "08:00", "09:00", "10:00",
    "12:00", "14:00", "16:00", "18:00",
    "19:00", "20:00", "21:00", "22:00",
];

function formatTime(t) {
    if (!t) return "8:00 PM";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function NotificationsSettingsModal({ open, onClose }) {
    const [master, setMaster] = useState(() => getPreference("notifications") ?? DEFAULTS.notifications);
    const [reminderTime, setReminderTime] = useState(() => getPreference("reminderTime") ?? DEFAULTS.reminderTime);
    const [toggles, setToggles] = useState(() => {
        const saved = {};
        TOGGLES.forEach((t) => {
            if (t.storage) {
                saved[t.key] = getPreference(t.storage) ?? true;
            } else {
                saved[t.key] = getPreference(t.key) ?? true;
            }
        });
        return saved;
    });

    if (!open) return null;

    const toggleItem = (key) => {
        setToggles((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            // Persist master "notifications" pref when its toggle changes.
            const def = TOGGLES.find((t) => t.key === key);
            if (def?.storage) setPreference(def.storage, next[key]);
            else setPreference(key, next[key]);
            return next;
        });
    };

    const handleMaster = (next) => {
        setMaster(next);
        setPreference("notifications", next);
        // When turning master off, turn all sub-toggles off; on -> all on.
        const updated = {};
        TOGGLES.forEach((t) => {
            updated[t.key] = next;
            if (t.storage) setPreference(t.storage, next);
            else setPreference(t.key, next);
        });
        setToggles(updated);
    };

    const handleTime = (t) => {
        setReminderTime(t);
        setPreference("reminderTime", t);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:px-4">
            <button
                type="button"
                aria-label="Close notification settings"
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
                                Notification Settings
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Choose what Lingora reminds you about.
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

                    {/* Master toggle */}
                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">All Notifications</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {master ? "On" : "Off"}
                            </p>
                        </div>
                        <Toggle on={master} onChange={handleMaster} />
                    </div>

                    {/* Reminder time */}
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Daily Reminder Time</p>
                        <div className="flex flex-wrap gap-2">
                            {TIME_SLOTS.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleTime(t)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition touch-manipulation cursor-pointer ${reminderTime === t
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {formatTime(t)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sub-toggles */}
                    <div className={`mt-5 flex flex-col gap-2.5 transition ${master ? "" : "opacity-50 pointer-events-none"}`}>
                        {TOGGLES.map((t) => (
                            <div
                                key={t.key}
                                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{t.icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">{t.hint}</p>
                                    </div>
                                </div>
                                <Toggle on={toggles[t.key]} onChange={() => toggleItem(t.key)} />
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

function Toggle({ on, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 min-h-[24px] min-w-[44px] flex-shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer touch-manipulation ${on ? "bg-indigo-600" : "bg-slate-300"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );
}
