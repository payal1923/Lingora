import { getLevelById } from "../../data/speakingCourseData";

/**
 * LessonCard
 * ----------
 * A large, beautiful lesson card.
 *
 * States:
 *   - completed  → green checkmark
 *   - current    → glowing ring
 *   - locked     → greyed out, lock icon, not clickable
 *   - default    → available
 *
 * @param {object} lesson   - { key, title, level, lessonIndex, ... }
 * @param {string} status   - "completed" | "current" | "locked" | "available"
 * @param {number} score    - best score (0-100) if completed
 * @param {function} onClick(lesson)
 */
export default function LessonCard({ lesson, status = "available", score = 0, onClick }) {
    const level = getLevelById(lesson.levelId);

    const isLocked = status === "locked";
    const isCompleted = status === "completed";
    const isCurrent = status === "current";

    const handleClick = () => {
        if (isLocked) return;
        onClick?.(lesson);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLocked}
            className={`group relative w-full text-left rounded-3xl p-5 transition-all duration-300 overflow-hidden
        ${isLocked
                    ? "bg-slate-100/70 border border-slate-200 cursor-not-allowed opacity-70"
                    : isCurrent
                        ? `bg-gradient-to-br ${level.gradient} text-white shadow-2xl scale-[1.03] ring-4 ring-white/60`
                        : isCompleted
                            ? "bg-white/80 backdrop-blur-xl border-2 border-emerald-200 shadow-lg hover:scale-[1.02]"
                            : "bg-white/80 backdrop-blur-xl border border-white/80 shadow-md hover:shadow-xl hover:scale-[1.02]"
                }`}
        >
            {/* Glow for current lesson */}
            {isCurrent && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -inset-1 bg-white/20 blur-2xl animate-pulse rounded-3xl" />
                </div>
            )}

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Lesson number badge */}
                    <div
                        className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg
              ${isLocked
                                ? "bg-slate-200 text-slate-400"
                                : isCurrent
                                    ? "bg-white/25 text-white"
                                    : isCompleted
                                        ? "bg-emerald-100 text-emerald-700"
                                        : `bg-gradient-to-br ${level.gradient} text-white`
                            }`}
                    >
                        {isCompleted ? (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : isLocked ? (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        ) : (
                            lesson.lessonIndex
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3
                            className={`font-bold text-base sm:text-lg leading-tight truncate
                ${isLocked ? "text-slate-400" : isCurrent ? "text-white" : "text-slate-800"}`}
                        >
                            {lesson.title}
                        </h3>
                        <p
                            className={`text-xs mt-0.5
                ${isLocked ? "text-slate-400" : isCurrent ? "text-white/80" : "text-slate-500"}`}
                        >
                            Lesson {lesson.lessonIndex} · {lesson.level}
                        </p>
                    </div>
                </div>

                {/* Status pill */}
                {!isLocked && (
                    <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full
              ${isCurrent
                                ? "bg-white/25 text-white"
                                : isCompleted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-indigo-50 text-indigo-600"
                            }`}
                    >
                        {isCurrent ? "START" : isCompleted ? `${score}/100` : "READY"}
                    </span>
                )}
            </div>

            {/* Footer: content preview */}
            <div className="relative mt-4 flex items-center gap-3 text-[11px]">
                <span
                    className={`inline-flex items-center gap-1 ${isLocked ? "text-slate-400" : isCurrent ? "text-white/80" : "text-slate-500"
                        }`}
                >
                    📚 5 words
                </span>
                <span
                    className={`inline-flex items-center gap-1 ${isLocked ? "text-slate-400" : isCurrent ? "text-white/80" : "text-slate-500"
                        }`}
                >
                    💬 5 sentences
                </span>
                <span
                    className={`inline-flex items-center gap-1 ${isLocked ? "text-slate-400" : isCurrent ? "text-white/80" : "text-slate-500"
                        }`}
                >
                    🤖 1 conversation
                </span>
            </div>
        </button>
    );
}
