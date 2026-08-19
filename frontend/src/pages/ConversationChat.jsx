import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
    Clock,
    Compass,
    GaugeCircle,
    CheckCircle2,
    LogOut,
    Rocket,
    Home,
    BarChart3,
    MessageSquareText,
    BookOpenCheck,
    Percent,
    Sparkles,
} from "lucide-react";

import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/ChatInput";
import AIMessage from "../components/AIMessage";
import ThinkingAIMessage from "../components/ThinkingAIMessage";

import { conversationPrompts } from "../data/conversationPrompts";
import { sendConversationMessage } from "../services/conversationService";
import { getAccentLangCode, subscribe } from "../config/preferences";
import { tts, sr } from "../services/speechService";
import { isNativePlatform } from "../Hooks/useCapacitor";

// The @capacitor-community/speech-recognition plugin has no web
// implementation; calling it in a browser throws "Method not implemented
// on web". Detect the host platform once (it never changes at runtime) so
// voice input can be gracefully disabled on web without touching the plugin.
const isNative = isNativePlatform();

// ---------------- Session timer helpers ----------------
// Parses strings like "10 Minutes" / "5 Minutes" into whole seconds.
// Falls back to 10 minutes if the string is missing or unrecognized, so the
// timer never silently breaks on an unexpected duration value.
const parseDurationToSeconds = (durationStr) => {
    const match = /\d+/.exec(durationStr || "");
    const minutes = match ? parseInt(match[0], 10) : 10;
    return minutes * 60;
};

// Formats a whole-second countdown as MM:SS, always two digits each side.
const formatTime = (totalSeconds) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const mins = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
    const secs = (safeSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
};

// Counts words in a string of natural-language text (used for the "Words
// Spoken" stat). Returns 0 for empty/whitespace-only strings.
const countWords = (text) => {
    if (!text) return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
};

