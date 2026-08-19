import { useState, useRef, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";
import UserAvatar from "../components/UserAvatar";

export default function AIChat() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.full_name || user?.name || "Learner";

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message;
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/ai-chat`, {
                message,
            });

            const aiResponse = response.data || {};
            let explanation = "No explanation available.";
            let examples = [];
            let tip = "Keep practicing English every day!";

            try {
                if (
                    typeof aiResponse.explanation === "string" &&
                    aiResponse.explanation.trim().startsWith("{")
                ) {
                    const parsed = JSON.parse(aiResponse.explanation);
                    explanation = parsed.explanation || explanation;
                    examples = parsed.examples || [];
                    tip = parsed.learning_tip || tip;
                } else {
                    explanation = aiResponse.explanation || explanation;
                    examples = Array.isArray(aiResponse.examples) ? aiResponse.examples : [];
                    tip = aiResponse.learning_tip || tip;
                }
            } catch {
                explanation = aiResponse.explanation || explanation;
            }

            setChatHistory((prev) => [
                ...prev,
                { user: userMessage, explanation, examples, tip },
            ]);
            setMessage("");
        } catch (error) {
            console.log("AI Error", error.response?.data || error.message);
            setChatHistory((prev) => [
                ...prev,
                {
                    user: userMessage,
                    explanation: "Unable to connect to Lingora AI.",
                    examples: [],
                    tip: "Please try again after a few seconds.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div
                className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:py-8"
                style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
            >
                {/* ===========================================
                    HEADER (single branding — no duplicate inside cards)
                ============================================ */}
                <header className="mb-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg">
                        🤖
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                            Lingora AI
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500 md:text-base">
                            Ask any English question and get easy explanations, examples and learning tips.
                        </p>
                    </div>
                </header>

                {/* ===========================================
                    INPUT CARD
                ============================================ */}
                <div className="rounded-3xl bg-white p-4 shadow-lg md:p-6">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows="3"
                        placeholder="Example: Explain Present Perfect Tense"
                        className="w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 md:text-base"
                    />

                    <button
                        onClick={sendMessage}
                        disabled={loading || !message.trim()}
                        className={`mt-4 flex w-full touch-manipulation items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold text-white transition md:w-auto md:px-10 ${loading || !message.trim()
                                ? "cursor-not-allowed bg-slate-300"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Thinking...
                            </>
                        ) : (
                            "Ask AI →"
                        )}
                    </button>
                </div>

                {/* ===========================================
                    WELCOME MESSAGE (when no chat history)
                ============================================ */}
                {chatHistory.length === 0 && !loading && (
                    <div className="mt-6 rounded-3xl bg-white p-6 text-center shadow-lg md:p-10">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                            👋
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 md:text-xl">
                            Hi {userName.split(" ")[0]}, I'm Lingora AI!
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 md:text-base">
                            I'm here to help you learn English. Ask me about grammar, vocabulary,
                            pronunciation, or anything you'd like to understand better.
                        </p>

                        {/* Suggested prompts */}
                        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {[
                                { icon: "📖", text: "Explain Present Perfect Tense" },
                                { icon: "📝", text: "Difference between who and whom" },
                                { icon: "🗣️", text: "How to pronounce 'through'" },
                                { icon: "💬", text: "Common phrases for small talk" },
                            ].map((s) => (
                                <button
                                    key={s.text}
                                    type="button"
                                    onClick={() => {
                                        setMessage(s.text);
                                        textareaRef.current?.focus();
                                    }}
                                    className="flex touch-manipulation items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                                >
                                    <span className="text-lg">{s.icon}</span>
                                    <span className="min-w-0 flex-1 truncate">{s.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===========================================
                    CHAT HISTORY
                ============================================ */}
                <div className="mt-6 space-y-6">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className="space-y-3">
                            {/* User Question — right-aligned bubble */}
                            <div className="flex items-start justify-end gap-3">
                                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white shadow-md">
                                    <p className="whitespace-pre-line text-sm font-medium md:text-base">
                                        {chat.user}
                                    </p>
                                </div>
                                <UserAvatar name={userName} size="sm" className="mt-1 shrink-0" />
                            </div>

                            {/* AI Response — left-aligned card (no duplicate branding) */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg shadow-md">
                                    🤖
                                </div>
                                <div className="min-w-0 flex-1 space-y-3">
                                    {/* Explanation */}
                                    <div className="rounded-2xl rounded-tl-sm border border-green-200 bg-green-50 p-4">
                                        <h3 className="mb-2 text-sm font-bold text-green-700 md:text-base">
                                            📖 Explanation
                                        </h3>
                                        <p className="whitespace-pre-line text-sm leading-6 text-slate-700 md:text-base md:leading-7">
                                            {chat.explanation}
                                        </p>
                                    </div>

                                    {/* Examples */}
                                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                        <h3 className="mb-2 text-sm font-bold text-blue-700 md:text-base">
                                            📝 Examples
                                        </h3>
                                        {chat.examples.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {chat.examples.map((example, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-slate-700 md:text-base"
                                                    >
                                                        • {example}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-slate-500">No examples available.</p>
                                        )}
                                    </div>

                                    {/* Learning Tip */}
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                        <h3 className="mb-2 text-sm font-bold text-amber-700 md:text-base">
                                            💡 Learning Tip
                                        </h3>
                                        <p className="whitespace-pre-line text-sm leading-6 text-slate-700 md:text-base md:leading-7">
                                            {chat.tip}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg shadow-md">
                                🤖
                            </div>
                            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-md">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
}
