/**
 * StatisticsPanel
 * ---------------
 * Tracks: words learned, sentences practiced, conversations completed,
 * average pronunciation, fluency, accuracy, weekly + monthly progress.
 *
 * @param {object} stats - from speakingService.getStatistics()
 */
export default function StatisticsPanel({ stats = {} }) {
    const avg = [
        { label: "Pronunciation", value: stats.average_pronunciation || 0, color: "from-indigo-500 to-violet-500" },
        { label: "Fluency", value: stats.average_fluency || 0, color: "from-sky-500 to-cyan-500" },
        { label: "Accuracy", value: stats.average_accuracy || 0, color: "from-emerald-500 to-teal-500" },
    ];

    const totals = [
        { label: "Words Learned", value: stats.words_learned || 0, icon: "📚" },
        { label: "Sentences", value: stats.sentences_practiced || 0, icon: "💬" },
        { label: "Conversations", value: stats.conversations_completed || 0, icon: "🤖" },
        { label: "Perfect Lessons", value: stats.perfect_lessons || 0, icon: "🏆" },
    ];

    const weekly = stats.weekly || [];
    const monthly = stats.monthly || [];
    const maxWeekly = Math.max(1, ...weekly.map((w) => w.attempts));
    const maxMonthly = Math.max(1, ...monthly.map((m) => m.attempts));

    return (
        <div className="rounded-3xl p-5 sm:p-6 bg-white/70 backdrop-blur-xl border border-white/70 shadow-md space-y-5">
            <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="text-base font-extrabold text-slate-800">Speaking Statistics</h3>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {totals.map((t) => (
                    <div key={t.label} className="rounded-2xl p-3 bg-slate-50 border border-slate-100 text-center">
                        <div className="text-xl mb-0.5">{t.icon}</div>
                        <p className="text-xl font-extrabold text-slate-800">{t.value}</p>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{t.label}</p>
                    </div>
                ))}
            </div>

            {/* Averages */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Averages</p>
                {avg.map((a) => (
                    <div key={a.label}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-600">{a.label}</span>
                            <span className="font-bold text-slate-800">{a.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${a.color} transition-all duration-700`}
                                style={{ width: `${a.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Weekly chart */}
            {weekly.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Weekly Progress</p>
                    <div className="flex items-end justify-between gap-1.5 h-24">
                        {weekly.map((w, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex-1 flex items-end">
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-400 to-violet-400 transition-all duration-500"
                                        style={{ height: `${(w.attempts / maxWeekly) * 100}%`, minHeight: w.attempts > 0 ? "8px" : "2px" }}
                                        title={`${w.attempts} attempts`}
                                    />
                                </div>
                                <span className="text-[9px] text-slate-400">
                                    {new Date(w.date).toLocaleDateString("en", { weekday: "short" }).charAt(0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly chart */}
            {monthly.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Monthly Progress</p>
                    <div className="flex items-end justify-between gap-2 h-20">
                        {monthly.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex-1 flex items-end">
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-400 to-teal-400 transition-all duration-500"
                                        style={{ height: `${(m.attempts / maxMonthly) * 100}%`, minHeight: m.attempts > 0 ? "8px" : "2px" }}
                                        title={`${m.attempts} attempts`}
                                    />
                                </div>
                                <span className="text-[9px] text-slate-400">W{m.week}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
