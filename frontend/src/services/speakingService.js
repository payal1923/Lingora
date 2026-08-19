import axios from "axios";
import API_URL from "../config/api";

/**
 * speakingService
 * ---------------
 * API layer for the Speaking Course module.
 * All endpoints map to backend/routers/speaking.py.
 *
 * User id resolution mirrors the rest of the app:
 *   const user = JSON.parse(localStorage.getItem("user"));
 *   const userId = user?.user_id ?? user?.id;
 */

function getUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user?.user_id ?? user?.id ?? null;
    } catch {
        return null;
    }
}

/**
 * Analyze a spoken word or sentence.
 * @param {string} target  - what the learner should say
 * @param {string} spoken  - what the learner actually said (STT)
 * @param {string} itemType - "word" | "sentence"
 */
export async function analyzeSpeaking(target, spoken, itemType = "sentence") {
    const { data } = await axios.post(`${API_URL}/speaking-analyze`, {
        target,
        spoken,
        item_type: itemType,
    });
    return data;
}

/**
 * Continue an AI conversation turn.
 */
export async function continueConversation(payload) {
    const { data } = await axios.post(`${API_URL}/speaking-conversation`, payload);
    return data;
}

/**
 * Save a single attempt (word or sentence) + update stats.
 */
export async function saveAttempt(payload) {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const { data } = await axios.post(`${API_URL}/speaking-attempt`, {
        user_id: userId,
        ...payload,
    });
    return data;
}

/**
 * Complete a lesson, award XP, unlock achievements.
 */
export async function completeLesson(payload) {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const { data } = await axios.post(`${API_URL}/speaking-complete-lesson`, {
        user_id: userId,
        ...payload,
    });
    return data;
}

/**
 * Get the full speaking roadmap (45 lessons with lock/complete status).
 */
export async function getRoadmap() {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const { data } = await axios.get(`${API_URL}/speaking-roadmap/${userId}`);
    return data;
}

/**
 * Get the speaking dashboard stats.
 */
export async function getDashboard() {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const { data } = await axios.get(`${API_URL}/speaking-dashboard/${userId}`);
    return data;
}

/**
 * Get detailed speaking statistics (weekly + monthly).
 */
export async function getStatistics() {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const { data } = await axios.get(`${API_URL}/speaking-statistics/${userId}`);
    return data;
}

/**
 * Get weak words/sentences due for review.
 */
export async function getReviewItems() {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const { data } = await axios.get(`${API_URL}/speaking-review/${userId}`);
    return data;
}

/**
 * Mark a review item as done.
 */
export async function markReviewDone(attemptId, overallScore) {
    const { data } = await axios.post(`${API_URL}/speaking-review-done`, {
        attempt_id: attemptId,
        overall_score: overallScore,
    });
    return data;
}

/**
 * Get speaking badges.
 */
export async function getBadges() {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const { data } = await axios.get(`${API_URL}/speaking-badges/${userId}`);
    return data;
}

const speakingService = {
    analyzeSpeaking,
    continueConversation,
    saveAttempt,
    completeLesson,
    getRoadmap,
    getDashboard,
    getStatistics,
    getReviewItems,
    markReviewDone,
    getBadges,
};

export default speakingService;
