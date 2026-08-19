import { useCallback, useEffect, useRef } from "react";

/**
 * useLessonResume
 * ---------------
 * Auto-save + resume support for the Speaking Course.
 *
 * Continuously persists the in-progress lesson state to localStorage so a
 * user who closes the app (or navigates away) can pick up exactly where they
 * left off. On reopen, the parent page can call `hasSavedLesson()` and show
 * a "Continue where you left off?" dialog with Continue / Restart options.
 *
 * Saved state shape:
 *   {
 *     lessonKey, lessonTitle, level, lessonIndex,
 *     step,            // "vocabulary" | "sentences" | "conversation" | "summary"
 *     vocabIndex, sentenceIndex,
 *     lessonXp, lessonScores,
 *     conversation,    // optional conversation transcript
 *     avatarState,     // last avatar state
 *     savedAt          // ISO timestamp
 *   }
 *
 * API:
 *   saveLesson(state)      persist current lesson state (debounced internally)
 *   clearLesson()          remove the saved state (on completion / restart)
 *   getSavedLesson()       read the saved state (or null)
 *   hasSavedLesson()       boolean
 *
 * The hook is intentionally framework-light: it returns helpers and does not
 * force a particular UI. The parent decides when to save (on step change,
 * on index change, on exit) and when to clear (on completion).
 */

const STORAGE_KEY = "lingora_speaking_resume";
const DEBOUNCE_MS = 800;

function readSaved() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.lessonKey) return null;
        return parsed;
    } catch {
        return null;
    }
}

function writeSaved(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* storage may be full / disabled */ }
}

function clearSaved() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
}

export default function useLessonResume() {
    const debounceRef = useRef(null);

    // Debounced save so rapid index changes don't thrash localStorage.
    const saveLesson = useCallback((state) => {
        if (!state || !state.lessonKey) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            writeSaved({ ...state, savedAt: new Date().toISOString() });
        }, DEBOUNCE_MS);
    }, []);

    // Immediate save (used on exit / visibilitychange) — bypasses debounce.
    const saveLessonNow = useCallback((state) => {
        if (!state || !state.lessonKey) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        writeSaved({ ...state, savedAt: new Date().toISOString() });
    }, []);

    const clearLesson = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        clearSaved();
    }, []);

    const getSavedLesson = useCallback(() => readSaved(), []);

    const hasSavedLesson = useCallback(() => readSaved() !== null, []);

    // Flush any pending debounced save when the tab is hidden / app is
    // backgrounded — important for Capacitor Android where the WebView
    // may be paused without a normal React unmount.
    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState === "hidden" && debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
                // The last queued state was already written by saveLesson's
                // timeout; nothing extra to do here beyond cancelling the
                // pending timer to avoid a write after backgrounding.
            }
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, []);

    return {
        saveLesson,
        saveLessonNow,
        clearLesson,
        getSavedLesson,
        hasSavedLesson,
    };
}
