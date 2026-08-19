import { useCallback, useSyncExternalStore } from "react";
import { tts } from "../services/speechService";

/**
 * useTextToSpeech
 * ---------------
 * React binding for the shared SpeechService TTS engine.
 *
 * This hook is a thin reactive wrapper around the singleton `tts` service
 * (see services/speechService.js). It uses `useSyncExternalStore` to read the
 * engine's state, so React state stays in sync with the engine without any
 * setState-in-effect (no cascading renders, no "stuck on loading" race between
 * first render and the effect attaching the listener).
 *
 * It re-exposes the exact same API the Speaking Course components already use:
 *
 *   - speak(text, opts?)   natural pronunciation
 *   - speakSlow(text)      slow pronunciation for practice
 *   - replay()             replay the last spoken text
 *   - stop()               stop any current speech
 *   - speaking             boolean — is the TTS currently speaking
 *   - supported            boolean — is any TTS available
 *   - status               "ready" | "loading" | "unavailable"
 *   - voices               array of available voices
 *   - retry()              re-attempt voice loading after a failure
 *
 * opts: { rate, pitch, lang, onEnd }
 *
 * Because the engine is a singleton, every component that uses this hook
 * shares one initialised TTS instance — no duplicate native plugin loads,
 * no "Preparing voice…" stuck states, and accent changes propagate live.
 */
export default function useTextToSpeech() {
    const status = useSyncExternalStore(tts.subscribeStatus, tts.getSnapshotStatus);
    const speaking = useSyncExternalStore(tts.subscribeSpeaking, tts.getSnapshotSpeaking);
    const voices = useSyncExternalStore(tts.subscribeVoices, tts.getSnapshotVoices);
    // `supported` is derived from the engine state; it flips together with
    // status during init, so reading it after the status subscription keeps it
    // in sync.
    const supported = tts.supported;

    const speak = useCallback((text, opts = {}) => tts.speak(text, opts), []);
    const speakSlow = useCallback((text, opts = {}) => tts.speakSlow(text, opts), []);
    const replay = useCallback(() => tts.replay(), []);
    const stop = useCallback(() => tts.stop(), []);
    const retry = useCallback(() => { tts.retry(); }, []);

    return {
        speak,
        speakSlow,
        replay,
        stop,
        speaking,
        supported,
        status,
        voices,
        retry,
    };
}
