import { useCallback } from "react";
import { tts } from "../services/speechService";

/**
 * useVocabSpeech
 * --------------
 * A small, reusable Text-to-Speech helper for the Vocabulary module.
 *
 * Previously this hook was browser-only (it used window.speechSynthesis
 * directly), which is why the Vocabulary "Listen" button stayed silent on
 * Android — the Android WebView's speechSynthesis is unreliable/unavailable.
 *
 * It now delegates to the shared SpeechService `tts` singleton, which
 * auto-detects the platform and uses the native @capacitor-community/
 * text-to-speech plugin on Android (with a web fallback). Accent awareness
 * is handled by the service, so vocabulary audio matches the user's chosen
 * accent (American / British) and updates live when the accent changes.
 *
 * Returns:
 *   speak(text, opts?)  - speak the given text
 *   speakSlow(text)     - speak at a slower rate (for pronunciation practice)
 *
 * opts: { rate, pitch, lang }
 */
export default function useVocabSpeech() {
    const speak = useCallback((text, { rate = 0.95, pitch = 1, lang } = {}) => {
        if (!text) return;
        tts.speak(text, { rate, pitch, lang });
    }, []);

    const speakSlow = useCallback(
        (text, opts = {}) => tts.speakSlow(text, { rate: 0.6, ...opts }),
        []
    );

    return { speak, speakSlow };
}
