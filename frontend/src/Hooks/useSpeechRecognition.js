import { useCallback, useEffect, useSyncExternalStore } from "react";
import { sr } from "../services/speechService";

/**
 * useSpeechRecognition
 * ---------------------
 * React binding for the shared SpeechService speech-recognition engine.
 *
 * This hook is a thin reactive wrapper around the singleton `sr` service
 * (see services/speechService.js). It uses `useSyncExternalStore` to read the
 * engine's state, so React state stays in sync with the engine without any
 * setState-in-effect (no cascading renders, no "stuck on loading" race between
 * first render and the effect attaching the listener).
 *
 * It re-exposes the exact same API the Speaking Course components already use:
 *
 *   - transcript      string of recognized text
 *   - interim         live interim text
 *   - fullTranscript  transcript + interim (trimmed)
 *   - listening       boolean
 *   - supported       boolean
 *   - status          "ready" | "loading" | "unavailable" | "denied"
 *   - error           string | null
 *   - start()         begin listening (requests permission on native)
 *   - stop()          stop listening
 *   - reset()         clear transcript
 *   - requestPermission()  explicitly request mic permission
 *   - retry()         re-attempt initialisation after unavailable/denied
 *
 * Because the engine is a singleton, every component that uses this hook
 * shares one initialised SR instance — no duplicate native plugin loads and
 * no "Speech recognition isn't supported on this device" false negatives on
 * Android (the native path is used there, with a web fallback on browsers).
 *
 * Notes:
 *   - lang defaults to "en-US"
 *   - continuous=false, interimResults=true for live feedback
 */
export default function useSpeechRecognition({ lang = "en-US" } = {}) {
    const status = useSyncExternalStore(sr.subscribeStatus, sr.getSnapshotStatus);
    const listening = useSyncExternalStore(sr.subscribeListening, sr.getSnapshotListening);
    const transcript = useSyncExternalStore(sr.subscribeTranscript, sr.getSnapshotTranscript);
    const interim = useSyncExternalStore(sr.subscribeInterim, sr.getSnapshotInterim);
    const error = useSyncExternalStore(sr.subscribeError, sr.getSnapshotError);
    // `supported` flips together with status during init; reading it after the
    // status subscription keeps it in sync.
    const supported = sr.supported;

    // Keep the engine's lang in sync with the prop. This is a legitimate
    // external-system sync (not a setState-in-effect), so it stays in an effect.
    useEffect(() => {
        sr.setLang(lang);
    }, [lang]);

    const start = useCallback((opts = {}) => sr.start({ lang, ...opts }), [lang]);
    const stop = useCallback(() => sr.stop(), []);
    const reset = useCallback(() => sr.reset(), []);
    const requestPermission = useCallback(() => sr.requestPermission(), []);
    const retry = useCallback(() => sr.retry(), []);

    return {
        transcript,
        interim,
        fullTranscript: (transcript + " " + interim).trim(),
        listening,
        supported,
        status,
        error,
        start,
        stop,
        reset,
        requestPermission,
        retry,
    };
}
