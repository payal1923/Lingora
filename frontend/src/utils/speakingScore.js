/**
 * speakingScore
 * --------------
 * Shared pronunciation-scoring utilities for the Speaking Course.
 *
 * Provides realistic, band-based scoring that derives a performance label,
 * color, and encouraging feedback message from a numeric score. Used by
 * VocabularyPractice, SentencePractice, and ConversationPractice so the
 * feedback always matches the score (never "excellent" on a 55).
 *
 * Bands:
 *   Excellent         95-100
 *   Very Good         85-94
 *   Good              70-84
 *   Needs Improvement 50-69
 *   Poor              <50
 */

export const SCORE_BANDS = [
    {
        min: 95, max: 100, label: "Excellent", color: "emerald", emoji: "🌟",
        message: "Outstanding! Your pronunciation was nearly perfect."
    },
    {
        min: 85, max: 94, label: "Very Good", color: "green", emoji: "✨",
        message: "Great work! Just a tiny polish away from perfect."
    },
    {
        min: 70, max: 84, label: "Good", color: "amber", emoji: "👍",
        message: "Good job! Try matching a few more sounds."
    },
    {
        min: 50, max: 69, label: "Needs Improvement", color: "orange", emoji: "💪",
        message: "Keep practicing — slow down and focus on the key words."
    },
    {
        min: 0, max: 49, label: "Poor", color: "rose", emoji: "🔄",
        message: "Don't give up! Listen to the target and try again."
    },
];

/**
 * getScoreBand(score)
 * Returns the matching band object for a 0-100 score.
 * Falls back to the lowest band for invalid input.
 */
export function getScoreBand(score) {
    const s = Math.max(0, Math.min(100, Number(score) || 0));
    return SCORE_BANDS.find((b) => s >= b.min && s <= b.max) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * getScoreLabel(score)
 * Returns just the band label, e.g. "Excellent".
 */
export function getScoreLabel(score) {
    return getScoreBand(score).label;
}

/**
 * getScoreColor(score)
 * Returns the band color token, e.g. "emerald".
 */
export function getScoreColor(score) {
    return getScoreBand(score).color;
}

/**
 * getScoreMessage(score)
 * Returns an encouraging message that matches the score band.
 */
export function getScoreMessage(score) {
    return getScoreBand(score).message;
}

/**
 * getScoreEmoji(score)
 * Returns the band emoji.
 */
export function getScoreEmoji(score) {
    return getScoreBand(score).emoji;
}

/**
 * Tailwind class helpers for a given score band color token.
 */
export function scoreColorClasses(color) {
    switch (color) {
        case "emerald":
            return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-300", stroke: "#10b981" };
        case "green":
            return { text: "text-green-600", bg: "bg-green-50", border: "border-green-200", ring: "ring-green-300", stroke: "#22c55e" };
        case "amber":
            return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", ring: "ring-amber-300", stroke: "#f59e0b" };
        case "orange":
            return { text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", ring: "ring-orange-300", stroke: "#f97316" };
        case "rose":
            return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", ring: "ring-rose-300", stroke: "#f43f5e" };
        default:
            return { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", ring: "ring-slate-300", stroke: "#64748b" };
    }
}
