/**
 * SpeakingDashboard
 * -----------------
 * Top dashboard for the speaking module.
 * Shows: current level, current lesson, progress, completed lessons,
 * current streak, longest streak, XP, speaking accuracy.
 *
 * @param {object} data - from speakingService.getDashboard()
 */
export default function SpeakingDashboard({ data = {} }) {
    const stats = [
        { label: "Current Level", value: data.current_level || "Beginner", icon: "🎯", color: "from-indigo-500 to-violet-500" },
        { label: "Current Lesson", value: data.current_lesson || "Greetings", icon: "📖", color: "from-sky-500 to-cyan-500" },
        { label: "Progress", value: `${data.progress || 0}%`, icon: "📈", color: "from-emerald-500 to-teal-500" },
        { label: "Completed", value: `${data.completed_lessons || 0}/${data.total_lessons || 45}`, icon: "✅", color: "from-green-500 to-emerald-500" },
        { label: "Current Streak", value: `${data.current_streak || 0} 🔥`, icon: "🔥", color: "from-orange-500 to-amber-500" },
        { label: "Longest Streak", value: `${data.longest_streak || 0}`, icon: "🏆", color: "from-amber-500 to-yellow-500" },
        { label: "XP", value: data.xp || 0, icon: "⚡", color: "from-violet-500 to-purple-500" },
        { label: "Speaking Accuracy", value: `${data.average_accuracy || 0}%`, icon: "🎤", color: "from-rose-500 to-pink-500" },
    ];

    return (
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white/80 via-indigo-50/60 to-sky-50/50 backdrop-blur-xl border border-white/70 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.25)]">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                        Your Speaking Journey
                    </h2>
                    <p className="text-sm text-slate-500">
                        Track your progress and keep your streak alive 🔥
                    </p>
                </div>
                {data.english_rank && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-indigo-100 text-xs font-bold text-indigo-600">
                        👑 {data.english_rank}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="relative overflow-hidden rounded-2xl p-3.5 bg-white/70 border border-white/80 shadow-sm"
                    >
                        <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-xl`} />
                        <div className="relative flex items-center gap-2 mb-1.5">
                            <span className="text-lg">{s.icon}</span>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                {s.label}
                            </span>
                        </div>
                        <p className="relative text-lg sm:text-xl font-extrabold text-slate-800 truncate">
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
