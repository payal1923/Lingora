// profilePicture.js
// -----------------
// Shared profile-picture storage + pub/sub.
//
// The onboarding flow already saves the chosen picture to
// `lingora_onboarding_profile_picture` (base64 data URL or avatar id) and a
// type marker in `lingora_onboarding_profile_picture_type` ("upload"|"avatar").
//
// This module promotes that into a first-class, app-wide preference so the
// Profile page, Navbar, MobileSidebar, Dashboard, Leaderboard, Speaking and
// Lingora AI can all read the same source of truth and update instantly when
// the user changes their picture.
//
// Storage keys:
//   lingora_pref_profile_picture      -> JSON { src, type } | null
//
// On first load we migrate the legacy onboarding keys (idempotent).

const KEY = "lingora_pref_profile_picture";

const listeners = new Set();

function readRaw() {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(KEY);
        if (raw === null) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeRaw(value) {
    if (typeof window === "undefined") return;
    try {
        if (value === null) {
            window.localStorage.removeItem(KEY);
        } else {
            window.localStorage.setItem(KEY, JSON.stringify(value));
        }
    } catch {
        /* storage full / disabled */
    }
}

function emit(value) {
    [...listeners].forEach((cb) => {
        try {
            cb(value);
        } catch (err) {
            console.warn("[profilePicture] listener error:", err);
        }
    });
}

/**
 * Migrate the legacy onboarding profile-picture keys into the new
 * preference key. Runs once on module load; idempotent.
 */
function migrateLegacy() {
    if (typeof window === "undefined") return;
    if (readRaw() !== null) return; // already have a pref
    try {
        const src = window.localStorage.getItem("lingora_onboarding_profile_picture");
        const type = window.localStorage.getItem("lingora_onboarding_profile_picture_type");
        if (src) {
            writeRaw({ src, type: type || "upload" });
        }
    } catch {
        /* ignore */
    }
}

migrateLegacy();

/**
 * Get the current profile picture.
 * @returns {{ src: string|null, type: "upload"|"avatar"|null }}
 */
export function getProfilePicture() {
    return readRaw() || { src: null, type: null };
}

/**
 * Set the profile picture.
 * @param {{ src: string, type: "upload"|"avatar" } | null} pic
 */
export function setProfilePicture(pic) {
    writeRaw(pic);
    emit(pic || { src: null, type: null });
}

/**
 * Clear the profile picture (revert to default avatar / initials).
 */
export function clearProfilePicture() {
    setProfilePicture(null);
}

/**
 * Subscribe to profile-picture changes.
 * @returns {() => void} unsubscribe
 */
export function subscribeProfilePicture(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

// Cross-tab sync
if (typeof window !== "undefined") {
    window.addEventListener?.("storage", (e) => {
        if (e.key === KEY) {
            let value = null;
            if (e.newValue) {
                try {
                    value = JSON.parse(e.newValue);
                } catch {
                    value = null;
                }
            }
            emit(value || { src: null, type: null });
        }
    });
}
