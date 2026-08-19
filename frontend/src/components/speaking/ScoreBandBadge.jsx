import { motion } from "framer-motion";
import { getScoreBand, scoreColorClasses } from "../../utils/speakingScore";

/**
 * ScoreBandBadge
 * --------------
 * A compact pill that shows the performance band for a given score,
 * e.g. "🌟 Excellent" in emerald. Used alongside the PronunciationScore
 * circular meters so the learner instantly sees which band they landed in.
 *
 * @param {number} score - 0-100
 * @param {string} size  - "sm" | "md"
 */
export default function ScoreBandBadge({ score = 0, size = "md" }) {
    const band = getScoreBand(score);
    const cls = scoreColorClasses(band.color);

    const padding = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${cls.bg} ${cls.text} ${cls.border} ${padding}`}
        >
            <span>{band.emoji}</span>
            <span>{band.label}</span>
        </motion.div>
    );
}
