import { useState } from "react";
import useVocabSpeech from "../../Hooks/useVocabSpeech";

/**
 * VocabularyCard
 * --------------
 * Premium vocabulary card with full learning data.
 *
 * Props:
 *   word          - vocabulary object
 *   status        - learning status: "New" | "Learning" | "Mastered" | "Reviewed" | null
 *   favorited     - boolean
 *   onFavorite    - callback(wordId)
 *   onStatusChange- callback(wordId, newStatus)
 *   onPractice    - callback(word)  -> opens flashcard/quiz for this word
 */

const STATUS_STYLES = {
    New: "bg-slate-100 text-slate-600",
    Learning: "bg-blue-100 text-blue-700",
    Mastered: "bg-emerald-100 text-emerald-700",
    Reviewed: "bg-amber-100 text-amber-700",
};

const DIFFICULTY_STYLES = {
    Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
    Advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_ORDER = ["New", "Learning", "Mastered", "Reviewed"];

export default function VocabularyCard({
    word,
    status,
    favorited,
    onFavorite,
    onStatusChange,
    onPractice,
}) {
    const { speak, speakSlow } = useVocabSpeech();
    const [expanded, setExpanded] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const currentStatus = status || "New";

    const handleListen = () => {
        setSpeaking(true);
        speak(word.word);
        setTimeout(() => setSpeaking(false), 1200);
    };

    const cycleStatus = () => {
        const idx = STATUS_ORDER.indexOf(currentStatus);
        const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
        onStatusChange(word.id, next);
    };

    const synonyms = word.synonyms
        ? word.synonyms.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    const antonyms = word.antonyms
        ? word.antonyms.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />

            <div className="flex flex-1 flex-col p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate typo-card-title text-slate-800">
                                {word.word}
                            </h3>
                            <button
                                onClick={handleListen}
                                className="rounded-full p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-90"
                                aria-label={`Listen to ${word.word}`}
                            >
                                <span className="text-base">
                                    {speaking ? "🔊" : "🎧"}
                                </span>
                            </button>
                            <button
                                onClick={() => speakSlow(word.word)}
                                className="rounded-full p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-90"
                                aria-label={`Slow pronunciation of ${word.word}`}
                            >
                                <span className="text-base">🐢</span>
                            </button>
                        </div>
                        {word.pronunciation && (
                            <p className="mt-0.5 typo-secondary text-slate-500">
                                {word.pronunciation}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => onFavorite(word.id)}
                        className={`rounded-full p-2 transition active:scale-90 ${favorited
                            ? "text-amber-400 hover:bg-amber-50"
                            : "text-slate-300 hover:bg-slate-100 hover:text-amber-400"
                            }`}
                        aria-label={favorited ? "Remove favorite" : "Add to favorites"}
                    >
                        <span className="text-xl">{favorited ? "⭐" : "☆"}</span>
                    </button>
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {word.part_of_speech && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 typo-badge italic text-slate-600">
                            {word.part_of_speech}
                        </span>
                    )}
                    {word.difficulty && (
                        <span
                            className={`rounded-lg border px-2.5 py-1 typo-badge ${DIFFICULTY_STYLES[word.difficulty] ||
                                "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                        >
                            {word.difficulty}
                        </span>
                    )}
                    {word.category && (
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 typo-badge text-indigo-600">
                            {word.category}
                        </span>
                    )}
                </div>

                {/* Meaning */}
                <p className="mt-4 typo-secondary text-slate-700">
                    <span className="font-semibold text-slate-800">Meaning: </span>
                    {word.meaning}
                </p>

                {/* Examples */}
                <div className="mt-3 space-y-1.5">
                    {word.example && (
                        <p className="rounded-lg bg-slate-50 px-3 py-2 typo-example text-slate-600">
                            “{word.example}”
                        </p>
                    )}
                    {word.example2 && (
                        <p className="rounded-lg bg-slate-50 px-3 py-2 typo-example text-slate-600">
                            “{word.example2}”
                        </p>
                    )}
                </div>

                {/* Synonyms / Antonyms */}
                {(synonyms.length > 0 || antonyms.length > 0) && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {synonyms.length > 0 && (
                            <div>
                                <p className="typo-stat-label text-emerald-600">
                                    Synonyms
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {synonyms.map((s) => (
                                        <span
                                            key={s}
                                            className="rounded-md bg-emerald-50 px-2 py-0.5 typo-caption text-emerald-700"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {antonyms.length > 0 && (
                            <div>
                                <p className="typo-stat-label text-rose-600">
                                    Antonyms
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {antonyms.map((s) => (
                                        <span
                                            key={s}
                                            className="rounded-md bg-rose-50 px-2 py-0.5 typo-caption text-rose-700"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* AI tip (always visible) */}
                {word.ai_tip && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                        <span className="text-base">💡</span>
                        <p className="typo-ai-tip text-amber-800">
                            <span className="font-semibold">AI Tip: </span>
                            {word.ai_tip}
                        </p>
                    </div>
                )}

                {/* Expandable AI learning tips */}
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                    {expanded ? "Hide AI learning tips" : "Show AI learning tips"}
                    <span
                        className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""
                            }`}
                    >
                        ▾
                    </span>
                </button>

                {expanded && (
                    <div className="mt-2 space-y-2 animate-[fadeIn_0.3s_ease]">
                        {word.common_mistakes && (
                            <TipRow icon="⚠️" label="Common Mistakes" text={word.common_mistakes} tone="rose" />
                        )}
                        {word.when_to_use && (
                            <TipRow icon="✅" label="When to Use" text={word.when_to_use} tone="emerald" />
                        )}
                        {word.when_not_to_use && (
                            <TipRow icon="🚫" label="When NOT to Use" text={word.when_not_to_use} tone="rose" />
                        )}
                        {word.natural_sentence && (
                            <TipRow icon="💬" label="Natural" text={word.natural_sentence} tone="slate" />
                        )}
                        {word.formal_sentence && (
                            <TipRow icon="🎩" label="Formal" text={word.formal_sentence} tone="indigo" />
                        )}
                        {word.informal_sentence && (
                            <TipRow icon="😎" label="Informal" text={word.informal_sentence} tone="amber" />
                        )}
                    </div>
                )}

                {/* Footer: status + actions */}
                <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={cycleStatus}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${STATUS_STYLES[currentStatus] ||
                                "bg-slate-100 text-slate-600"
                                }`}
                            title="Click to change learning status"
                        >
                            {currentStatus}
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onPractice(word)}
                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                            >
                                🎯 Practice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function TipRow({ icon, label, text, tone }) {
    const tones = {
        rose: "border-rose-100 bg-rose-50/60 text-rose-800",
        emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-800",
        slate: "border-slate-100 bg-slate-50 text-slate-700",
        indigo: "border-indigo-100 bg-indigo-50/60 text-indigo-800",
        amber: "border-amber-100 bg-amber-50/60 text-amber-800",
    };
    return (
        <div className={`flex items-start gap-2 rounded-xl border p-2.5 ${tones[tone] || tones.slate}`}>
            <span className="text-sm">{icon}</span>
            <p className="text-xs leading-relaxed">
                <span className="font-semibold">{label}: </span>
                {text}
            </p>
        </div>
    );
}
