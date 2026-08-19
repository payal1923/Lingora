// AIBubble.jsx
// Premium rounded chat bubble for AI replies. Soft shadow, adaptive width
// (max 75%), and a smooth fade-in + slide-up entrance animation.

import { useEffect } from "react";

const STYLE_ID = "lingora-aibubble-styles";

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
    @keyframes lingora-aibubble-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .lingora-aibubble-in { animation: lingora-aibubble-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
    @media (prefers-reduced-motion: reduce) {
        .lingora-aibubble-in { animation: none; }
    }
    `;
    document.head.appendChild(style);
}

export default function AIBubble({ message = "" }) {
    useEffect(() => {
        injectStyles();
    }, []);

    return (
        <div className="lingora-aibubble-in w-full flex justify-start">
            <div
                className="max-w-[75%] px-5 py-4 sm:px-6 sm:py-5 rounded-3xl rounded-tl-md
                    bg-white/90 backdrop-blur-md text-slate-800 typo-body whitespace-pre-line
                    border border-white/70
                    shadow-[0_8px_30px_-10px_rgba(49,46,129,0.25)]"
            >
                {message}
            </div>
        </div>
    );
}
