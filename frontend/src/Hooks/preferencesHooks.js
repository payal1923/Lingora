// preferencesHooks.js
// -------------------
// React bindings for the shared preferences module (preferences.js).
//
// `usePreference(name)`     — subscribe a component to one preference; it
//                             re-renders automatically when the value changes
//                             (locally or in another tab).
// `useAccentLangCode()`     — convenience: returns the BCP-47 tag for the
//                             current accent, updating live.
// `useTeachingLanguage()`   — convenience: returns the current teaching
//                             language code, updating live.
// `useProfilePicture()`     — subscribe to the profile picture (base64 or
//                             avatar id) so every surface stays in sync.

import { useCallback, useEffect, useState } from "react";
import {
    DEFAULTS,
    getPreference,
    setPreference,
    subscribe,
    getAccentLangCode,
    getTeachingLanguage,
} from "../config/preferences";
import {
    getProfilePicture,
    setProfilePicture,
    subscribeProfilePicture,
} from "./profilePicture";

/**
 * Subscribe to a single preference. Returns [value, setValue].
 * `setValue` wraps setPreference so callers don't need to import it.
 */
export function usePreference(name) {
    const [value, setValue] = useState(() => getPreference(name));

    useEffect(() => {
        // Ensure we're in sync if it changed before mount.
        setValue(getPreference(name));
        const unsub = subscribe(name, (next) => setValue(next));
        return unsub;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name]);

    const update = useCallback(
        (next) => {
            setPreference(name, next);
        },
        [name]
    );

    return [value, update];
}

/**
 * Live BCP-47 language tag for the current accent ("en-US" / "en-GB").
 * Updates instantly when the accent changes anywhere in the app.
 */
export function useAccentLangCode() {
    const [lang, setLang] = useState(() => getAccentLangCode());

    useEffect(() => {
        const unsub = subscribe("preferredAccent", () =>
            setLang(getAccentLangCode())
        );
        return unsub;
    }, []);

    return lang;
}

/**
 * Live teaching-language code ("en", "hi", ...).
 */
export function useTeachingLanguage() {
    const [code, setCode] = useState(() => getTeachingLanguage());

    useEffect(() => {
        const unsub = subscribe("teachingLanguage", (next) => setCode(next || DEFAULTS.teachingLanguage));
        return unsub;
    }, []);

    return code;
}

/**
 * Live profile picture. Returns { src, type, setSrc }.
 * `src` is a data URL (uploaded photo) or an avatar id string, or null.
 */
export function useProfilePicture() {
    const [pic, setPic] = useState(() => getProfilePicture());

    useEffect(() => {
        const unsub = subscribeProfilePicture((next) => setPic(next));
        return unsub;
    }, []);

    const update = useCallback((next) => {
        setProfilePicture(next);
    }, []);

    return { ...pic, setSrc: update };
}
