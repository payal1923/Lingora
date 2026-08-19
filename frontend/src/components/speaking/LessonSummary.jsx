import { useEffect, useState } from "react";

/**
 * LessonSummary
 * --------------
 * Shown after a lesson is complete.
 * Displays: overall score, XP earned, words learned, sentences practiced,
 * conversation completed, perfect badges, and a "Next Lesson" button.
 *
 * @param {object} lesson
 * @param {object} summary  - { score, xp, wordsLearned, sentencesPracticed, conversationCompleted, perfect, perfectConversation, newAchievements }
 * @param {function} onNextLesson()
 * @param {function} onBackToRoadmap()
 */
export default function LessonSummary({ lesson, summary = {}, onNextLesson, onBackToRoadmap }) {
    const [showXp, setShowXp] = useState(0);

    useEffect(() => {
        let raf;
        const start = performance.now();
        const to = summary.xp || 0;
        const tick = (now) => {
            const t = Math.min(1, (now - start) / 1200);
            const eased = 1 - Math.pow(1 - t, 3);
            setShowXp(Math.round(to * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [summary.xp]);

    const items = [
        { label: "Words Learned", value: summary.wordsLearned || 0, icon: "📚", color: "text-indigo-600 bg-indigo-50" },
        { label: "Sentences", value: summary.sentencesPracticed || 0, icon: "💬", color: "text-sky-600 bg-sky-50" },
        { label: "Conversation", value: summary.conversationCompleted ? "✓" : "—", icon: "🤖", color: "text-violet-600 bg-violet-50" },
        { label: "Overall Score", value: `${summary.score || 0}/100`, icon: "🎯", color: "text-emerald-600 bg-emerald-50" },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-center bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 text-white shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                    <div className="text-5xl mb-2">{summary.perfect ? "🏆" : "🎉"}</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold">
                        {summary.perfect ? "Perfect Lesson!" : "Lesson Complete!"}
                    </h2>
                    <p className="text-white/80 mt-1 text-sm">
                        {lesson.title} · {lesson.level}
                    </p>

                    {/* Animated XP */}
                    <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur">
                        <span className="text-xl">⚡</span>
                        <span className="text-2xl font-extrabold tabular-nums">+{showXp}</span>
                        <span className="text-sm font-medium text-white/80">XP earned</span>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {items.map((it) => (
                    <div
                        key={it.label}
                        className="rounded-2xl p-4 bg-white/70 backdrop-blur-xl border border-white/70 shadow-sm text-center"
                    >
                        <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center text-lg mb-2 ${it.color}`}>
                            {it.icon}
                        </div>
                        <p className="text-lg font-extrabold text-slate-800">{it.value}</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            {it.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Badges */}
            {(summary.perfect || summary.perfectConversation) && (
                <div className="flex flex-wrap justify-center gap-2.5">
                    {summary.perfect && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                            ⭐ Perfect Lesson +50 XP
                        </span>
                    )}
                    {summary.perfectConversation && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                            💎 Perfect Conversation +100 XP
                        </span>
                    )}
                </div>
            )}

            {/* New achievements */}
            {summary.newAchievements?.length > 0 && (
                <div className="rounded-2xl p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200">
                    <p className="text-sm font-bold text-amber-700 mb-2 text-center">
                        🏅 New Achievements Unlocked!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {summary.newAchievements.map((a, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-amber-700 text-xs font-semibold border border-amber-200 shadow-sm"
                            >
                                {a.badge_icon || a.icon || "🏅"} {a.badge_name || a.name || a.title || "Achievement"}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                    onClick={onBackToRoadmap}
                    className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold hover:scale-[1.02] active:scale-95 transition-all"
                >
                    ← Back to Roadmap
                </button>
                <button
                    onClick={onNextLesson}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-all"
                >
                    Next Lesson →
                </button>
            </div>
        </div>
    );
}
