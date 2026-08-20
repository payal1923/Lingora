// AITutorAvatar.jsx
// Premium AI tutor avatar card. Renders a photorealistic-style female
// English-teacher avatar inside a glassmorphism card with the tutor's name,
// an online indicator, and a set of subtle animations:
//   - idle: gentle float + breathing + blink
//   - thinking: float + amber glow + typing dots
//   - speaking: emerald glow + voice wave + mouth movement
//   - listening: sky glow + soft pulse
//
// The avatar itself is an inline SVG portrait (no external asset required)
// so it always renders, even offline. It is intentionally original artwork
// inspired by the "premium AI tutor" feeling — not a copy of any product.

import { useEffect, useMemo } from "react";
import VoiceWave from "./VoiceWave";

const STYLE_ID = "lingora-aitutor-styles";

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
    @keyframes lingora-aitutor-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
    }
    @keyframes lingora-aitutor-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.015); }
    }
    @keyframes lingora-aitutor-blink {
        0%, 92%, 100% { transform: scaleY(1); }
        96% { transform: scaleY(0.08); }
    }
    @keyframes lingora-aitutor-glow {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.06); }
    }
    @keyframes lingora-aitutor-mouth {
        0%, 100% { transform: scaleY(0.5); }
        50% { transform: scaleY(1); }
    }
    @keyframes lingora-aitutor-dot {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes lingora-aitutor-fadeup {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .lingora-aitutor-float { animation: lingora-aitutor-float 4s ease-in-out infinite; }
    .lingora-aitutor-breathe { animation: lingora-aitutor-breathe 3.6s ease-in-out infinite; }
    .lingora-aitutor-blink { animation: lingora-aitutor-blink 5.5s ease-in-out infinite; transform-origin: center; }
    .lingora-aitutor-glow { animation: lingora-aitutor-glow 2.4s ease-in-out infinite; }
    .lingora-aitutor-mouth { animation: lingora-aitutor-mouth 0.42s ease-in-out infinite; transform-origin: center; }
    .lingora-aitutor-dot { animation: lingora-aitutor-dot 1.2s ease-in-out infinite; }
    .lingora-aitutor-fadeup { animation: lingora-aitutor-fadeup 0.5s ease-out both; }
    @media (prefers-reduced-motion: reduce) {
        .lingora-aitutor-float,
        .lingora-aitutor-breathe,
        .lingora-aitutor-blink,
        .lingora-aitutor-glow,
        .lingora-aitutor-mouth,
        .lingora-aitutor-dot { animation: none; }
    }
    `;
    document.head.appendChild(style);
}

// Inline SVG portrait of a friendly, professional female English teacher.
// Soft lighting, warm smile, neutral clothing, rounded framing.
function TutorPortrait({ isSpeaking }) {
    return (
        <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            role="img"
            aria-label="Lingora AI tutor"
        >
            <defs>
                <radialGradient id="lingora-bg" cx="50%" cy="38%" r="75%">
                    <stop offset="0%" stopColor="#eef2ff" />
                    <stop offset="55%" stopColor="#e0e7ff" />
                    <stop offset="100%" stopColor="#c7d2fe" />
                </radialGradient>
                <linearGradient id="lingora-hair" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b2f2a" />
                    <stop offset="100%" stopColor="#241b18" />
                </linearGradient>
                <linearGradient id="lingora-skin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f7d7c0" />
                    <stop offset="100%" stopColor="#eec0a3" />
                </linearGradient>
                <linearGradient id="lingora-clothes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
                <radialGradient id="lingora-cheek" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f7a8b0" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#f7a8b0" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Backdrop */}
            <rect width="200" height="200" fill="url(#lingora-bg)" />

            {/* Shoulders / clothing */}
            <path
                d="M30 200 C 40 150, 70 138, 100 138 C 130 138, 160 150, 170 200 Z"
                fill="url(#lingora-clothes)"
            />
            <path
                d="M88 138 L100 152 L112 138 C 108 146, 104 150, 100 150 C 96 150, 92 146, 88 138 Z"
                fill="#e0e7ff"
                opacity="0.85"
            />

            {/* Neck */}
            <rect x="90" y="120" width="20" height="26" rx="9" fill="url(#lingora-skin)" />

            {/* Hair back */}
            <path
                d="M52 96 C 48 60, 72 36, 100 36 C 128 36, 152 60, 148 96 C 148 112, 142 124, 138 130 L 62 130 C 58 124, 52 112, 52 96 Z"
                fill="url(#lingora-hair)"
            />

            {/* Face */}
            <ellipse cx="100" cy="92" rx="34" ry="40" fill="url(#lingora-skin)" />

            {/* Cheeks */}
            <circle cx="78" cy="104" r="11" fill="url(#lingora-cheek)" />
            <circle cx="122" cy="104" r="11" fill="url(#lingora-cheek)" />

            {/* Eyebrows */}
            <path d="M74 80 q10 -6 20 0" stroke="#5b4636" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M106 80 q10 -6 20 0" stroke="#5b4636" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Eyes (blink group) */}
            <g className="lingora-aitutor-blink">
                <ellipse cx="84" cy="92" rx="5" ry="6.5" fill="#3a2a1f" />
                <ellipse cx="116" cy="92" rx="5" ry="6.5" fill="#3a2a1f" />
                <circle cx="85.5" cy="90" r="1.6" fill="#fff" />
                <circle cx="117.5" cy="90" r="1.6" fill="#fff" />
            </g>

            {/* Nose */}
            <path d="M100 96 q3 8 -2 12 q-3 2 -6 -1" stroke="#d9a98c" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Mouth (speaks when isSpeaking) */}
            {isSpeaking ? (
                <g className="lingora-aitutor-mouth">
                    <ellipse cx="100" cy="114" rx="9" ry="5" fill="#b8546a" />
                    <ellipse cx="100" cy="116" rx="6" ry="2.4" fill="#e88aa0" />
                </g>
            ) : (
                <path
                    d="M88 112 q12 10 24 0"
                    stroke="#b8546a"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                />
            )}

            {/* Hair front */}
            <path
                d="M58 78 C 60 56, 80 44, 100 44 C 120 44, 140 56, 142 78 C 134 66, 120 60, 100 60 C 80 60, 66 66, 58 78 Z"
                fill="url(#lingora-hair)"
            />
            <path
                d="M58 78 C 60 70, 70 66, 78 68 C 74 74, 70 82, 66 88 C 62 84, 58 82, 58 78 Z"
                fill="url(#lingora-hair)"
            />
            <path
                d="M142 78 C 140 70, 130 66, 122 68 C 126 74, 130 82, 134 88 C 138 84, 142 82, 142 78 Z"
                fill="url(#lingora-hair)"
            />

            {/* Earrings */}
            <circle cx="64" cy="104" r="2.4" fill="#fde68a" />
            <circle cx="136" cy="104" r="2.4" fill="#fde68a" />
        </svg>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1.5 h-5">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="lingora-aitutor-dot w-2 h-2 rounded-full bg-indigo-500"
                    style={{ animationDelay: `${i * 0.18}s` }}
                />
            ))}
        </div>
    );
}

/**
 * AITutorAvatar
 * @param {boolean} isSpeaking  - AI is currently speaking the reply
 * @param {boolean} isThinking - AI is generating the reply
 * @param {boolean} isListening- AI is listening to the user
 * @param {boolean} online      - show the online indicator
 * @param {string}  statusLabelOverride - custom status badge text (e.g. "Lesson Complete")
 * @param {string}  statusDotOverride    - custom status dot tailwind bg class (e.g. "bg-emerald-500")
 * @param {string}  glowColorOverride    - custom radial glow color (rgba string)
 *
 * The override props are optional and only used by the Speaking Course to
 * surface completion states. Existing callers (AIMessage, ThinkingAIMessage)
 * pass none of them, so their behaviour is unchanged.
 */
export default function AITutorAvatar({
    isSpeaking = false,
    isThinking = false,
    isListening = false,
    online = true,
    statusLabelOverride,
    statusDotOverride,
    glowColorOverride,
}) {
    useEffect(() => {
        injectStyles();
    }, []);

    const glowColor = glowColorOverride
        ? glowColorOverride
        : isSpeaking
            ? "rgba(16,185,129,0.45)"
            : isThinking
                ? "rgba(245,158,11,0.45)"
                : isListening
                    ? "rgba(56,189,248,0.45)"
                    : "rgba(99,102,241,0.30)";

    const statusLabel = statusLabelOverride
        ? statusLabelOverride
        : isSpeaking
            ? "Speaking"
            : isThinking
                ? "Thinking"
                : isListening
                    ? "Listening"
                    : "Online";

    const statusDot = statusDotOverride
        ? statusDotOverride
        : isSpeaking
            ? "bg-emerald-400"
            : isThinking
                ? "bg-amber-400"
                : isListening
                    ? "bg-sky-400"
                    : "bg-emerald-400";

    const animate = isSpeaking || isThinking || isListening;

    const glowStyle = useMemo(
        () => ({
            background: `radial-gradient(circle at 50% 45%, ${glowColor} 0%, transparent 70%)`,
        }),
        [glowColor]
    );

    return (
        <div className="lingora-aitutor-fadeup w-full">
            <div
                className="relative rounded-[2rem] p-5 sm:p-6 overflow-hidden
                    bg-gradient-to-br from-white/70 via-indigo-50/60 to-sky-50/50
                    backdrop-blur-xl border border-white/60
                    shadow-[0_10px_40px_-12px_rgba(49,46,129,0.35)]"
            >
                {/* Ambient glow */}
                <div
                    className={`absolute inset-0 pointer-events-none ${animate ? "lingora-aitutor-glow" : ""}`}
                    style={glowStyle}
                />

                {/* Header row: name + online */}
                <div className="relative flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-800 tracking-tight">
                            Lingora AI
                        </h3>
                        {online && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                                <span className={`w-2 h-2 rounded-full ${statusDot} animate-pulse`} />
                                <span className="text-[11px] font-medium text-emerald-700">
                                    {statusLabel}
                                </span>
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                        English Tutor
                    </span>
                </div>

                {/* Avatar */}
                <div className="relative flex flex-col items-center">
                    <div
                        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden
                            ring-1 ring-white/70 shadow-[0_8px_24px_-8px_rgba(49,46,129,0.45)]
                            ${animate ? "lingora-aitutor-float" : ""}`}
                    >
                        <div className={`absolute inset-0 ${isSpeaking || isThinking ? "lingora-aitutor-breathe" : ""}`}>
                            <TutorPortrait isSpeaking={isSpeaking} />
                        </div>

                        {/* Speaking voice wave overlay */}
                        {isSpeaking && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
                                <VoiceWave active size="xs" color="white" />
                            </div>
                        )}
                    </div>

                    {/* Typing dots while thinking */}
                    <div className="h-6 mt-3 flex items-center">
                        {isThinking && <TypingDots />}
                    </div>
                </div>
            </div>
        </div>
    );
}
