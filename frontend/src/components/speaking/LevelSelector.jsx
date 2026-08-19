import { SPEAKING_LEVELS } from "../../data/speakingCourseData";

/**
 * LevelSelector
 * -------------
 * Tabs to switch between Beginner / Intermediate / Advanced.
 *
 * @param {string} activeLevel  - "beginner" | "intermediate" | "advanced"
 * @param {function} onSelect(levelId)
 * @param {object} counts       - { beginner: {completed, total}, ... }
 */
export default function LevelSelector({ activeLevel, onSelect, counts = {} }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {SPEAKING_LEVELS.map((level) => {
                const c = counts[level.id] || { completed: 0, total: 15 };
                const pct = c.total ? Math.round((c.completed / c.total) * 100) : 0;
                const active = activeLevel === level.id;

                return (
                    <button
                        key={level.id}
                        type="button"
                        onClick={() => onSelect(level.id)}
                        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition-all duration-300
              ${active
                                ? `bg-gradient-to-br ${level.gradient} text-white shadow-xl scale-[1.02]`
                                : "bg-white/70 backdrop-blur-xl border border-white/70 text-slate-700 hover:scale-[1.01] hover:shadow-lg"
                            }`}
                    >
                        {/* Decorative blob */}
                        <div
                            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-30 transition-opacity
                ${active ? "bg-white" : "bg-slate-200 group-hover:opacity-50"}`}
                        />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{level.emoji}</span>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg leading-tight">
                                        {level.name}
                                    </h3>
                                    <p
                                        className={`text-[11px] font-medium ${active ? "text-white/80" : "text-slate-400"
                                            }`}
                                    >
                                        {c.completed}/{c.total} lessons
                                    </p>
                                </div>
                            </div>
                            {active && (
                                <span className="text-[10px] font-bold bg-white/25 px-2 py-1 rounded-full">
                                    {pct}%
                                </span>
                            )}
                        </div>

                        <p
                            className={`relative mt-3 text-xs leading-snug ${active ? "text-white/90" : "text-slate-500"
                                }`}
                        >
                            {level.description}
                        </p>

                        {/* Progress bar */}
                        <div
                            className={`relative mt-3 h-1.5 rounded-full overflow-hidden ${active ? "bg-white/25" : "bg-slate-100"
                                }`}
                        >
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${active ? "bg-white" : `bg-gradient-to-r ${level.gradient}`
                                    }`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
