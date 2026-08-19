/**
 * DailyGoal
 * ---------
 * Today's goal: complete one lesson, learn 5 words, speak 5 sentences,
 * finish a conversation, earn bonus XP.
 *
 * Completed tasks are shown with a green circular check icon on the left
 * and a green "Completed" badge on the right. The task text stays fully
 * readable (no strikethrough).
 *
 * @param {object} data - { daily_goal_done, words_learned, sentences_practiced, conversations_completed }
 */
export default function DailyGoal({ data = {} }) {
    const goals = [
        { label: "Complete 1 lesson", done: !!data.daily_goal_done, icon: "🎯" },
        { label: "Learn 5 words", done: (data.words_learned || 0) >= 5, icon: "📚" },
        { label: "Speak 5 sentences", done: (data.sentences_practiced || 0) >= 5, icon: "💬" },
        { label: "Finish a conversation", done: (data.conversations_completed || 0) >= 1, icon: "🤖" },
    ];

    const doneCount = goals.filter((g) => g.done).length;
    const allDone = doneCount === goals.length;

    return (
        <div className={`rounded-3xl p-5 sm:p-6 backdrop-blur-xl border shadow-md transition-all
      ${allDone
                ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                : "bg-white/70 border-white/70"}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <h3 className="text-base font-extrabold text-slate-800">Today's Goal</h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full
          ${allDone ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                    {doneCount}/{goals.length}
                </span>
            </div>

            <div className="space-y-2">
                {goals.map((g) => (
                    <div
                        key={g.label}
                        className={`flex items-center justify-between gap-3 rounded-xl p-2.5 transition-all
              ${g.done ? "bg-emerald-50" : "bg-slate-50"}`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Left: green circular check when done, otherwise the goal icon */}
                            <span
                                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all
                  ${g.done
                                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                                        : "bg-white text-slate-400 border border-slate-200"}`}
                            >
                                {g.done ? (
                                    <CheckIcon />
                                ) : (
                                    g.icon
                                )}
                            </span>
                            {/* Task text stays fully readable — no strikethrough */}
                            <span className={`text-sm font-medium truncate ${g.done ? "text-emerald-700" : "text-slate-600"}`}>
                                {g.label}
                            </span>
                        </div>

                        {/* Right: green "Completed" badge when done */}
                        {g.done && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-sm">
                                Completed
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {allDone && (
                <div className="mt-3 rounded-xl bg-emerald-100 border border-emerald-200 p-2.5 text-center">
                    <p className="text-sm font-bold text-emerald-700">
                        🎉 Daily goal complete! +Bonus XP earned
                    </p>
                </div>
            )}
        </div>
    );
}

/** Small inline check mark used inside the circular icon. */
function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
