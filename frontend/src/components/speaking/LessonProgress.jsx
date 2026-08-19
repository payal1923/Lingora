/**
 * LessonProgress
 * --------------
 * Step indicator shown during a lesson.
 * Three steps: Vocabulary → Sentences → Conversation.
 *
 * @param {string} step - "vocabulary" | "sentences" | "conversation" | "summary"
 * @param {number} vocabIndex   - current word index (0-4)
 * @param {number} sentenceIndex - current sentence index (0-4)
 */
const STEPS = [
    { id: "vocabulary", label: "Vocabulary", icon: "📚", count: 5 },
    { id: "sentences", label: "Sentences", icon: "💬", count: 5 },
    { id: "conversation", label: "Conversation", icon: "🤖", count: 1 },
];

export default function LessonProgress({ step, vocabIndex = 0, sentenceIndex = 0 }) {
    const activeIdx = STEPS.findIndex((s) => s.id === step);
    if (activeIdx === -1) return null;

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
            {STEPS.map((s, i) => {
                const done = i < activeIdx;
                const active = i === activeIdx;
                const sub = s.id === "vocabulary" ? vocabIndex : s.id === "sentences" ? sentenceIndex : 0;

                return (
                    <div key={s.id} className="flex items-center gap-2 sm:gap-3">
                        <div
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all
                ${done
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : active
                                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg scale-105"
                                        : "bg-white/70 text-slate-400 border border-slate-200"
                                }`}
                        >
                            <span className="text-base">{done ? "✅" : s.icon}</span>
                            <span>{s.label}</span>
                            {active && s.count > 1 && (
                                <span className="text-[10px] font-bold opacity-80">
                                    {sub + 1}/{s.count}
                                </span>
                            )}
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`w-6 sm:w-10 h-0.5 rounded-full ${done ? "bg-emerald-300" : "bg-slate-200"
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
