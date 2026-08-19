// VocabularyCard.jsx
// Premium feedback card for vocabulary tips. Soft blue glassmorphism surface,
// icon badge, title, and a fade/slide-in entrance.

import { useEffect } from "react";

const STYLE_ID = "lingora-feedback-styles-vocab";

function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
    @keyframes lingora-feedback-in-v {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .lingora-feedback-in-v { animation: lingora-feedback-in-v 0.4s ease-out both; }
    @media (prefers-reduced-motion: reduce) {
        .lingora-feedback-in-v { animation: none; }
    }
    `;
    document.head.appendChild(style);
}

export default function VocabularyCard({ text = "" }) {
    useEffect(() => {
        injectStyles();
    }, []);

    return (
        <div
            className="lingora-feedback-in-v rounded-2xl p-4
                bg-sky-50/80 backdrop-blur-md border border-sky-200/80
                shadow-[0_6px_20px_-10px_rgba(56,189,248,0.4)]"
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">
                    📚
                </span>
                <h4 className="font-semibold text-sky-700 text-sm tracking-tight">
                    Vocabulary Tip
                </h4>
            </div>
            <p className="text-slate-700 leading-7 text-sm sm:text-base">
                {text}
            </p>
        </div>
    );
}
