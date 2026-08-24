import { useState } from "react";
import useVocabSpeech from "../../Hooks/useVocabSpeech";

/**
 * DictionaryCard
 * --------------
 * Compact dictionary-style card for searched words.
 *
 * Props:
 *   word     - vocabulary object
 *   onFavorite - callback(wordId)
 *   favorited  - boolean
 */
export default function DictionaryCard({
    word,
    onFavorite,
    favorited,
}) {
    const { speak } = useVocabSpeech();
    const [listening, setListening] = useState(false);

    const handleListen = () => {
        setListening(true);
        speak(word.word);
        setTimeout(() => setListening(false), 1200);
    };

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="truncate text-[22px] font-bold text-slate-800 sm:text-[26px]">
                            {word.word}
                        </h3>
                        {word.part_of_speech && (
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium italic text-slate-600">
                                {word.part_of_speech}
                            </span>
                        )}
                    </div>
                    {word.pronunciation && (
                        <p className="mt-0.5 text-sm text-slate-500">
                            {word.pronunciation}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 gap-1">
                    <button
                        onClick={handleListen}
                        className="touch-target flex items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-90"
                        aria-label={`Listen to ${word.word}`}
                    >
                        <span className="text-base">
                            {listening ? "🔊" : "🎧"}
                        </span>
                    </button>
                    <button
                        onClick={() => onFavorite(word.id)}
                        className={`touch-target flex items-center justify-center rounded-full p-2 transition active:scale-90 ${favorited
                            ? "text-amber-400 hover:bg-amber-50"
                            : "text-slate-300 hover:bg-slate-100 hover:text-amber-400"
                            }`}
                        aria-label={favorited ? "Remove favorite" : "Add to favorites"}
                    >
                        <span className="text-lg">{favorited ? "⭐" : "☆"}</span>
                    </button>
                </div>
            </div>

            {/* Meaning */}
            <p className="mt-3 text-base leading-relaxed text-slate-700">
                {word.meaning}
            </p>

            {/* Example */}
            {word.example && (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm italic leading-relaxed text-slate-600">
                    &ldquo;{word.example}&rdquo;
                </p>
            )}
        </article>
    );
}
