import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useModalBehavior from "../../Hooks/useModalBehavior";

const STEP_LABELS = {
    vocabulary: "Vocabulary",
    sentences: "Sentence Practice",
    conversation: "AI Conversation",
    summary: "Lesson Summary",
};

function stepLabel(step) {
    return STEP_LABELS[step] || step || "Vocabulary";
}

// Pure helper: given a millisecond delta, return a human "time ago" string.
function deltaToTimeAgo(diff) {
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

/**
 * ResumeModal
 * -----------
 * "Continue where you left off?" dialog shown when a user reopens a lesson
 * that has a saved in-progress state.
 *
 * @param {boolean} open      - whether to show the modal
 * @param {object}  saved     - the saved lesson state (lessonKey, lessonTitle, step, savedAt...)
 * @param {function} onContinue - resume from saved state
 * @param {function} onRestart  - start the lesson fresh
 */
export default function ResumeModal({ open, saved, onContinue, onRestart }) {
    // The "time ago" string is derived from the current time, so it must be
    // computed in an effect (not during render) to keep the component pure.
    const [timeAgoText, setTimeAgoText] = useState("");
    useModalBehavior(open && !!saved, onRestart);

    useEffect(() => {
        // Defer the setState to a microtask so it is not synchronous inside
        // the effect body (avoids react-hooks/set-state-in-effect). Date.now()
        // is also impure, so it must not run during render.
        let cancelled = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            if (!open || !saved || !saved.savedAt) {
                setTimeAgoText("");
                return;
            }
            try {
                const diff = Date.now() - new Date(saved.savedAt).getTime();
                setTimeAgoText(deltaToTimeAgo(diff));
            } catch {
                setTimeAgoText("");
            }
        });
        return () => {
            cancelled = true;
        };
    }, [open, saved]);

    return (
        <AnimatePresence>
            {open && saved && (
                <motion.div
                    className="mobile-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={onRestart}
                    />

                    {/* Dialog */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Resume lesson"
                        className="mobile-modal-panel relative w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-white/70 overflow-hidden"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    >
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl shadow-lg">
                                ⏯️
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-800">
                                Continue where you left off?
                            </h3>
                            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                                You were on{" "}
                                <span className="font-semibold text-slate-700">
                                    {saved.lessonTitle || "this lesson"}
                                </span>{" "}
                                — {stepLabel(saved.step)}
                                {timeAgoText && (
                                    <span className="text-slate-400"> · {timeAgoText}</span>
                                )}
                            </p>
                        </div>

                        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={onRestart}
                                className="touch-target h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all text-sm font-bold text-slate-600"
                            >
                                Restart
                            </button>
                            <button
                                onClick={onContinue}
                                className="touch-target h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 active:scale-[0.98] transition-all text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
                            >
                                Continue →
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
