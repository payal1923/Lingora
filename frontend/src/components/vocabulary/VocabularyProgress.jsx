import { useEffect, useState } from "react";

/**
 * VocabularyProgress
 * ------------------
 * Premium progress dashboard for the Vocabulary module.
 *
 * Props:
 *   data - object with: learned_words, total_words, progress, streak,
 *          xp, weekly_goal, weekly_progress, mastered_words, due_today
 *
 * Animates the progress bars from 0 to their target value on mount.
 */
export default function VocabularyProgress({ data }) {
    const {
        learned_words = 0,
        total_words = 0,
        progress = 0,
        streak = 0,
        xp = 0,
        weekly_goal = 5,
        weekly_progress = 0,
        mastered_words = 0,
        due_today = 0,
    } = data || {};

    const remaining = Math.max(total_words - learned_words, 0);
    const weeklyPct = weekly_goal
        ? Math.min(Math.round((weekly_progress / weekly_goal) * 100), 100)
        : 0;

    // Animate bars
    const [animProgress, setAnimProgress] = useState(0);
    const [animWeekly, setAnimWeekly] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => {
            setAnimProgress(progress);
            setAnimWeekly(weeklyPct);
        }, 80);
        return () => clearTimeout(t);
    }, [progress, weeklyPct]);

    const stats = [
        {
            label: "Words Learned",
            value: learned_words,
            icon: "📖",
            color: "from-emerald-500 to-green-500",
            text: "text-emerald-600",
        },
        {
            label: "Words Remaining",
            value: remaining,
            icon: "🧭",
            color: "from-slate-500 to-slate-600",
            text: "text-slate-600",
        },
        {
            label: "Mastered",
            value: mastered_words,
            icon: "🏆",
            color: "from-amber-500 to-orange-500",
            text: "text-amber-600",
        },
        {
            label: "Current Streak",
            value: `${streak} 🔥`,
            icon: "🔥",
            color: "from-rose-500 to-pink-500",
            text: "text-rose-600",
        },
        {
            label: "XP Earned",
            value: xp,
            icon: "⭐",
            color: "from-indigo-500 to-blue-500",
            text: "text-indigo-600",
        },
        {
            label: "Due Today",
            value: due_today,
            icon: "🔔",
            color: "from-fuchsia-500 to-purple-500",
            text: "text-fuchsia-600",
        },
    ];

    return (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                    Your Vocabulary Progress
                </h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    {progress}% Complete
                </span>
            </div>

            {/* Overall progress bar */}
            <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Overall Learning</span>
                    <span>
                        {learned_words} / {total_words} words
                    </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all duration-1000 ease-out"
                        style={{ width: `${animProgress}%` }}
                    />
                </div>
            </div>

            {/* Weekly goal bar */}
            <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Weekly Goal</span>
                    <span>
                        {weekly_progress} / {weekly_goal} words
                    </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                        style={{ width: `${animWeekly}%` }}
                    />
                </div>
            </div>

            {/* Stat tiles */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="group rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div
                            className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-lg shadow-sm`}
                        >
                            {s.icon}
                        </div>
                        <p className={`text-xl font-bold ${s.text}`}>
                            {s.value}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
