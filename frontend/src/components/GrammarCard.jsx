// GrammarCard.jsx
// Premium feedback card for grammar notes. Soft green glassmorphism surface,
// icon badge, title, and a fade/slide-in entrance.

import { useEffect } from "react";

const STYLE_ID = "lingora-feedback-styles";

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
    @keyframes lingora-feedback-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .lingora-feedback-in { animation: lingora-feedback-in 0.4s ease-out both; }
    @media (prefers-reduced-motion: reduce) {
        .lingora-feedback-in { animation: none; }
    }
    `;
    document.head.appendChild(style);
}

export default function GrammarCard({ text = "" }) {
    useEffect(() => {
        injectStyles();
    }, []);

    return (
        <div
            className="lingora-feedback-in rounded-2xl p-4
                bg-emerald-50/80 backdrop-blur-md border border-emerald-200/80
                shadow-[0_6px_20px_-10px_rgba(16,185,129,0.4)]"
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    ✅
                </span>
                <h4 className="font-semibold text-emerald-700 text-sm tracking-tight">
                    Grammar Feedback
                </h4>
            </div>
            <p className="text-slate-700 leading-7 text-sm sm:text-base">
                {text}
            </p>
        </div>
    );
}
