// preferences.js
// --------------
// Shared user-preferences module for Lingora.
//
// The backend `User` model has no preference columns, and the product
// requirement is to keep backend APIs unchanged. All learning preferences
// therefore live in localStorage, consistent with the existing onboarding
// pattern (`lingora_onboarding_*` keys).
//
// This module is the single source of truth for:
//   - preferredAccent      ("american" | "british")
//   - teachingLanguage     (ISO 639-1 code: "en", "hi", "mr", "de", "fr", "es", "ja")
//   - learningGoal, dailyGoal, studyTime, difficulty
//   - notifications, reminderTime, privacy
//
// It also exposes a tiny pub/sub so that when a preference changes (e.g. the
// user picks a new accent in Profile), every mounted TTS hook / audio module
// is notified instantly — no logout or app restart required.
//
// Design notes:
//   - Pure module (no React import) so it can be used from hooks, services,
//     and components alike.
//   - All keys are namespaced under `lingora_pref_*` to avoid collisions
//     with the existing `lingora_onboarding_*` keys.
//   - Reads are synchronous (localStorage); writes are synchronous + emit.
//   - A `usePreference(name)` React hook (in preferencesHooks.js) subscribes
//     a component to changes so UI re-renders automatically.

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const PREFIX = "lingora_pref_";

// Accent -> BCP-47 language tag used by SpeechSynthesis / Capacitor TTS.
export const ACCENT_LANG = {
    american: "en-US",
    british: "en-GB",
};

// Accent -> human label + flag emoji (used by Onboarding + Profile).
export const ACCENTS = [
    {
        key: "american",
        label: "American English",
        short: "American",
        flag: "🇺🇸",
        lang: "en-US",
        description: "Clear, neutral U.S. pronunciation used in most media.",
        sample: "Hello! Welcome to Lingora. Let's practice speaking together.",
    },
    {
        key: "british",
        label: "British English",
        short: "British",
        flag: "🇬🇧",
        lang: "en-GB",
        description: "Received Pronunciation with British vowel sounds.",
        sample: "Hello! Welcome to Lingora. Let's practise speaking together.",
    },
];

// Teaching languages the AI can use to explain grammar / vocabulary /
// feedback / lessons. Scalable: add a row here and it flows everywhere.
export const TEACHING_LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "Hindi", flag: "🇮🇳" },
    { code: "mr", label: "Marathi", flag: "🇮🇳" },
    { code: "de", label: "German", flag: "🇩🇪" },
    { code: "fr", label: "French", flag: "🇫🇷" },
    { code: "es", label: "Spanish", flag: "🇪🇸" },
    { code: "ja", label: "Japanese", flag: "🇯🇵" },
];

export const LEARNING_GOALS = [
    { key: "conversation", label: "Daily Conversation", icon: "💬" },
    { key: "travel", label: "Travel & Tourism", icon: "✈️" },
    { key: "business", label: "Business & Work", icon: "💼" },
    { key: "exam", label: "Exam Preparation", icon: "🎓" },
    { key: "academic", label: "Academic English", icon: "📚" },
    { key: "fluency", label: "General Fluency", icon: "🌟" },
];

export const DAILY_GOALS = [
    { key: "casual", label: "Casual", minutes: 10, xp: 20, icon: "🌱" },
    { key: "regular", label: "Regular", minutes: 20, xp: 40, icon: "⚡" },
    { key: "serious", label: "Serious", minutes: 30, xp: 60, icon: "🔥" },
    { key: "intense", label: "Intense", minutes: 45, xp: 90, icon: "🚀" },
];

export const STUDY_TIMES = [
    { key: "morning", label: "Morning", icon: "🌅", hint: "6 AM – 10 AM" },
    { key: "afternoon", label: "Afternoon", icon: "☀️", hint: "10 AM – 2 PM" },
    { key: "evening", label: "Evening", icon: "🌆", hint: "2 PM – 6 PM" },
    { key: "night", label: "Night", icon: "🌙", hint: "6 PM – 10 PM" },
    { key: "flexible", label: "Flexible", icon: "🔄", hint: "Anytime" },
];

export const DIFFICULTIES = [
    { key: "beginner", label: "Beginner", icon: "🟢" },
    { key: "intermediate", label: "Intermediate", icon: "🟡" },
    { key: "advanced", label: "Advanced", icon: "🔴" },
];

// Default preference values. Used when nothing is stored yet.
export const DEFAULTS = {
    preferredAccent: "american",
    teachingLanguage: "en",
    learningGoal: "conversation",
    dailyGoal: "regular",
    studyTime: "flexible",
    difficulty: "beginner",
    notifications: true,
    reminderTime: "20:00",
    privacy: "friends",
};

/* ------------------------------------------------------------------ */
/* Storage helpers                                                    */
/* ------------------------------------------------------------------ */

function keyFor(name) {
    return `${PREFIX}${name}`;
}

function readRaw(name) {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(keyFor(name));
    } catch {
        return null;
    }
}

function writeRaw(name, value) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(keyFor(name), value);
    } catch {
        /* storage full / disabled — ignore */
    }
}

