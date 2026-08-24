import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config/api";
import useVocabSpeech from "../../Hooks/useVocabSpeech";
import useModalBehavior from "../../Hooks/useModalBehavior";

/**
 * VocabQuizModal
 * ------------
 * A mini vocabulary quiz. The user matches a word to its correct meaning
 * from 4 options. Awards XP per correct answer and a bonus for finishing.
 *
 * Props:
 *   userId  - current user id (for XP awarding)
 *   onClose - callback to close the modal
 *   onXpEarned - optional callback(xpEarned) when XP is awarded
 */
export default function VocabQuizModal({ userId, onClose, onXpEarned }) {
    const { speak } = useVocabSpeech();
    useModalBehavior(true, onClose);
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [awarding, setAwarding] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(`${API_URL}/vocabulary-quiz?count=5`);
                setQuiz(res.data.quiz || []);
            } catch (err) {
                console.log("Quiz load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const total = quiz.length;

    const handleSelect = (option) => {
        if (selected !== null) return;
        setSelected(option);
        const correct = option === quiz[current].correct_meaning;
        if (correct) {
            setScore((s) => s + 1);
            speak(quiz[current].word);
        }
    };

    const handleNext = () => {
        if (current + 1 >= total) {
            setFinished(true);
            awardXp();
        } else {
            setCurrent((c) => c + 1);
            setSelected(null);
        }
    };

    const awardXp = async () => {
        if (!userId) return;
        setAwarding(true);
        try {
            // 10 XP per correct answer + 25 bonus for finishing
            const xpAmount = score * 10 + 25;
            await axios.post(`${API_URL}/vocabulary-award-xp`, {
                user_id: userId,
                xp_amount: xpAmount,
            });
            if (onXpEarned) onXpEarned(xpAmount);
        } catch (err) {
            console.log("XP award error:", err);
        } finally {
            setAwarding(false);
        }
    };

    const restart = () => {
        setCurrent(0);
        setSelected(null);
        setScore(0);
        setFinished(false);
        setLoading(true);
        axios
            .get(`${API_URL}/vocabulary-quiz?count=5`)
            .then((res) => setQuiz(res.data.quiz || []))
            .finally(() => setLoading(false));
    };

    return (
        <div
            className="mobile-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Vocabulary Quiz"
                className="mobile-modal-panel w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            🧠 Vocabulary Quiz
                        </h2>
                        {!finished && !loading && (
                            <p className="text-sm text-slate-500">
                                Question {current + 1} of {total} · Score: {score}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="touch-target flex items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close quiz"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex h-48 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    </div>
                ) : finished ? (
                    <div className="py-6 text-center">
                        <div className="text-5xl">
                            {score >= 4 ? "🏆" : score >= 3 ? "🎉" : "💪"}
                        </div>
                        <h3 className="mt-3 text-2xl font-bold text-slate-800">
                            You scored {score}/{total}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {awarding
                                ? "Awarding XP..."
                                : `You earned ${score * 10 + 25} XP!`}
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                onClick={restart}
                                className="touch-target rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                            >
                                🔄 Try Again
                            </button>
                            <button
                                onClick={onClose}
                                className="touch-target rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Progress */}
                        <div className="mb-4 flex gap-1.5">
                            {quiz.map((_, i) => (
                                <span
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all ${i === current
                                        ? "bg-indigo-600"
                                        : i < current
                                            ? "bg-indigo-300"
                                            : "bg-slate-200"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Question */}
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-5 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                What does this word mean?
                            </p>
                            <h3 className="mt-2 text-3xl font-extrabold text-slate-800">
                                {quiz[current].word}
                            </h3>
                            {quiz[current].pronunciation && (
                                <p className="mt-1 text-sm text-slate-500">
                                    {quiz[current].pronunciation}
                                </p>
                            )}
                        </div>

                        {/* Options */}
                        <div className="mt-4 grid gap-2">
                            {quiz[current].options.map((opt, i) => {
                                const isCorrect =
                                    opt === quiz[current].correct_meaning;
                                const isSelected = selected === opt;
                                let cls =
                                    "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50";
                                if (selected !== null) {
                                    if (isCorrect) {
                                        cls =
                                            "border-emerald-400 bg-emerald-50 text-emerald-700";
                                    } else if (isSelected) {
                                        cls =
                                            "border-rose-400 bg-rose-50 text-rose-700";
                                    } else {
                                        cls = "border-slate-200 bg-white opacity-60";
                                    }
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(opt)}
                                        disabled={selected !== null}
                                        className={`touch-target flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all ${cls}`}
                                    >
                                        <span>{opt}</span>
                                        {selected !== null && isCorrect && (
                                            <span>✓</span>
                                        )}
                                        {selected !== null &&
                                            isSelected &&
                                            !isCorrect && <span>✗</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next button */}
                        {selected !== null && (
                            <div className="mt-5 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    className="touch-target rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                                >
                                    {current + 1 >= total
                                        ? "Finish & Earn XP"
                                        : "Next →"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
