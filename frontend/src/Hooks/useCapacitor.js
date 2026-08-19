import { useState } from "react";

/**
 * useCapacitor
 * ------------
 * Detects whether the app is running inside a native Capacitor WebView
 * (Android/iOS) vs. a regular browser. Used to switch between native
 * plugins (@capacitor-community/*) and browser Web APIs.
 *
 * Returns:
 *   isNative  - true when running inside a Capacitor native shell
 *   platform  - "android" | "ios" | "web"
 *   ready     - false until the detection has settled (avoids hydration flicker)
 *
 * This is safe to call many times — the underlying Capacitor singleton
 * is cached, so repeated calls are cheap.
 */
export function getCapacitor() {
    if (typeof window === "undefined") return null;
    // Capacitor v6+ exposes the global `Capacitor` object.
    return window.Capacitor || null;
}

export function isNativePlatform() {
    const cap = getCapacitor();
    if (!cap) return false;
    // getPlatform() returns "android" | "ios" | "web"
    return cap.getPlatform && cap.getPlatform() !== "web";
}

export function nativePlatform() {
    const cap = getCapacitor();
    if (!cap || !cap.getPlatform) return "web";
    return cap.getPlatform(); // "android" | "ios" | "web"
}

// Compute the platform synchronously via a lazy initial state so we never
// need a setState-in-effect (which would trigger cascading renders). The
// Capacitor global is available immediately on native shells, so this is
// safe to read during initial render.
function detectPlatform() {
    const cap = getCapacitor();
    const platform = cap && cap.getPlatform ? cap.getPlatform() : "web";
    return {
        isNative: platform !== "web",
        platform,
        ready: true,
    };
}

export default function useCapacitor() {
    const [state] = useState(detectPlatform);
    return state;
}
