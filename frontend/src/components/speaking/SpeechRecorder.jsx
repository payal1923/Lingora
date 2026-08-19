import { useEffect, useRef } from "react";
import useSpeechRecognition from "../../Hooks/useSpeechRecognition";

/**
 * SpeechRecorder
 * --------------
 * A reusable microphone button + live transcript display.
 * Wraps useSpeechRecognition.
 *
 * Android-first: large 56px+ touch target, clear listening state, and
 * graceful messaging when speech recognition is unsupported or the mic
 * permission is denied.
 *
 * @param {function} onResult(transcript)     - called when listening stops with final text
 * @param {function} onListeningChange(bool)  - called when the mic starts/stops listening
 * @param {boolean}  disabled
 * @param {string}   label   - button label
 * @param {string}   lang    - recognition language
 */
export default function SpeechRecorder({
    onResult,
    onListeningChange,
    disabled = false,
    label = "Practice",
    lang = "en-US",
}) {
    const { listening, transcript, interim, supported, status, error, start, stop, reset, requestPermission } =
        useSpeechRecognition({ lang });

    // Deliver the transcript to the parent ONLY when a real recognition
    // session ends — i.e. `listening` transitions from true -> false. We must
    // NOT fire onResult on mount with a pre-existing transcript, because the
    // SR engine is a singleton whose transcript persists across items. Doing
    // so would auto-evaluate the next word/sentence with the previous item's
    // transcript and cascade through the whole lesson with no user interaction.
    // The prevListeningRef tracks the previous listening value so we can detect
    // the true->false edge instead of reacting to any render where
    // !listening && transcript happen to be true.
    const prevListeningRef = useRef(false);

    useEffect(() => {
        const wasListening = prevListeningRef.current;
        prevListeningRef.current = listening;
        // Only deliver a result when listening just turned false AND we
        // captured some text during that session.
        if (wasListening && !listening && transcript) {
            onResult?.(transcript);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listening, transcript]);

    // Notify the parent whenever the mic listening state changes so the avatar
    // can switch to its "Listening" state while the user speaks.
    useEffect(() => {
        onListeningChange?.(listening);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listening]);

    const handleClick = () => {
        if (disabled) return;
        if (listening) {
            stop();
        } else {
            reset();
            start();
        }
    };

    const isDenied = status === "denied";
    const isUnavailable = !supported || status === "unavailable";

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled || isUnavailable}
                aria-label={listening ? "Stop listening" : label}
                className={`relative flex items-center justify-center gap-2.5 min-h-[56px] px-7 py-3.5 rounded-2xl font-semibold text-white shadow-lg transition-all select-none
          ${disabled || isUnavailable
                        ? "bg-slate-300 cursor-not-allowed"
                        : listening
                            ? "bg-rose-500 shadow-rose-500/30 scale-105"
                            : "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-indigo-500/30 hover:scale-[1.03] active:scale-95"}
        `}
            >
                {/* Mic icon */}
                <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>

                <span>{listening ? "Stop" : label}

                    {/* Live waveform while listening */}
                    {listening && (
                        <span className="flex items-end gap-0.5 ml-1 h-4">
                            {[0, 1, 2, 3].map((i) => (
                                <span
                                    key={i}
                                    className="w-0.5 bg-white rounded-full animate-pulse"
                                    style={{
                                        height: `${40 + (i % 2) * 60}%`,
                                        animationDelay: `${i * 0.12}s`,
                                        animationDuration: "0.6s",
                                    }}
                                />
                            ))}
                        </span>
                    )}
                </span>
            </button>

            {/* Live transcript */}
            {(listening || transcript || interim) && (
                <div className="w-full max-w-md rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
                    {listening && !transcript && !interim && (
                        <span className="text-sm text-slate-400 italic">
                            Listening… speak now
                        </span>
                    )}
                    <p className="text-sm text-slate-700">
                        <span className="text-slate-800 font-medium">{transcript}</span>
                        <span className="text-slate-400">{interim}</span>
                    </p>
                </div>
            )}

            {/* Unavailable message */}
            {isUnavailable && (
                <p className="text-xs text-amber-600 text-center max-w-xs">
                    Speech recognition isn't supported on this device. Try Chrome or
                    Edge, or use a device with a microphone.
                </p>
            )}

            {/* Permission denied — offer a retry */}
            {isDenied && (
                <div className="text-center max-w-xs">
                    <p className="text-xs text-rose-500">
                        Microphone permission denied.
                    </p>
                    <button
                        onClick={requestPermission}
                        className="mt-1.5 text-xs font-bold text-indigo-600 underline"
                    >
                        Tap to allow microphone
                    </button>
                </div>
            )}

            {/* Generic error */}
            {error && !isDenied && (
                <p className="text-xs text-rose-500 text-center">
                    {error === "not-allowed"
                        ? "Microphone permission denied. Please allow mic access."
                        : `Error: ${error}`}
                </p>
            )}
        </div>
    );
}
