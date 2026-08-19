import { useEffect, useState } from "react";
import useTextToSpeech from "../../Hooks/useTextToSpeech";
import SpeechRecorder from "./SpeechRecorder";
import PronunciationScore from "./PronunciationScore";
import FeedbackCard from "./FeedbackCard";
import VoiceStatusBar from "./VoiceStatusBar";
import ScoreBandBadge from "./ScoreBandBadge";
import { getScoreMessage } from "../../utils/speakingScore";
import speakingService from "../../services/speakingService";
import { sr } from "../../services/speechService";

/**
 * SentencePractice
 * -----------------
 * Part 2 of a lesson. Shows 5 practice sentences.
 * For each sentence: Listen, Repeat (speech recognition), AI Analysis,
 * Grammar + Pronunciation + Natural English feedback.
 *
 * @param {object} lesson
 * @param {function} onComplete()
 * @param {function} onAvatarState(state)
 * @param {function} onListening(bool) - mic listening state changes
 * @param {function} onXp(xp)
 */
export default function SentencePractice({ lesson, onComplete, onAvatarState, onListening, onXp, onIndexChange, onScore, startIndex = 0 }) {
    const { speak, speakSlow, replay, speaking, status: voiceStatus, retry: retryVoice } = useTextToSpeech();
    const [index, setIndex] = useState(startIndex);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const sentence = lesson.sentences[index];
    const isLast = index === lesson.sentences.length - 1;

    // Report the current index to the parent (for resume auto-save).
    useEffect(() => {
        onIndexChange?.(index);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    const handleListen = () => {
        onAvatarState?.("speaking");
        speak(sentence, { onEnd: () => onAvatarState?.("idle") });
    };

    const handleSlow = () => {
        onAvatarState?.("speaking");
        speakSlow(sentence, { onEnd: () => onAvatarState?.("idle") });
    };

    const handleResult = async (transcript) => {
        if (!transcript || transcript.trim().length < 1) {
            setError("I didn't catch that. Please try again.");
            return;
        }
        setError(null);
        setAnalyzing(true);
        onAvatarState?.("thinking");

        try {
            const res = await speakingService.analyzeSpeaking(
                sentence,
                transcript,
                "sentence"
            );
            setResult(res);
            // Use the score band to drive the avatar reaction so feedback
            // always matches the score (Excellent/Very Good -> happy, else encouraging).
            onAvatarState?.(res.overall_score >= 85 ? "happy" : "encouraging");
            onScore?.(res.overall_score);

            try {
                const saved = await speakingService.saveAttempt({
                    lesson_key: `${lesson.levelId}-${lesson.lessonIndex}`,
                    item_type: "sentence",
                    item_text: sentence,
                    spoken_text: transcript,
                    pronunciation: res.pronunciation,
                    fluency: res.fluency,
                    accuracy: res.accuracy,
                    overall_score: res.overall_score,
                });
                if (saved?.xp_earned) onXp?.(saved.xp_earned);
            } catch {
                /* non-fatal: best-effort XP save */
            }
        } catch {
            setError("Unable to analyze your speech. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleNext = () => {
        if (isLast) {
            onComplete?.();
        } else {
            // Reset ALL practice-related state for the next sentence so the
            // previous transcript/score/feedback can never leak into it.
            // The SR engine is a singleton, so its transcript must be cleared
            // explicitly — otherwise the next SpeechRecorder mount would see
            // the previous sentence's text. (SpeechRecorder also guards
            // against firing onResult on mount, but clearing here is
            // defense-in-depth.)
            sr.reset();
            setIndex((i) => i + 1);
            setResult(null);
            setError(null);
            onAvatarState?.("idle");
        }
    };

    // Retry the SAME sentence — used when no speech was detected (the backend
    // returns overall_score 0 + no_speech: true) so the learner can try again
    // without advancing. Clears the result so the SpeechRecorder reappears.
    const handleRetry = () => {
        sr.reset();
        setResult(null);
        setError(null);
        onAvatarState?.("idle");
    };

    return (
        <div className="space-y-5">
            {/* Sentence counter */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                    Sentence {index + 1} of {lesson.sentences.length}
                </span>
                <div className="flex gap-1">
                    {lesson.sentences.map((_, i) => (
                        <span
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i < index ? "bg-emerald-400" : i === index ? "bg-indigo-500 scale-125" : "bg-slate-200"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Sentence card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/80 via-sky-50/50 to-cyan-50/40 backdrop-blur-xl border border-white/70 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.25)]">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Practice Sentence
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug">
                    "{sentence}"
                </h2>

                {/* Voice status (loading / unavailable + retry) */}
                <div className="mt-4">
                    <VoiceStatusBar status={voiceStatus} onRetry={retryVoice} />
                </div>

                {/* Listen buttons */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                        onClick={handleListen}
                        disabled={speaking}
                        className="flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold shadow-md hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-60"
                    >
                        🔊 Listen
                    </button>
                    <button
                        onClick={handleSlow}
                        disabled={speaking}
                        className="flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-60"
                    >
                        🐢 Slow
                    </button>
                    <button
                        onClick={replay}
                        disabled={speaking}
                        className="flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-60"
                    >
                        🔁 Replay
                    </button>
                </div>
            </div>

            {/* Repeat section */}
            {!result && (
                <div className="rounded-3xl p-6 bg-white/70 backdrop-blur-xl border border-white/70 shadow-md">
                    <p className="text-center text-sm text-slate-500 mb-4">
                        Press <strong>Repeat</strong> and say the sentence out loud.
                    </p>
                    <SpeechRecorder
                        onResult={handleResult}
                        onListeningChange={onListening}
                        disabled={analyzing}
                        label="Repeat"
                    />
                    {analyzing && (
                        <p className="text-center text-sm text-sky-500 mt-3 animate-pulse">
                            Analyzing your speech…
                        </p>
                    )}
                    {error && (
                        <p className="text-center text-sm text-rose-500 mt-3">{error}</p>
                    )}
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="space-y-4 animate-[fadeIn_0.4s_ease]">
                    <div className="rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-white/70 shadow-md">
                        <div className="flex flex-col items-center gap-2 mb-4">
                            <h3 className="text-sm font-bold text-slate-700 text-center">
                                Your AI Analysis
                            </h3>
                            <ScoreBandBadge score={result.overall_score} />
                            <p className="text-xs text-slate-500 text-center max-w-sm">
                                {getScoreMessage(result.overall_score)}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                            <PronunciationScore label="Pronunciation" score={result.pronunciation} size="sm" />
                            <PronunciationScore label="Fluency" score={result.fluency} size="sm" />
                            <PronunciationScore label="Accuracy" score={result.accuracy} size="sm" />
                            <PronunciationScore label="Confidence" score={result.confidence} size="sm" />
                            <PronunciationScore label="Speed" score={result.speaking_speed} size="sm" />
                            <PronunciationScore label="Overall" score={result.overall_score} size="md" />
                        </div>
                    </div>

                    {/* Expected vs You Said */}
                    <div className="rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-white/70 shadow-md space-y-3">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                                Expected
                            </p>
                            <p className="text-sm text-slate-800 font-medium">
                                {result.expected || sentence}
                            </p>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                                You Said
                            </p>
                            <p className="text-sm text-slate-800 font-medium">
                                {result.spoken || "—"}
                            </p>
                        </div>
                    </div>

                    <FeedbackCard
                        feedback={result.feedback}
                        summary={result.summary}
                        correctSentence={result.correct_sentence}
                    />

                    <div className="flex justify-center gap-3">
                        {result.no_speech && (
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold shadow-md hover:scale-[1.03] active:scale-95 transition-all"
                            >
                                🔁 Try Again
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-all"
                        >
                            {isLast ? "Finish Sentences →" : "Next Sentence →"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
