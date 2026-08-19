import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CelebrationOverlay
 * -------------------
 * A lightweight, self-contained celebration effect shown over the avatar
 * for ~2.5s when a lesson completes. Combines:
 *   - a soft pulsing glow ring
 *   - a gentle bounce on the avatar wrapper
 *   - a small confetti burst (pure CSS/SVG pieces, no external asset)
 *
 * It is purely decorative and pointer-events-none, so it never blocks the UI.
 *
 * @param {boolean} active - whether the celebration is playing
 */
export default function CelebrationOverlay({ active = false }) {
    // Deterministic confetti pieces so they don't reshuffle on every render.
    const pieces = useMemo(
        () =>
            Array.from({ length: 18 }).map((_, i) => ({
                id: i,
                angle: (360 / 18) * i,
                color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                delay: (i % 5) * 0.05,
                size: 6 + (i % 3) * 3,
                rotate: (i * 47) % 360,
            })),
        []
    );

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    key="celebration"
                    className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Soft pulsing glow ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.35) 0%, rgba(99,102,241,0.18) 45%, transparent 70%)",
                        }}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: [0.6, 1.15, 1], opacity: [0, 0.9, 0.5] }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />

                    {/* Confetti burst */}
                    {pieces.map((p) => (
                        <motion.span
                            key={p.id}
                            className="absolute rounded-sm"
                            style={{
                                width: p.size,
                                height: p.size * 0.5,
                                backgroundColor: p.color,
                            }}
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                rotate: p.rotate,
                            }}
                            animate={{
                                x: Math.cos((p.angle * Math.PI) / 180) * 70,
                                y: Math.sin((p.angle * Math.PI) / 180) * 70,
                                opacity: [1, 1, 0],
                                rotate: p.rotate + 180,
                            }}
                            transition={{
                                duration: 1.4,
                                delay: p.delay,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const CONFETTI_COLORS = [
    "#10b981", // emerald
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#ec4899", // pink
    "#38bdf8", // sky
    "#a78bfa", // violet
];
