import { useState } from "react";
import useVocabSpeech from "../../Hooks/useVocabSpeech";

/**
 * VocabularyHero
 * --------------
 * Premium "Word of the Day" hero card.
 *
 * Props:
 *   word        - vocabulary object (word, pronunciation, part_of_speech,
 *                 meaning, example, ai_tip, difficulty, category)
 *   onPractice  - callback when "Practice" is clicked
 *   onSave      - callback when "Save" is clicked (favorites)
 *   saved      - boolean, whether the word is already favorited
 */
export default function VocabularyHero({ word, onPractice, onSave, saved }) {
    const { speak, speakSlow } = useVocabSpeech();
    const [speaking, setSpeaking] = useState(false);

    if (!word) return null;

    const handleListen = () => {
        setSpeaking(true);
        speak(word.word);
        // Reset the speaking indicator after a short delay
        setTimeout(() => setSpeaking(false), 1200);
    };

    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-2xl sm:p-10">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 typo-badge backdrop-blur-md">
                        ✨ Word of the Day
                    </span>
                    {word.difficulty && (
                        <span className="rounded-full bg-white/15 px-3 py-1 typo-badge backdrop-blur-md">
                            {word.difficulty}
                        </span>
                    )}
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1">
                    <h1 className="typo-hero tracking-tight text-white">
                        {word.word?.toUpperCase()}
                    </h1>
                    {word.part_of_speech && (
                        <span className="mb-2 rounded-lg bg-white/20 px-2.5 py-1 typo-example backdrop-blur-md">
                            {word.part_of_speech}
                        </span>
                    )}
                </div>

                {word.pronunciation && (
                    <p className="mt-2 typo-card-title text-blue-100">
                        {word.pronunciation}
                    </p>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                        <p className="typo-stat-label text-blue-100">
                            Meaning
                        </p>
                        <p className="mt-1 typo-body text-white">
                            {word.meaning}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                        <p className="typo-stat-label text-blue-100">
                            Example
                        </p>
                        <p className="mt-1 typo-example text-white">
                            “{word.example}”
                        </p>
                    </div>
                </div>

                {word.ai_tip && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                        <span className="text-xl">💡</span>
                        <div>
                            <p className="typo-stat-label text-blue-100">
                                AI Tip
                            </p>
                            <p className="mt-1 typo-ai-tip text-white">
                                {word.ai_tip}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="mt-7 flex flex-wrap gap-3">
                    <button
                        onClick={handleListen}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 typo-button shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${speaking
                            ? "bg-white text-indigo-700"
                            : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                            }`}
                    >
                        <span className="text-base">{speaking ? "🔊" : "🎧"}</span>
                        Listen
                    </button>

                    <button
                        onClick={() => speakSlow(word.word)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-3 typo-button text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/30 active:scale-95"
                    >
                        <span className="text-base">🐢</span>
                        Slow
                    </button>

                    <button
                        onClick={onPractice}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 typo-button text-indigo-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-50 active:scale-95"
                    >
                        <span className="text-base">🎯</span>
                        Practice
                    </button>

                    <button
                        onClick={onSave}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 typo-button shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 ${saved
                            ? "bg-amber-400 text-amber-900"
                            : "bg-white/20 text-white hover:bg-white/30"
                            }`}
                    >
                        <span className="text-base">{saved ? "⭐" : "☆"}</span>
                        {saved ? "Saved" : "Save"}
                    </button>
                </div>
            </div>
        </section>
    );
}
