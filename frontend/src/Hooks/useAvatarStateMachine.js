import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAvatarStateMachine
 * ---------------------
 * A small, explicit state machine for the Lingora AI tutor avatar used by the
 * Speaking Course. It guarantees the avatar never gets "stuck" in an active
 * state (e.g. Speaking) after a lesson has ended.
 *
 * Supported states:
 *   "idle"       - resting / before a lesson starts
 *   "ready"      - lesson started, waiting for the first interaction
 *   "listening"  - the user is speaking into the mic
 *   "thinking"   - the AI is processing the user's speech
 *   "speaking"   - the AI is talking (TTS playback)
 *   "happy"      - short celebration right after a lesson completes
 *   "completed"  - lesson finished, ready for the next one
 *
 * Lifecycle (driven by the lesson components):
 *   start()        -> ready
 *   setListening() -> listening  (while the user holds the mic)
 *   setThinking()  -> thinking   (AI is analysing / replying)
 *   setSpeaking()  -> speaking   (AI TTS is playing)
 *   complete()     -> happy  ──(auto after ~2.5s)──> completed
 *   reset()        -> idle
 *
 * Safety nets:
 *   - A max-duration guard auto-clears "speaking" / "thinking" / "listening"
 *     so a missed TTS/STT callback can never freeze the avatar.
 *   - complete() always wins: it cancels any pending guard timer and forces
 *     the happy -> completed transition.
 *
 * @returns {object} { state, start, reset, complete,
 *                     setListening, setThinking, setSpeaking, clearActive }
 */
export default function useAvatarStateMachine() {
    const [state, setState] = useState("idle");

    // Timer for the happy -> completed celebration transition.
    const celebrateTimerRef = useRef(null);
    // Timer for the max-duration safety guard on active states.
    const guardTimerRef = useRef(null);

    const clearTimers = useCallback(() => {
        if (celebrateTimerRef.current) {
            clearTimeout(celebrateTimerRef.current);
            celebrateTimerRef.current = null;
        }
        if (guardTimerRef.current) {
            clearTimeout(guardTimerRef.current);
            guardTimerRef.current = null;
        }
    }, []);

    // If the component unmounts mid-celebration, never leave a dangling timer.
    useEffect(() => clearTimers, [clearTimers]);

    // Auto-revert any "active" state if its source never fires an end callback.
    // TTS / speech recognition can fail silently on some browsers, so this
    // guarantees the avatar always returns to a calm state.
    const armGuard = useCallback((fallbackState, ms = 12000) => {
        if (guardTimerRef.current) clearTimeout(guardTimerRef.current);
        guardTimerRef.current = setTimeout(() => {
            guardTimerRef.current = null;
            setState((prev) =>
                // Only fall back if we are still in the guarded active state.
                prev === "speaking" || prev === "thinking" || prev === "listening"
                    ? fallbackState
                    : prev
            );
        }, ms);
    }, []);

    const start = useCallback(() => {
        clearTimers();
        setState("ready");
    }, [clearTimers]);

    const reset = useCallback(() => {
        clearTimers();
        setState("idle");
    }, [clearTimers]);

    const setListening = useCallback(
        (value = true) => {
            // A lesson that is already completed must ignore further input.
            setState((prev) => {
                if (prev === "completed" || prev === "happy") return prev;
                if (!value) {
                    // Stop listening -> back to ready (waiting for next action).
                    return prev === "listening" ? "ready" : prev;
                }
                return "listening";
            });
            if (value) armGuard("ready", 20000);
        },
        [armGuard]
    );

    const setThinking = useCallback(
        (value = true) => {
            setState((prev) => {
                if (prev === "completed" || prev === "happy") return prev;
                if (!value) {
                    return prev === "thinking" ? "ready" : prev;
                }
                return "thinking";
            });
            if (value) armGuard("ready", 15000);
        },
        [armGuard]
    );

    const setSpeaking = useCallback(
        (value = true) => {
            setState((prev) => {
                if (prev === "completed" || prev === "happy") return prev;
                if (!value) {
                    return prev === "speaking" ? "ready" : prev;
                }
                return "speaking";
            });
            if (value) armGuard("ready", 12000);
        },
        [armGuard]
    );

    // Manually clear whatever active state is running (used by TTS onEnd).
    const clearActive = useCallback(() => {
        if (guardTimerRef.current) {
            clearTimeout(guardTimerRef.current);
            guardTimerRef.current = null;
        }
        setState((prev) => {
            if (prev === "completed" || prev === "happy") return prev;
            if (
                prev === "speaking" ||
                prev === "thinking" ||
                prev === "listening"
            ) {
                return "ready";
            }
            return prev;
        });
    }, []);

    // Called the moment a lesson is finished. Triggers the celebration and
    // then settles into the "completed" state.
    const complete = useCallback(() => {
        clearTimers();
        setState("happy");
        celebrateTimerRef.current = setTimeout(() => {
            celebrateTimerRef.current = null;
            setState("completed");
        }, 2500);
    }, [clearTimers]);

    return {
        state,
        start,
        reset,
        complete,
        setListening,
        setThinking,
        setSpeaking,
        clearActive,
    };
}