function removeRaw(name) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(keyFor(name));
    } catch {
        /* noop */
    }
}

/* ------------------------------------------------------------------ */
/* Typed getters / setters                                            */
/* ------------------------------------------------------------------ */

/**
 * Get a preference value (parsed), falling back to DEFAULTS.
 */
export function getPreference(name) {
    const raw = readRaw(name);
    if (raw === null || raw === undefined) {
        return DEFAULTS[name] ?? null;
    }
    try {
        return JSON.parse(raw);
    } catch {
        // Stored as a plain string (legacy / non-JSON) — return as-is.
        return raw;
    }
}

/**
 * Set a preference value (stored as JSON) and emit a change event.
 */
export function setPreference(name, value) {
    writeRaw(name, JSON.stringify(value));
    emit(name, value);
}

/**
 * Remove a preference (revert to default).
 */
export function clearPreference(name) {
    removeRaw(name);
    emit(name, DEFAULTS[name] ?? null);
}

/* ------------------------------------------------------------------ */
/* Accent-specific helpers (the most-used path)                      */
/* ------------------------------------------------------------------ */

/**
 * Returns the BCP-47 language tag for the user's preferred accent.
 * e.g. "american" -> "en-US", "british" -> "en-GB".
 * Falls back to "en-US" for unknown accents.
 */
export function getAccentLangCode() {
    const accent = getPreference("preferredAccent");
    return ACCENT_LANG[accent] || "en-US";
}

/**
 * Returns the accent object (label, flag, lang, sample) for the current
 * preference, or the American default.
 */
export function getCurrentAccent() {
    const accent = getPreference("preferredAccent");
    return ACCENTS.find((a) => a.key === accent) || ACCENTS[0];
}

/**
 * Set the preferred accent and notify all subscribers (TTS hooks, etc.).
 */
export function setPreferredAccent(accentKey) {
    setPreference("preferredAccent", accentKey);
}

/**
 * Returns the teaching-language code (e.g. "en", "hi").
 */
export function getTeachingLanguage() {
    return getPreference("teachingLanguage");
}

/**
 * Returns the teaching-language object (code, label, flag).
 */
export function getCurrentTeachingLanguage() {
    const code = getTeachingLanguage();
    return TEACHING_LANGUAGES.find((l) => l.code === code) || TEACHING_LANGUAGES[0];
}

/* ------------------------------------------------------------------ */
/* Pub/sub — instant propagation without restart                      */
/* ------------------------------------------------------------------ */

const listeners = new Map(); // name -> Set<callback>

/**
 * Subscribe to changes for a given preference name.
 * Returns an unsubscribe function.
 */
export function subscribe(name, callback) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(callback);
    return () => {
        const set = listeners.get(name);
        if (set) {
            set.delete(callback);
            if (set.size === 0) listeners.delete(name);
        }
    };
}

function emit(name, value) {
    const set = listeners.get(name);
    if (!set) return;
    // Clone to avoid mutation-during-iteration issues.
    [...set].forEach((cb) => {
        try {
            cb(value);
        } catch (err) {
            console.warn(`[preferences] listener error for "${name}":`, err);
        }
    });
}

/**
 * Cross-tab sync: when another tab changes a preference, emit locally so
 * hooks in this tab update too. Uses the `storage` event.
 */
if (typeof window !== "undefined") {
    window.addEventListener?.("storage", (e) => {
        if (!e.key || !e.key.startsWith(PREFIX)) return;
        const name = e.key.slice(PREFIX.length);
        let value;
        if (e.newValue === null) {
            value = DEFAULTS[name] ?? null;
        } else {
            try {
                value = JSON.parse(e.newValue);
            } catch {
                value = e.newValue;
            }
        }
        emit(name, value);
    });
}

/* ------------------------------------------------------------------ */
/* Bulk helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Read all preferences at once (used by Profile to populate forms).
 */
export function getAllPreferences() {
    const result = {};
    Object.keys(DEFAULTS).forEach((name) => {
        result[name] = getPreference(name);
    });
    return result;
}

/**
 * Apply a batch of preferences (used by onboarding completion + Profile save).
 * Emits one event per changed key.
 */
export function setManyPreferences(partial) {
    Object.entries(partial).forEach(([name, value]) => {
        if (name in DEFAULTS) {
            setPreference(name, value);
        }
    });
}

/**
 * Migrate the legacy onboarding accent key
 * (`lingora_onboarding_english_preference`) into the new preferences module
 * the first time the app loads. Idempotent.
 */
export function migrateLegacyAccent() {
    const existing = readRaw("preferredAccent");
    if (existing !== null) return; // already migrated
    try {
        const legacy = window.localStorage.getItem("lingora_onboarding_english_preference");
        if (legacy) {
            const parsed = JSON.parse(legacy);
            const accent = parsed?.accent || parsed?.preference || parsed;
            if (typeof accent === "string" && ACCENT_LANG[accent]) {
                setPreference("preferredAccent", accent);
            }
        }
    } catch {
        /* ignore malformed legacy data */
    }
}
