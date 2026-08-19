/**
 * FeedbackCard
 * -------------
 * Displays AI feedback tips in a clean glassmorphism card.
 * Used after a word or sentence is analyzed.
 *
 * @param {object} feedback - {
 *   pronunciation_tip, grammar_tip, vocabulary_tip,
 *   natural_english_tip, confidence_tip, speaking_tip
 * }
 * @param {string} summary  - one-line encouraging summary
 * @param {string} correctSentence - the correct version of the sentence
 */
const TIPS = [
    { key: "pronunciation_tip", icon: "🗣️", label: "Pronunciation", color: "text-indigo-600 bg-indigo-50" },
    { key: "grammar_tip", icon: "✍️", label: "Grammar", color: "text-violet-600 bg-violet-50" },
    { key: "vocabulary_tip", icon: "📚", label: "Vocabulary", color: "text-sky-600 bg-sky-50" },
    { key: "natural_english_tip", icon: "🌟", label: "Natural English", color: "text-emerald-600 bg-emerald-50" },
    { key: "confidence_tip", icon: "💪", label: "Confidence", color: "text-amber-600 bg-amber-50" },
    { key: "speaking_tip", icon: "🎯", label: "Speaking", color: "text-rose-600 bg-rose-50" },
];

export default function FeedbackCard({ feedback = {}, summary, correctSentence }) {
    const tips = TIPS.filter((t) => {
        const val = feedback[t.key];
        return val && String(val).trim().length > 0;
    });

    return (
        <div className="rounded-2xl p-4 sm:p-5 bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_8px_30px_-12px_rgba(49,46,129,0.25)] space-y-4">
            {summary && (
                <div className="flex items-start gap-2.5 pb-3 border-b border-slate-100">
                    <span className="text-xl">💬</span>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {summary}
                    </p>
                </div>
            )}

            {correctSentence && (
                <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <span className="text-lg">✅</span>
                    <div>
                        <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                            Correct Sentence
                        </p>
                        <p className="text-sm font-medium text-emerald-900 mt-0.5">
                            {correctSentence}
                        </p>
                    </div>
                </div>
            )}

            {tips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tips.map((t) => (
                        <div
                            key={t.key}
                            className="flex items-start gap-2.5 rounded-xl bg-white/80 border border-slate-100 p-3"
                        >
                            <span
                                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${t.color}`}
                            >
                                {t.icon}
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                    {t.label}
                                </p>
                                <p className="text-sm text-slate-700 leading-snug mt-0.5">
                                    {feedback[t.key]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-400 italic">
                    No additional tips — great job!
                </p>
            )}
        </div>
    );
}
