import { useState } from "react";
import useVocabSpeech from "../../Hooks/useVocabSpeech";
import useModalBehavior from "../../Hooks/useModalBehavior";

/**
 * FlashcardModal
 * -------------
 * A full-screen flashcard practice modal. Cards flip on click.
 *
 * Front:  Word + pronunciation + part of speech
 * Back:   Meaning + examples + pronunciation
 *
 * Props:
 *   words   - array of vocabulary objects to study
 *   onClose - callback to close the modal
 */
export default function FlashcardModal({ words, onClose }) {
    const { speak, speakSlow } = useVocabSpeech();
    useModalBehavior(true, onClose);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [knownCount, setKnownCount] = useState(0);

    if (!words || words.length === 0) {
        return (
            <ModalShell onClose={onClose}>
                <p className="text-center text-slate-500">
                    No words available for flashcards.
                </p>
            </ModalShell>
        );
    }

    const word = words[index];
    const isLast = index === words.length - 1;

    const next = () => {
        setFlipped(false);
        setIndex((i) => Math.min(i + 1, words.length - 1));
    };

    const prev = () => {
        setFlipped(false);
        setIndex((i) => Math.max(i - 1, 0));
    };

    const markKnown = () => {
        setKnownCount((c) => c + 1);
        if (!isLast) next();
    };

    return (
        <ModalShell onClose={onClose}>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        🃏 Flashcard Practice
                    </h2>
                    <p className="text-sm text-slate-500">
                        Card {index + 1} of {words.length} · Known: {knownCount}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="touch-target flex items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close flashcards"
                >
                    ✕
                </button>
            </div>

            {/* Progress dots */}
            <div className="mb-4 flex gap-1.5">
                {words.map((_, i) => (
                    <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${i === index
                            ? "bg-indigo-600"
                            : i < index
                                ? "bg-indigo-300"
                                : "bg-slate-200"
                            }`}
                    />
                ))}
            </div>

            {/* Flashcard */}
            <div
                className="relative h-72 cursor-pointer [perspective:1200px]"
                onClick={() => setFlipped((f) => !f)}
            >
                <div
                    className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                    style={{
                        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 text-center shadow-lg [backface-visibility:hidden]">
                        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-600">
                            {word.part_of_speech || "word"}
                        </span>
                        <h3 className="mt-4 text-4xl font-extrabold text-slate-800">
                            {word.word}
                        </h3>
                        {word.pronunciation && (
                            <p className="mt-2 text-lg text-slate-500">
                                {word.pronunciation}
                            </p>
                        )}
                        <p className="mt-6 text-xs text-slate-400">
                            Tap to flip
                        </p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-3xl border border-indigo-200 bg-white p-6 text-center shadow-lg [backface-visibility:hidden]"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                            Meaning
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-800">
                            {word.meaning}
                        </p>

                        {word.example && (
                            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
                                “{word.example}”
                            </p>
                        )}
                        {word.example2 && (
                            <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
                                “{word.example2}”
                            </p>
                        )}
                        {word.pronunciation && (
                            <p className="mt-3 text-sm text-slate-500">
                                {word.pronunciation}
                            </p>
                        )}
                        <p className="mt-4 text-xs text-slate-400">
                            Tap to flip back
                        </p>
                    </div>
                </div>
            </div>

            {/* Audio controls */}
            <div className="mt-4 flex justify-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        speak(word.word);
                    }}
                    className="touch-target rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                    🔊 Listen
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        speakSlow(word.word);
                    }}
                    className="touch-target rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                    🐢 Slow
                </button>
            </div>

            {/* Navigation */}
            <div className="mt-5 flex items-center justify-between gap-2">
                <button
                    onClick={prev}
                    disabled={index === 0}
                    className="touch-target rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                    ← Prev
                </button>

                <button
                    onClick={markKnown}
                    className="touch-target rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95"
                >
                    ✓ I know this
                </button>

                <button
                    onClick={next}
                    disabled={isLast}
                    className="touch-target rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                    Next →
                </button>
            </div>

            {isLast && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
                    🎉 You finished all {words.length} flashcards! Known: {knownCount}
                </div>
            )}
        </ModalShell>
    );
}

function ModalShell({ onClose, children }) {
    return (
        <div
            className="mobile-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="mobile-modal-panel w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
