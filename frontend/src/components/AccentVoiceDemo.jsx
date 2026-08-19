// AccentVoiceDemo.jsx
// --------------------
// Reusable voice-demo button used on the Onboarding English Accent page and
// the Profile Preferred Accent setting.
//
// Features:
//   - Play / Stop a short sample sentence.
//   - Loading state while voice initializes.
//   - Retry state when voice is unavailable.
//   - Uses the shared speechService singleton.

import { useCallback, useEffect, useRef, useState } from "react";
import { tts } from "../services/speechService";

const STATUS = {
    IDLE: "idle",
    LOADING: "loading",
    PLAYING: "playing",
    UNAVAILABLE: "unavailable",
};

export default function AccentVoiceDemo({
    accent,
    active = false,
    size = "md",
}) {
    const [status, setStatus] = useState(STATUS.IDLE);

    const cancelledRef = useRef(false);

    const lang = accent?.lang || "en-US";
    const sample = accent?.sample || "Hello! Welcome to Lingora.";

    // Cleanup when component unmounts
    useEffect(() => {
        cancelledRef.current = false;

        return () => {
            cancelledRef.current = true;
            void tts.stop();
        };
    }, []);

    const handlePlay = useCallback(async () => {
        // Stop if already speaking
        if (status === STATUS.PLAYING) {
            await tts.stop();
            setStatus(STATUS.IDLE);
            return;
        }

        cancelledRef.current = false;

        setStatus(STATUS.LOADING);

        try {
            setStatus(STATUS.PLAYING);

            await tts.speak(sample, {
                lang,
                rate: 0.92,
                pitch: 1,

                onEnd: () => {
                    if (cancelledRef.current) return;

                    setStatus(STATUS.IDLE);
                },
            });
        } catch (err) {
            console.warn("AccentVoiceDemo speak error:", err);

            if (!cancelledRef.current) {
                setStatus(STATUS.UNAVAILABLE);
            }
        }
    }, [status, sample, lang]);

    const handleRetry = useCallback(async () => {
        await tts.stop();

        setStatus(STATUS.IDLE);

        await tts.retry();
    }, []);

    const isPlaying = status === STATUS.PLAYING;
    const isLoading = status === STATUS.LOADING;
    const isUnavailable = status === STATUS.UNAVAILABLE;

    const sizeClasses =
        size === "sm"
            ? "h-9 min-h-[36px] px-3 text-xs gap-1.5"
            : "h-11 min-h-[44px] px-4 text-sm gap-2";

    const baseClasses =
        "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 select-none touch-manipulation " +
        sizeClasses;

    if (isUnavailable) {
        return (
            <button
                type="button"
                onClick={handleRetry}
                className={`${baseClasses} bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer`}
                aria-label={`Voice unavailable for ${accent?.label}. Tap to retry.`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348a4 4 0 0 0-5.378-1.66l-.001.001a4 4 0 0 0-1.66 5.379M7.977 14.652a4 4 0 0 0 5.378 1.66l.001-.001a4 4 0 0 0 1.66-5.379M3 12a9 9 0 1 1 18 0M3 12a9 9 0 0 0 18 0"
                    />
                </svg>

                Retry
            </button>
        );
    }

    return (<button
        type="button"
        onClick={handlePlay}
        disabled={isLoading}
        className={`${baseClasses} ${isPlaying
            ? "bg-blue-600 text-white shadow-sm"
            : active
                ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
            } ${isLoading ? "cursor-wait opacity-80" : "cursor-pointer"}`}
        aria-label={
            isPlaying
                ? `Stop ${accent?.label} demo`
                : `Play ${accent?.label} voice demo`
        }
    >
        {isLoading ? (
            <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>
        ) : isPlaying ? (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
            >
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
        ) : (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
            >
                <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
            </svg>
        )}

        <span>
            {isLoading
                ? "Loading..."
                : isPlaying
                    ? "Stop"
                    : "Play Demo"}
        </span>
    </button>
    );
}