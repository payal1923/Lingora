import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BadgesPanel
 * -----------
 * Displays speaking badges with LIVE PROGRESS for locked badges.
 *
 * Each badge now shows:
 *   - Locked: a progress bar (current/target), e.g. "3/7 Days", with the
 *     badge icon grayscale until unlocked.
 *   - Unlocked: full-color badge with a ✓ and a smooth scale-in animation.
 *   - On unlock: a small confetti burst + "Badge Unlocked" label + XP reward.
 *
 * @param {array} badges - [{ key, icon, name, desc, unlocked, current, target, progress, xp }]
 *
 * The unlock animation only fires for badges that transition from
 * locked -> unlocked while the panel is mounted, so returning users don't
 * see confetti for already-earned badges.
 */
export default function BadgesPanel({ badges = [] }) {
    // Snapshot of which badges were locked on first render, so we only
    // celebrate genuine unlock transitions (not pre-unlocked badges).
    // Computed once via a lazy initial state (pure — only reads the prop).
    const [initialLock] = useState(() => {
        const map = {};
        badges.forEach((b) => {
            map[b.key] = !b.unlocked;
        });
        return map;
    });
    const [justUnlocked, setJustUnlocked] = useState(null); // badge key

    useEffect(() => {
        // Detect a badge that was initially locked but is now unlocked.
        const newlyUnlocked = badges.find(
            (b) => initialLock[b.key] && b.unlocked
        );
        if (newlyUnlocked && justUnlocked !== newlyUnlocked.key) {
            // Defer the setState to a microtask to avoid a synchronous
            // setState within the effect (prevents cascading renders).
            let cancelled = false;
            Promise.resolve().then(() => {
                if (cancelled) return;
                setJustUnlocked(newlyUnlocked.key);
            });
            // Auto-clear the celebration after a few seconds.
            const t = setTimeout(() => setJustUnlocked(null), 3500);
            return () => {
                cancelled = true;
                clearTimeout(t);
            };
        }
    }, [badges, initialLock, justUnlocked]);

    const unlockedCount = useMemo(
        () => badges.filter((b) => b.unlocked).length,
        [badges]
    );

    return (
        <div className="rounded-3xl p-5 sm:p-6 bg-white/70 backdrop-blur-xl border border-white/70 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏅</span>
                    <h3 className="text-base font-extrabold text-slate-800">Speaking Badges</h3>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    {unlockedCount}/{badges.length} unlocked
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((b) => (
                    <BadgeCard
                        key={b.key}
                        badge={b}
                        isJustUnlocked={justUnlocked === b.key}
                    />
                ))}
            </div>
        </div>
    );
}

function BadgeCard({ badge, isJustUnlocked }) {
    const { icon, name, desc, unlocked, current = 0, target = 1, progress = 0, xp = 0 } = badge;
    const pct = unlocked ? 100 : Math.max(0, Math.min(100, progress));

    return (
        <motion.div
            className={`relative rounded-2xl p-3.5 text-center transition-all overflow-hidden
                ${unlocked
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-sm"
                    : "bg-slate-50 border border-slate-100"
                }`}
            // Smooth scale animation on unlock
            animate={isJustUnlocked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Unlock confetti burst */}
            <AnimatePresence>
                {isJustUnlocked && <UnlockConfetti />}
            </AnimatePresence>

            {/* Icon */}
            <div className={`text-3xl mb-1.5 ${unlocked ? "" : "grayscale opacity-70"}`}>
                {unlocked ? icon : "🔒"}
            </div>

            {/* Name */}
            <p className={`text-xs font-bold ${unlocked ? "text-amber-700" : "text-slate-500"}`}>
                {name}
            </p>

            {/* Description */}
            <p className={`text-[10px] mt-0.5 leading-snug ${unlocked ? "text-amber-600" : "text-slate-400"}`}>
                {desc}
            </p>

            {/* Progress / XP row */}
            {unlocked ? (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        ✓ Unlocked
                    </span>
                    {xp > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            +{xp} XP
                        </span>
                    )}
                </div>
            ) : (
                <div className="mt-2">
                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1">
                        {current}/{target}
                    </p>
                </div>
            )}

            {/* "Badge Unlocked" flash label */}
            <AnimatePresence>
                {isJustUnlocked && (
                    <motion.div
                        className="absolute inset-x-0 -bottom-0.5 flex justify-center"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                    >
                        <span className="text-[9px] font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 rounded-full shadow">
                            🎉 Badge Unlocked!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Deterministic pseudo-random in [0,1) from an integer seed. Pure (no
// Math.random) so it is safe to call during render per React's rules.
function seededRand(i) {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}

const CONFETTI_COLORS = ["#f59e0b", "#f97316", "#10b981", "#6366f1", "#ec4899"];

// Pre-computed confetti geometry (pure, stable across renders).
const CONFETTI_PIECES = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: (seededRand(i) - 0.5) * 120,
    delay: seededRand(i + 100) * 0.15,
    rotate: (seededRand(i + 200) - 0.5) * 220,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

/**
 * UnlockConfetti
 * A small confetti burst that plays once when a badge unlocks.
 * Uses framer-motion; pointer-events-none so it never blocks taps.
 *
 * Geometry is deterministic (seeded) so the component stays pure and
 * stable across re-renders — no Math.random / setState needed.
 */
function UnlockConfetti() {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
            {CONFETTI_PIECES.map((p) => (
                <motion.span
                    key={p.id}
                    className="absolute top-2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                    initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                    animate={{ opacity: 0, x: p.x, y: -40, rotate: p.rotate, scale: 0.4 }}
                    transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
                />
            ))}
        </div>
    );
}
