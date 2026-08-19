import { useEffect, useRef, useState } from "react";
import useTextToSpeech from "../../Hooks/useTextToSpeech";
import SpeechRecorder from "./SpeechRecorder";
import FeedbackCard from "./FeedbackCard";
import VoiceStatusBar from "./VoiceStatusBar";
import speakingService from "../../services/speakingService";

// NEW IMPORTS
import AIMessage from "../AIMessage";
import ThinkingAIMessage from "../ThinkingAIMessage";

/**
 * ConversationPractice
 * ---------------------
 * Part 3 of a lesson. A mini AI conversation (6-10 turns).
 * The AI greets, the user replies, the AI analyzes + continues.
 * Uses today's vocabulary.
 *
 * @param {object} lesson
 * @param {function} onComplete()
 * @param {function} onAvatarState(state)
 * @param {function} onListening(bool)
 * @param {function} onXp(xp)
 */
export default function ConversationPractice({
    lesson,
    onComplete,
    onAvatarState,
    onListening,
}) {
    const {
        speak,
        stop,
        status: voiceStatus,
        retry: retryVoice,
    } = useTextToSpeech();

    const [messages, setMessages] = useState([]);
    const [turn, setTurn] = useState(0);

    const [thinking, setThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const [lastFeedback, setLastFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [ended, setEnded] = useState(false);

    const scrollRef = useRef(null);
    const greetedRef = useRef(false);

    const vocab = lesson.vocabulary.map((v) => v.word);
    const MAX_TURNS = 10;

    // Auto Scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, thinking]);

    // Greeting
    useEffect(() => {
        if (greetedRef.current) return;

        greetedRef.current = true;

        const greeting =
            lesson.conversation?.greeting ||
            "Hello! Let's start our conversation.";

        setMessages([
            {
                role: "assistant",
                content: greeting,
            },
        ]);

        setIsSpeaking(true);
        onAvatarState?.("speaking");

        speak(greeting, {
            onEnd: () => {
                setIsSpeaking(false);
                onAvatarState?.("listening");
            },
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUserReply = async (transcript) => {
        if (!transcript || transcript.trim().length < 1) {
            setError("I didn't catch that. Please try again.");
            return;
        }

        setError(null);

        const newTurn = turn + 1;
        setTurn(newTurn);

        const userMsg = {
            role: "user",
            content: transcript,
        };

        const history = [...messages, userMsg];

        setMessages(history);

        setThinking(true);
        onAvatarState?.("thinking");

        try {
            const res =
                await speakingService.continueConversation({
                    lesson_title: lesson.title,
                    level: lesson.level,
                    vocabulary: vocab,
                    turn: newTurn,
                    history,
                });

            const aiMsg = {
                role: "assistant",
                content: res.reply,
            };

            setMessages((prev) => [...prev, aiMsg]);

            setLastFeedback({
                grammar_feedback:
                    res.grammar_feedback,

                vocabulary_feedback:
                    res.vocabulary_feedback,

                pronunciation_feedback:
                    res.pronunciation_feedback,

                natural_english_feedback:
                    res.natural_english_feedback,
            });

            setIsSpeaking(true);
            onAvatarState?.("speaking");

            speak(res.reply, {
                onEnd: () => {
                    setIsSpeaking(false);
                    onAvatarState?.("listening");
                },
            });

            if (
                res.should_end ||
                newTurn >= MAX_TURNS
            ) {
                setEnded(true);
            }
        } catch {
            setError(
                "Unable to continue the conversation. Please try again."
            );
        } finally {
            setThinking(false);
        }
    };

    const handleFinish = () => {
        stop();
        onComplete?.();
    };

    // ===== PART 2 STARTS WITH return ( =====
    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-800">
                        🤖 AI Conversation
                    </h2>

                    <p className="text-xs text-slate-500">
                        {lesson.conversation?.scenario}
                    </p>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
                    Turn {Math.min(turn, MAX_TURNS)}/{MAX_TURNS}
                </span>
            </div>

            {/* Vocabulary */}
            <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 self-center">
                    Today's words:
                </span>

                {vocab.map((word) => (
                    <span
                        key={word}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                    >
                        {word}
                    </span>
                ))}
            </div>

            {/* Lesson Card */}
            <div className="mt-4 mb-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                <h3 className="text-xl font-bold text-slate-800">
                    🎓 {lesson.title}
                </h3>

                <p className="mt-2 text-slate-600">
                    {lesson.conversation?.scenario}
                </p>
            </div>

            {/* Chat Window */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-md p-4 sm:p-5 max-h-[420px] overflow-y-auto">

                {messages.map((msg, index) => {
                    const latestAIIndex = messages
                        .map((m, i) => (m.role === "assistant" ? i : -1))
                        .filter((i) => i !== -1)
                        .pop();

                    if (msg.role === "assistant") {
                        return (
                            <AIMessage
                                key={index}
                                message={{
                                    text: msg.content,
                                    grammar:
                                        index === latestAIIndex
                                            ? lastFeedback?.grammar_feedback
                                            : null,
                                    vocabulary:
                                        index === latestAIIndex
                                            ? lastFeedback?.vocabulary_feedback
                                            : null,
                                    encouragement:
                                        index === latestAIIndex
                                            ? lastFeedback?.natural_english_feedback
                                            : null,
                                }}
                                isLatestAIMessage={index === latestAIIndex}
                                isSpeaking={
                                    index === latestAIIndex &&
                                    isSpeaking
                                }
                                isListening={
                                    index === latestAIIndex &&
                                    isListening &&
                                    !thinking &&
                                    !isSpeaking
                                }
                                online
                            />
                        );
                    }

                    return (
                        <div
                            key={index}
                            className="flex justify-end mb-6"
                        >
                            <div className="max-w-[75%] rounded-3xl rounded-tr-md bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-5 py-4 shadow-lg">
                                {msg.content}
                            </div>
                        </div>
                    );
                })}

                {thinking && (
                    <ThinkingAIMessage
                        isListening={false}
                        online
                    />
                )}

                <div ref={scrollRef} />
            </div>

            {/* Feedback */}
            {lastFeedback && !ended && (
                <FeedbackCard
                    feedback={lastFeedback}
                    summary="Nice reply! Here's how to sound even more natural:"
                />
            )}

            {error && (
                <p className="text-center text-sm text-rose-500">
                    {error}
                </p>
            )}

            {/* Input */}
            {!ended ? (
                <div className="rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-white/70 shadow-md">

                    <p className="text-center text-sm text-slate-500 mb-4">
                        Press <strong>Speak</strong> and reply to Lingora AI.
                    </p>

                    <div className="mb-3">
                        <VoiceStatusBar
                            status={voiceStatus}
                            onRetry={retryVoice}
                        />
                    </div>

                    <SpeechRecorder
                        onResult={handleUserReply}
                        onListeningChange={(listening) => {
                            setIsListening(listening);
                            onListening?.(listening);

                            if (listening) {
                                stop();
                                setIsSpeaking(false);
                                onAvatarState?.("idle");
                            }
                        }}
                        disabled={thinking}
                        label="Speak"
                    />
                </div>
            ) : (
                <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center space-y-4">

                    <div className="text-4xl">
                        🎉
                    </div>

                    <h3 className="text-lg font-extrabold text-emerald-700">
                        Conversation Complete!
                    </h3>

                    <p className="text-sm text-emerald-600">
                        Great job practicing {lesson.title}! You completed {turn} turns.
                    </p>

                    <button
                        onClick={handleFinish}
                        className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-all"
                    >
                        See Your Results →
                    </button>
                </div>
            )}
        </div>
    );
}