export default function ConversationChat() {

    const { state } = useLocation();
    const navigate = useNavigate();

    // Derive route state with safe fallbacks so every hook below runs
    // unconditionally on every render (Rules of Hooks). The actual redirect
    // happens after the hooks, once we know state is missing.
    const {
        topic,
        difficulty,
        duration,
    } = state || {};

    const user =
        JSON.parse(localStorage.getItem("user")) || {};

    // Build the greeting only when the route state is valid. This is a pure
    // helper (not a hook) invoked from the lazy initializers below, so the
    // greeting — and therefore `topic` — is never accessed before the route
    // state has been validated. The redirect for missing state still happens
    // after all hooks, so the Rules of Hooks are preserved.
    const buildGreeting = useCallback(() => {
        const prompt =
            conversationPrompts[topic] ||
            conversationPrompts["Free Talk"];

        const greeting = prompt.firstMessage.replace(
            "Hello!",
            `Hello ${user.full_name || "Learner"}! 👋`
        );

        return { sender: "ai", text: greeting };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic]);

    const [messages, setMessages] = useState(() =>
        state ? [buildGreeting()] : []
    );
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // ---------------- Avatar / Voice state ----------------
    const [listening, setListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // ---------------- Session timer state ----------------
    // timeLeft counts down in whole seconds from the duration passed in via
    // route state. sessionComplete flips once (either the timer hits zero or
    // the user ends manually) and gates further sending / listening.
    const [timeLeft, setTimeLeft] = useState(() => parseDurationToSeconds(duration));
    const [sessionComplete, setSessionComplete] = useState(false);
    // Drives the fade/scale entrance transition on the completion screen.
    const [completeVisible, setCompleteVisible] = useState(false);
    const timerIntervalRef = useRef(null);

    // ---------------- Refs (always hold the latest values) ----------------
    // messagesRef mirrors `messages` so async callbacks (sendMessage,
    // SpeechRecognition listeners) can read the live history without being
    // pinned to a stale render closure.
    const messagesRef = useRef(null);
    if (messagesRef.current === null) {
        messagesRef.current = messages;
    }
    const transcriptRef = useRef("");
    const bottomRef = useRef(null);

    // Live accent lang code (e.g. "en-US" / "en-GB") so the conversation
    // voice matches the user's preferred accent and updates instantly when
    // it changes in Profile — no restart needed.
    const accentLangRef = useRef(getAccentLangCode());

    // Async mutex: while a request is in flight, sendingRef.current is true
    // and any new sendMessage() call is rejected. This guarantees exactly one
    // API request per user message and prevents overlapping sends.
    const sendingRef = useRef(false);

    // Keep messagesRef in sync with the messages state on every commit.
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Auto-scroll to the latest message.
    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages, loading]);

    // ---------------- Timer control helpers ----------------
    // Starts (or restarts) the 1s countdown interval. Centralized so both the
    // mount effect and "Practice Again" use identical logic.
    const startTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        timerIntervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Ends the session exactly once, however it was triggered (timer hitting
    // zero, or the user tapping "End Session"): stops the timer, stops any
    // in-flight speech/mic, and flips sessionComplete. Never touches message
    // history, so past chat remains visible underneath.
    const endSession = useCallback(() => {
        setSessionComplete((already) => {
            if (already) return already;
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            tts.stop();
            sr.stop();
            setListening(false);
            return true;
        });
    }, []);

    // ---------------- Session countdown ----------------
    // Starts once on mount (guarded by `state`). Cleaned up on unmount.
    useEffect(() => {
        if (!state) return;
        startTimer();
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    // When the countdown hits zero, end the session automatically.
    useEffect(() => {
        if (timeLeft === 0 && !sessionComplete) {
            endSession();
        }
    }, [timeLeft, sessionComplete, endSession]);

    // Trigger the entrance transition shortly after the completion screen
    // mounts, so it animates in rather than popping.
    useEffect(() => {
        if (sessionComplete) {
            const id = setTimeout(() => setCompleteVisible(true), 20);
            return () => clearTimeout(id);
        }
        setCompleteVisible(false);
    }, [sessionComplete]);

    // ---------------- Cleanup speech recognition listeners on unmount ----------------
    useEffect(() => {
        // Keep the accent lang ref in sync with preference changes so the
        // conversation voice follows the user's chosen accent live.
        const unsubAccent = subscribe("preferredAccent", () => {
            accentLangRef.current = getAccentLangCode();
        });

        return () => {
            unsubAccent();
            // Stop any in-flight speech / recognition via the shared service.
            // The service only touches the native plugins on native platforms,
            // so this is safe to call on web too.
            tts.stop();
            sr.stop();
        };

    }, []);

    // ---------------- Text To Speech (optional) ----------------
    // Delegates to the shared SpeechService `tts` singleton, which auto-detects
    // the platform (native Capacitor plugin on Android, browser
    // speechSynthesis on web) and handles accent + loading states. The
    // onEnd callback resets the avatar speaking state so it never gets stuck.
    const speak = useCallback(async (text) => {

        if (!text) return;

        setIsSpeaking(true);

        try {
            await tts.speak(text, {
                lang: accentLangRef.current,
                rate: 0.95,
                pitch: 1.0,
                onEnd: () => setIsSpeaking(false),
            });
        } catch (error) {
            // TTS is non-critical; never let it break the conversation flow.
            console.warn("TextToSpeech error:", error);
            setIsSpeaking(false);
        }

    }, []);

    // ---------------- Core send logic ----------------
    // sendMessage is stable: it reads everything from refs, so the
    // SpeechRecognition listener (registered once) always calls the same
    // up-to-date function and never a stale closure.
    const sendMessage = useCallback(async (voiceMessage = null) => {

        // Once the session has ended, reject any further sends (including a
        // trailing voice transcript).
        if (sessionComplete) return;

        const currentMessage = (voiceMessage || message).trim();

        // Reject empty input.
        if (!currentMessage) return;

        // Mutex: only one in-flight request at a time.
        if (sendingRef.current) return;
        sendingRef.current = true;
        setLoading(true);

        const userMessage = {
            sender: "user",
            text: currentMessage,
        };

        // Append the user message functionally and mirror into the ref
        // immediately so history (below) is built from the live array.
        const historyBase = [...messagesRef.current, userMessage];
        messagesRef.current = historyBase;
        setMessages((prev) => [...prev, userMessage]);

        setMessage("");

        let aiReply = null;

        try {

            const history = historyBase.map((msg) => ({
                role: msg.sender === "ai" ? "assistant" : "user",
                content: msg.text,
            }));

            const ai = await sendConversationMessage({
                topic,
                difficulty,
                history,
            });

            const aiMessage = {
                sender: "ai",
                text: ai.reply,
                grammar: ai.grammar_feedback,
                vocabulary: ai.vocabulary_tip,
                encouragement: ai.encouragement,
            };

            // Append the AI reply functionally and mirror into the ref.
            messagesRef.current = [...historyBase, aiMessage];
            setMessages((prev) => [...prev, aiMessage]);

            aiReply = ai.reply;

        } catch (error) {

            console.error("sendMessage error:", error);

            const errorMessage = {
                sender: "ai",
                text: "Sorry, I couldn't connect to Lingora AI. Please try again.",
            };

            messagesRef.current = [...historyBase, errorMessage];
            setMessages((prev) => [...prev, errorMessage]);

        } finally {

            // Release the mutex and clear loading immediately after the
            // request settles — BEFORE TTS — so the next turn can start.
            sendingRef.current = false;
            setLoading(false);

        }

        // Speak the reply outside the critical section. TTS is optional and
        // must never block or clobber the next conversation turn's guards.
        if (aiReply) {
            await speak(aiReply);
        }

    }, [message, topic, difficulty, speak, sessionComplete]);

    // ---------------- Native Speech Recognition ----------------
    // Delegates to the shared SpeechService `sr` singleton, which auto-detects
    // the platform (native Capacitor plugin on Android, browser
    // SpeechRecognition on web) and handles permissions + loading states.
    //
    // We subscribe to the service's transcript/listening channels once on
    // mount. The transcript subscription updates the input box live; when
    // listening stops with a final transcript, we auto-send via sendMessage
    // (which reads from refs, so it's always the latest version — no stale
    // closure).
    useEffect(() => {
        const unsubs = [
            sr.onTranscriptChange((text) => {
                transcriptRef.current = text || "";
                if (text) setMessage(text);
            }),
            sr.onListeningChange((isListening) => {
                setListening(isListening);
                if (!isListening) {
                    const finalTranscript = transcriptRef.current;
                    if (finalTranscript && finalTranscript.trim()) {
                        sendMessage(finalTranscript);
                    }
                }
            }),
        ];
        return () => unsubs.forEach((u) => u && u());
    }, [sendMessage]);

    const startListening = useCallback(async () => {

        // The session has ended — the mic stays disabled from here on.
        if (sessionComplete) return;

        // The @capacitor-community/speech-recognition plugin is not
        // implemented on web; calling it throws "Method not implemented on
        // web". On web, gracefully disable voice input with a friendly
        // message instead of invoking the plugin. On Android/iOS the
        // existing behaviour is unchanged.
        if (!isNative) {
            alert("Voice input is only available in the mobile app.");
            return;
        }

        try {

            // The service handles availability check, permission request,
            // listener cleanup and start() in one call.
            transcriptRef.current = "";
            setMessage("");

            await sr.start({
                language: "en-US",
                maxResults: 1,
                partialResults: true,
                popup: false,
            });

        } catch (err) {

            console.error(err);
            setListening(false);
            alert("Unable to start microphone.");

        }

    }, [sessionComplete]);

    // ---------------- Session stats (for the completion screen) ----------------
    // Computed entirely from local state, so the screen works even before a
    // backend analytics endpoint exists. Each field is written so a real
    // backend value can replace the computed one later without touching the
    // UI (e.g. `ai.grammar_accuracy` could simply override `grammarAccuracy`).
    const sessionStats = useMemo(() => {
        const userMessages = messages.filter((m) => m.sender === "user");
        const aiMessages = messages.filter((m) => m.sender === "ai");

        const wordsSpoken = userMessages.reduce(
            (total, m) => total + countWords(m.text),
            0
        );

        const messagesExchanged = messages.length;

        // Proxy for grammar accuracy: AI replies that came back WITHOUT a
        // grammar correction count as "clean" turns.
        const correctableTurns = aiMessages.filter((m) => m.grammar).length;
        const grammarAccuracy =
            aiMessages.length > 0
                ? Math.round(
                    ((aiMessages.length - correctableTurns) / aiMessages.length) * 100
                )
                : 100;

        // Unique vocabulary tips surfaced during the session.
        const newVocabulary = new Set(
            aiMessages.filter((m) => m.vocabulary).map((m) => m.vocabulary)
        ).size;

        // Simple, transparent XP formula until a backend value is wired in.
        const xpEarned = 50 + messagesExchanged * 2 + newVocabulary * 3;

        const totalElapsedSeconds = Math.max(
            0,
            parseDurationToSeconds(duration) - timeLeft
        );

        return {
            wordsSpoken,
            messagesExchanged,
            grammarAccuracy,
            newVocabulary,
            xpEarned,
            totalElapsedSeconds,
        };
    }, [messages, duration, timeLeft]);

    // "Practice Again" restarts the same scenario/difficulty/duration in
    // place, without leaving the page — resets chat + timer + voice state.
    const handlePracticeAgain = useCallback(() => {
        tts.stop();
        sr.stop();

        const freshGreeting = buildGreeting();
        messagesRef.current = [freshGreeting];
        setMessages([freshGreeting]);

        setMessage("");
        setLoading(false);
        setListening(false);
        setIsSpeaking(false);
        transcriptRef.current = "";

        setCompleteVisible(false);
        setSessionComplete(false);
        setTimeLeft(parseDurationToSeconds(duration));
        startTimer();
    }, [buildGreeting, duration, startTimer]);

    const handleBackToDashboard = useCallback(() => {
        navigate("/dashboard");
    }, [navigate]);

    // Redirect if the route state is missing. This runs AFTER all hooks so
    // the Rules of Hooks are satisfied.
    if (!state) {
        return <Navigate to="/conversation" replace />;
    }

    // ---------------- Session Complete screen ----------------
    // Replaces the entire conversation interface once the session ends,
    // whether triggered by the timer reaching zero or a manual end.
    if (sessionComplete) {

        const timeDisplay =
            timeLeft <= 0 ? duration : formatTime(sessionStats.totalElapsedSeconds);

        const statCards = [
            { label: "Scenario", value: topic, icon: Compass, accent: "text-blue-600 bg-blue-50" },
            { label: "Difficulty", value: difficulty, icon: GaugeCircle, accent: "text-indigo-600 bg-indigo-50" },
            { label: "Total Session Time", value: timeDisplay, icon: Clock, accent: "text-emerald-600 bg-emerald-50" },
            { label: "Words Spoken", value: sessionStats.wordsSpoken, icon: MessageSquareText, accent: "text-sky-600 bg-sky-50" },
            { label: "Messages Exchanged", value: sessionStats.messagesExchanged, icon: BarChart3, accent: "text-violet-600 bg-violet-50" },
            { label: "Grammar Accuracy", value: `${sessionStats.grammarAccuracy}%`, icon: Percent, accent: "text-rose-600 bg-rose-50" },
            { label: "New Vocabulary", value: sessionStats.newVocabulary, icon: BookOpenCheck, accent: "text-amber-600 bg-amber-50" },
        ];

        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 flex items-center justify-center px-4 py-10">

                <div
                    className={`w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 px-6 py-10 sm:px-10 sm:py-12
                    transition-all duration-500 ease-out
                    ${completeVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                >

                    <div className="flex flex-col items-center text-center">

                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-40" />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={40} className="text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
                            🎉 Session Complete
                        </h1>

                        <p className="mt-2 text-slate-500 max-w-md">
                            Great job! You completed your English speaking session.
                        </p>

                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                            {statCards.map(({ label, value, icon: Icon, accent }) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-4 text-center"
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${accent}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="text-sm font-bold text-slate-900 truncate max-w-full">
                                        {value}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                                        {label}
                                    </div>
                                </div>
                            ))}

                            {/* XP card gets its own highlighted treatment */}
                            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-3 py-4 text-center shadow-md">
                                <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div className="text-sm font-black text-white">
                                    +{sessionStats.xpEarned} XP
                                </div>
                                <div className="text-[11px] font-medium text-white/80 uppercase tracking-wide">
                                    XP Earned
                                </div>
                            </div>
                        </div>

                        <div className="mt-9 flex flex-col sm:flex-row gap-3 w-full">

                            <button
                                onClick={handlePracticeAgain}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white
                                bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] shadow-lg transition-all duration-300"
                            >
                                <Rocket size={18} />
                                Practice Again
                            </button>

                            <button
                                onClick={handleBackToDashboard}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-slate-700
                                bg-slate-100 hover:bg-slate-200 transition-all duration-300"
                            >
                                <Home size={18} />
                                Back to Dashboard
                            </button>

                        </div>

                        {/* Placeholder for the detailed report until analytics ships. */}
                        <button
                            disabled
                            title="Detailed reports are coming soon"
                            className="mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                            text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed"
                        >
                            <BarChart3 size={16} />
                            View Detailed Report
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    // Under a minute left — used to give the pill a gentle urgency cue.
    const isTimeRunningLow = timeLeft > 0 && timeLeft <= 60;

    return (

        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 flex flex-col">

            <ChatHeader

                topic={topic}

                difficulty={difficulty}

                duration={duration}

            />

            {/* Session status pill — sticky so it stays visible above the
                chat while messages scroll beneath it. */}
            <div className="sticky top-0 z-20 flex justify-center px-4 py-3 bg-gradient-to-b from-slate-50/95 to-slate-50/0 backdrop-blur-sm">

                <div
                    className="flex items-center divide-x divide-slate-200 rounded-full bg-white shadow-md border border-slate-200 px-2 py-1.5"
                >

                    <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-slate-700">
                        <Compass size={16} className="text-blue-600" />
                        {topic}
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-slate-700">
                        <GaugeCircle size={16} className="text-indigo-600" />
                        {difficulty}
                    </div>

                    <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold transition-colors
                        ${isTimeRunningLow
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                    >
                        <Clock size={16} className={isTimeRunningLow ? "text-red-500" : "text-emerald-600"} />
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        onClick={endSession}
                        title="End session"
                        className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={16} />
                    </button>

                </div>

            </div>

            <div className="flex-1 overflow-y-auto">

                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

                    {/* Find the index of the most recent AI message so that
                        ONLY it renders the tutor avatar card. All earlier AI
                        replies render just the bubble + feedback cards. This
                        guarantees exactly one avatar card in the chat at any
                        time, and the avatar effectively "moves" to the newest
                        AI reply as the conversation grows. */}
                    {(() => {
                        let latestAIIndex = -1;
                        for (let i = messages.length - 1; i >= 0; i--) {
                            if (messages[i].sender === "ai") {
                                latestAIIndex = i;
                                break;
                            }
                        }

                        return messages.map((msg, index) => {

                            const isLatestAIMessage = index === latestAIIndex;

                            if (msg.sender === "ai") {
                                // AIMessage always renders a COMPLETED response.
                                // The temporary thinking state is rendered
                                // separately below via ThinkingAIMessage.
                                return (
                                    <AIMessage
                                        key={index}
                                        message={msg}
                                        isLatestAIMessage={isLatestAIMessage}
                                        isSpeaking={isLatestAIMessage && isSpeaking && !loading}
                                        isListening={isLatestAIMessage && listening}
                                        online={true}
                                    />
                                );
                            }

                            // User message — right aligned, premium bubble.
                            return (
                                <div
                                    key={index}
                                    className="lingora-aitutor-fadeup flex justify-end mb-8"
                                >
                                    <div
                                        className="max-w-[75%] px-5 py-4 sm:px-6 sm:py-5 rounded-3xl rounded-tr-md
                                        bg-gradient-to-br from-blue-600 to-indigo-600 text-white
                                        leading-8 whitespace-pre-line
                                        shadow-[0_8px_30px_-10px_rgba(37,99,235,0.5)]"
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            );

                        });
                    })()}

                    {/* Temporary thinking indicator — rendered separately
                        from completed AI messages while a reply is pending. */}
                    {loading && (
                        <ThinkingAIMessage isListening={listening} online={true} />
                    )}

                    <div ref={bottomRef}></div>

                </div>

            </div>

            <ChatInput

                message={message}

                setMessage={setMessage}

                sendMessage={sendMessage}

                startListening={startListening}

                loading={loading}

                listening={listening}

            />

        </div>

    );

}