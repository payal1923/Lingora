import { useEffect, useState } from "react";

/**
 * PronunciationScore
 * ------------------
 * Animated circular score card.
 * Used to display pronunciation, fluency, accuracy, confidence,
 * speaking speed, and overall score.
 *
 * @param {string} label   - e.g. "Pronunciation"
 * @param {number} score   - 0-100
 * @param {string} size    - "sm" | "md" | "lg"
 */
export default function PronunciationScore({
    label = "Score",
    score = 0,
    size = "md",
}) {
    const [display, setDisplay] = useState(0);

    // Animate the score from 0 -> score
    useEffect(() => {
        let raf;
        const start = performance.now();
        const duration = 900;
        const to = Math.max(0, Math.min(100, Number(score) || 0));

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(to * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [score]);

    const dims =
        size === "lg"
            ? { box: "w-32 h-32", stroke: 10, font: "text-3xl", label: "text-xs" }
            : size === "sm"
                ? { box: "w-20 h-20", stroke: 6, font: "text-lg", label: "text-[10px]" }
                : { box: "w-24 h-24", stroke: 8, font: "text-2xl", label: "text-[11px]" };

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (display / 100) * circumference;

    // Color by performance
    const stroke =
        display >= 80
            ? "#10b981" // emerald
            : display >= 60
                ? "#f59e0b" // amber
                : "#f43f5e"; // rose

    const textColor =
        display >= 80
            ? "text-emerald-600"
            : display >= 60
                ? "text-amber-600"
                : "text-rose-600";

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className={`relative ${dims.box}`}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth={dims.stroke}
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        strokeWidth={dims.stroke}
                        strokeLinecap="round"
                        stroke={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 0.1s linear" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-extrabold ${dims.font} ${textColor}`}>
                        {display}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400">/ 100</span>
                </div>
            </div>
            <span className={`${dims.label} font-semibold text-slate-600`}>
                {label}
            </span>
        </div>
    );
}
