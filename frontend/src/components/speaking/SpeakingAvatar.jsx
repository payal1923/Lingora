import { motion } from "framer-motion";
import AITutorAvatar from "../AITutorAvatar";
import CelebrationOverlay from "./CelebrationOverlay";

/**
 * SpeakingAvatar
 * --------------
 * Reuses the existing Lingora AI avatar (AITutorAvatar) and maps the
 * speaking-course avatar states to its props.
 *
 * Avatar states (driven by useAvatarStateMachine in SpeakingPractice):
 *   idle, ready, listening, thinking, speaking, happy, completed
 *
 * IMPORTANT: "happy" and "completed" are NOT mapped to isSpeaking anymore.
 * Previously they were, which left the avatar stuck in the "Speaking" state
 * after a lesson ended. Now completion states use a dedicated emerald glow
 * and a celebration overlay, then settle back to a calm idle/ready look.
 *
 * @param {string} state - one of the states above
 */
export default function SpeakingAvatar({ state = "idle" }) {
    const isListening = state === "listening";
    const isThinking = state === "thinking";
    const isSpeaking = state === "speaking";

    // Completion states get their own look — never the speaking mouth/glow.
    const isHappy = state === "happy";
    const isCompleted = state === "completed";
    const isCelebrating = isHappy;

    // Override the avatar card's status badge + glow for completion states.
    let statusLabelOverride;
    let statusDotOverride;
    let glowColorOverride;

    if (isHappy) {
        statusLabelOverride = "Lesson Complete";
        statusDotOverride = "bg-emerald-500";
        glowColorOverride = "rgba(16,185,129,0.45)";
    } else if (isCompleted) {
        statusLabelOverride = "Ready for Next Lesson";
        statusDotOverride = "bg-emerald-500";
        glowColorOverride = "rgba(16,185,129,0.30)";
    }

    return (
        <div className="w-full">
            <motion.div
                // Gentle bounce while celebrating, calm otherwise.
                animate={
                    isCelebrating
                        ? { y: [0, -8, 0], scale: [1, 1.04, 1] }
                        : { y: 0, scale: 1 }
                }
                transition={
                    isCelebrating
                        ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.3 }
                }
            >
                <div className="relative">
                    <AITutorAvatar
                        isSpeaking={isSpeaking}
                        isThinking={isThinking}
                        isListening={isListening}
                        online
                        statusLabelOverride={statusLabelOverride}
                        statusDotOverride={statusDotOverride}
                        glowColorOverride={glowColorOverride}
                    />
                    <CelebrationOverlay active={isCelebrating} />
                </div>
            </motion.div>

            {/* State caption */}
            <div className="mt-3 flex justify-center">
                <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
            ${state === "speaking"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : state === "listening"
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : state === "thinking"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : state === "happy"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : state === "completed"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : state === "ready"
                                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                >
                    {state === "speaking" && "🗣️ Speaking"}
                    {state === "listening" && "👂 Listening"}
                    {state === "thinking" && "🤔 Thinking"}
                    {state === "happy" && "🎉 Lesson Complete"}
                    {state === "completed" && "✅ Ready for Next Lesson"}
                    {state === "ready" && "✨ Ready"}
                    {state === "idle" && "✨ Ready"}
                </span>
            </div>
        </div>
    );
}
