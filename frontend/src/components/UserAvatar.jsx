// UserAvatar.jsx
// --------------
// Single, reusable user-avatar component used everywhere a profile picture
// appears: Navbar, MobileSidebar, Dashboard hero, Profile, Leaderboard,
// Speaking, Lingora AI.
//
// Resolution order:
//   1. If a `src` prop is passed explicitly, use it (e.g. leaderboard rows
//      that carry their own picture).
//   2. Otherwise read the shared profile-picture preference (uploaded photo
//      or avatar id) and render it.
//   3. Otherwise fall back to initials derived from `name`.
//
// Sizes: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
// The component is touch-target friendly (min 40px on Android) and uses
// safe-area-aware rounded corners.

import { memo } from "react";
import { useProfilePicture } from "../Hooks/preferencesHooks";

const SIZE_CLASSES = {
    xs: "h-7 w-7 text-xs min-h-[28px] min-w-[28px]",
    sm: "h-9 w-9 text-sm min-h-[36px] min-w-[36px]",
    md: "h-11 w-11 text-base min-h-[44px] min-w-[44px]",
    lg: "h-16 w-16 text-xl min-h-[64px] min-w-[64px]",
    xl: "h-20 w-20 text-2xl min-h-[80px] min-w-[80px]",
    "2xl": "h-28 w-28 text-3xl min-h-[112px] min-w-[112px]",
};

const AVATAR_GRADIENTS = [
    "from-indigo-500 to-purple-500",
    "from-rose-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-sky-500 to-blue-600",
    "from-amber-500 to-yellow-500",
    "from-fuchsia-500 to-pink-500",
];

function getInitials(name) {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function gradientForName(name) {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/**
 * @param {object} props
 * @param {string} [props.name]      User's display name (for initials fallback).
 * @param {string} [props.src]       Optional explicit picture (overrides pref).
 * @param {string} [props.size]      One of SIZE_CLASSES keys. Default "md".
 * @param {string} [props.className] Extra classes (e.g. ring, border).
 * @param {boolean} [props.ring]    Add a subtle ring (used in headers).
 */
function UserAvatar({ name, src, size = "md", className = "", ring = false }) {
    const { src: prefSrc } = useProfilePicture();
    const finalSrc = src || prefSrc;
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const ringClass = ring ? "ring-2 ring-white/70 dark:ring-white/10" : "";
    const baseClass =
        "inline-flex items-center justify-center rounded-full overflow-hidden select-none shrink-0 bg-gradient-to-br " +
        gradientForName(name) +
        " text-white font-semibold " +
        sizeClass +
        " " +
        ringClass +
        " " +
        className;

    if (finalSrc) {
        // Avatar ids (non-data-URL) are rendered as emoji-ish text; uploaded
        // photos are data URLs. We only render an <img> for data URLs / URLs.
        if (/^(data:|https?:|blob:)/i.test(finalSrc)) {
            return (
                <span className={baseClass} aria-label={name ? `Avatar for ${name}` : "User avatar"}>
                    <img
                        src={finalSrc}
                        alt={name ? `Avatar for ${name}` : "User avatar"}
                        className="h-full w-full object-cover"
                        draggable={false}
                    />
                </span>
            );
        }
        // Avatar id (e.g. an emoji or short code) — render as text.
        return (
            <span className={baseClass} aria-label={name ? `Avatar for ${name}` : "User avatar"}>
                <span className="leading-none">{finalSrc}</span>
            </span>
        );
    }

    return (
        <span className={baseClass} aria-label={name ? `Avatar for ${name}` : "User avatar"}>
            {getInitials(name)}
        </span>
    );
}

export default memo(UserAvatar);
