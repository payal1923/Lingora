import { motion, AnimatePresence } from "framer-motion";

/**
 * VoiceStatusBar
 * --------------
 * A small, reusable status strip that reflects the Text-to-Speech voice
 * loading state. Shared by VocabularyPractice, SentencePractice, and
 * ConversationPractice so each practice card shows consistent messaging:
 *
 *   - loading  -> "Preparing voice…" (spinner)
 *   - unavailable -> "Voice unavailable. Tap to retry." (retry button)
 *   - ready    -> renders nothing (clean UI)
 *
 * @param {string} status   - "ready" | "loading" | "unavailable"
 * @param {function} onRetry - retry voice loading
 */
export default function VoiceStatusBar({ status, onRetry }) {
    const isLoading = status === "loading";
    const isUnavailable = status === "unavailable";

    return (
        <AnimatePresence>
            {(isLoading || isUnavailable) && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium
                        ${isUnavailable
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}
                >
                    {isLoading && (
                        <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
                            <span>Preparing voice…</span>
                        </>
                    )}
                    {isUnavailable && (
                        <>
                            <span>🔇 Voice unavailable.</span>
                            <button
                                onClick={onRetry}
                                className="font-bold underline underline-offset-2 hover:text-rose-700 active:scale-95 transition"
                            >
                                Tap to retry
                            </button>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
