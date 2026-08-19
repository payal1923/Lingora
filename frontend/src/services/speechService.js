// speechService.js
// -----------------
// Lingora's single, reusable, platform-aware speech service.
//
// This module is the ONE place that knows how to do Text-to-Speech (TTS) and
// Speech Recognition (STT) on both the Web (browser APIs) and Android
// (Capacitor native plugins). Every hook and component in the app delegates
// to the singleton instances exported here (`tts` and `sr`), so voice
// playback and speech recognition work reliably on both platforms with a
// single, consistent implementation.
//
// Design goals (from the voice-fix brief):
//   1. Auto-detect the platform: Web -> browser APIs; Android -> native
//      Capacitor plugins (lazy-loaded so the web bundle stays clean).
//   2. Never get stuck on "Preparing voice…": every init is raced against a
//      timeout; if the native plugin is slow/fails we fall back to the web
//      API, and only mark "unavailable" when truly nothing works.
//   3. Handle microphone permissions, unavailable voices, loading states and
//      errors with a meaningful retry path.
//   4. Keep the backend and UI unchanged — consumers keep their existing
//      hook APIs; this service just powers them.
//
// Public API:
//   tts.speak(text, opts?)   -> Promise<void>   opts: { rate, pitch, lang, onEnd }
//   tts.speakSlow(text, opts?)
//   tts.replay()
//   tts.stop()
//   tts.retry()
//   tts.status               -> "ready" | "loading" | "unavailable"
//   tts.speaking             -> boolean
//   tts.supported            -> boolean
//   tts.voices               -> array
//   tts.onStatusChange(cb)   -> unsubscribe
//   tts.onSpeakingChange(cb) -> unsubscribe
//   tts.onVoicesChange(cb)   -> unsubscribe
//
//   sr.start(opts?)          -> Promise<void>   opts: { lang }
//   sr.stop()
//   sr.reset()
//   sr.requestPermission()   -> Promise<boolean>
//   sr.setLang(lang)
//   sr.status               -> "ready" | "loading" | "unavailable" | "denied"
//   sr.listening             -> boolean
//   sr.supported            -> boolean
//   sr.transcript            -> string
//   sr.interim               -> string
//   sr.error                 -> string | null
//   sr.onStatusChange(cb)    -> unsubscribe
//   sr.onListeningChange(cb) -> unsubscribe
//   sr.onTranscriptChange(cb)-> unsubscribe
//   sr.onInterimChange(cb)   -> unsubscribe
//   sr.onErrorChange(cb)     -> unsubscribe

import { isNativePlatform } from "../Hooks/useCapacitor";
import { getAccentLangCode, subscribe } from "../config/preferences";
import { TextToSpeech as NativeTTSPlugin } from "@capacitor-community/text-to-speech";

// ---------------------------------------------------------------------------
// Status constants
// ---------------------------------------------------------------------------
export const TTS_STATUS = {
    READY: "ready",
    LOADING: "loading",
    UNAVAILABLE: "unavailable",
};

export const SR_STATUS = {
    READY: "ready",
    LOADING: "loading",
    UNAVAILABLE: "unavailable",
    DENIED: "denied",
};

// Max time (ms) we wait for the native plugin / web voices to initialise
// before optimistically falling back. This guarantees the UI never stays on
// "Preparing voice…" forever.
const INIT_TIMEOUT_MS = 8000;

// ---------------------------------------------------------------------------
// Native plugin accessors (shared singletons across the whole app).
// The Capacitor plugin is imported statically: registerPlugin() returns a
// thin proxy whose native/web implementation is only loaded when a method is
// actually invoked, so the web bundle stays free of native code. A static
// import is more reliable than a dynamic one (no race with Vite code-splitting)
// and guarantees the proxy exists before init() runs.
// ---------------------------------------------------------------------------
let _nativeTTS = null;
function loadNativeTTS() {
    if (_nativeTTS) return _nativeTTS;
    _nativeTTS = NativeTTSPlugin;
    return _nativeTTS;
}

let _nativeSR = null;
let _nativeSRLoadPromise = null;
async function loadNativeSR() {
    if (_nativeSR) return _nativeSR;
    if (_nativeSRLoadPromise) return _nativeSRLoadPromise;
    _nativeSRLoadPromise = (async () => {
        try {
            const mod = await import("@capacitor-community/speech-recognition");
            _nativeSR = mod.SpeechRecognition || (mod.default && mod.default.SpeechRecognition);
            return _nativeSR;
        } catch (err) {
            console.warn("[speechService] Capacitor SpeechRecognition plugin unavailable:", err);
            _nativeSR = null;
            return null;
        } finally {
            _nativeSRLoadPromise = null;
        }
    })();
    return _nativeSRLoadPromise;
}

// ---------------------------------------------------------------------------
// Small pub/sub helper
// ---------------------------------------------------------------------------
function createPubSub() {
    const listeners = new Set();
    return {
        add(cb) {
            listeners.add(cb);
            return () => listeners.delete(cb);
        },
        emit(value) {
            listeners.forEach((cb) => cb(value));
        },
        size() {
            return listeners.size;
        },
    };
}

// ---------------------------------------------------------------------------
// normalizeText
// ---------------------------------------------------------------------------
// Speech-recognition results can arrive in several shapes depending on the
// platform / plugin version:
//   - a plain string            ("hello")
//   - an array of strings       (["hello", "hi"])            (Capacitor matches)
//   - an array of {transcript}  ([{ transcript: "hello" }]) (web alt results)
//   - an object with .matches/.results arrays
//   - null/undefined/number
// This helper ALWAYS returns a trimmed string, so callers can safely call
// `.trim()`, render it as a React child, and pass it to the backend without
// "transcript.trim is not a function" or "Functions are not valid as a React
// child" runtime errors.
function normalizeText(value) {
    if (value == null) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) {
        return value
            .map((item) =>
                typeof item === "string"
                    ? item
                    : item && typeof item === "object" && "transcript" in item
                        ? String(item.transcript)
                        : String(item ?? "")
            )
            .filter(Boolean)
            .join(" ")
            .trim();
    }
    if (typeof value === "object") {
        // Capacitor event objects: prefer matches/results/transcript fields.
        const inner =
            value.matches ?? value.results ?? value.transcript ?? value.text ?? "";
        return normalizeText(inner);
    }
    if (typeof value === "function") return "";
    return String(value).trim();
}

// ===========================================================================
// TTSEngine — Text-to-Speech (singleton)
// ===========================================================================
class TTSEngine {
    constructor() {
        this._status = TTS_STATUS.LOADING;
        this._speaking = false;
        this._supported = false;
        this._voices = [];

        this._native = null;
        this._webVoice = null;
        this._accentLang = getAccentLangCode();

        this._lastText = "";
        this._lastOpts = {};
        this._cancelled = false;

        this._initStarted = false;
        this._initPromise = null;

        // Pub/sub channels
        this._statusPub = createPubSub();
        this._speakingPub = createPubSub();
        this._voicesPub = createPubSub();

        // Set up long-lived listeners once (accent changes + web voice list).
        this._setupListeners();
    }

    _setupListeners() {
        // Live accent changes — re-pick the web voice for the new accent.
        this._unsubAccent = subscribe("preferredAccent", () => {
            this._accentLang = getAccentLangCode();
            this._webVoice = this.pickWebVoice();
        });

        // Web: voices load asynchronously in some browsers.
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const onVoicesChanged = () => {
                this._webVoice = this.pickWebVoice();
                this._voices = window.speechSynthesis.getVoices?.() || [];
                this._voicesPub.emit(this._voices);
                if (this._status === TTS_STATUS.LOADING) this._setStatus(TTS_STATUS.READY);
            };
            try {
                window.speechSynthesis.addEventListener?.("voiceschanged", onVoicesChanged);
            } catch { /* noop */ }
            // Nudge some browsers to populate voices.
            window.speechSynthesis.getVoices?.();
        }
    }

    // ---- pub/sub accessors ----
    onStatusChange(cb) {
        return this._statusPub.add(cb);
    }
    onSpeakingChange(cb) {
        return this._speakingPub.add(cb);
    }
    onVoicesChange(cb) {
        return this._voicesPub.add(cb);
    }

    // ---- useSyncExternalStore adapters ----
    // Each returns a stable subscribe + snapshot pair so React hooks can read
    // the engine state without setState-in-effect (avoids cascading renders
    // and the "stuck on loading" race between first render and effect attach).
    subscribeStatus = (cb) => this._statusPub.add(cb);
    subscribeSpeaking = (cb) => this._speakingPub.add(cb);
    subscribeVoices = (cb) => this._voicesPub.add(cb);
    getSnapshotStatus = () => this._status;
    getSnapshotSpeaking = () => this._speaking;
    getSnapshotSupported = () => this._supported;
    getSnapshotVoices = () => this._voices;

    // ---- reactive getters ----
    get status() { return this._status; }
    get speaking() { return this._speaking; }
    get supported() { return this._supported; }
    get voices() { return this._voices; }

    // ---- internal setters (emit on change) ----
    _setStatus(s) {
        if (this._status === s) return;
        this._status = s;
        this._statusPub.emit(s);
    }
    _setSpeaking(v) {
        if (this._speaking === v) return;
        this._speaking = v;
        this._speakingPub.emit(v);
    }
    _setVoices(v) {
        this._voices = v;
        this._voicesPub.emit(v);
    }

    // ---- web voice selection ----
    pickWebVoice() {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
        const list = window.speechSynthesis.getVoices?.() || [];
        if (list.length === 0) return null;
        const lang = this._accentLang;
        const langRegex = new RegExp(lang.replace("-", "[-_]?"), "i");
        const femaleNames = [
            "zira",
            "hazel",
            "samantha",
            "aria",
            "jenny",
            "libby",
            "sonia",
            "serena",
            "female"
        ];

        const preferred =
            list.find(v =>
                langRegex.test(v.lang) &&
                femaleNames.some(name =>
                    v.name.toLowerCase().includes(name)
                )
            ) ||
            list.find(v => langRegex.test(v.lang)) ||
            list.find(v => /^en/i.test(v.lang));
        return preferred || null;
    }

    // ---- initialisation (raced against a timeout) ----
    // Returns a shared promise so multiple callers can await readiness
    // without triggering duplicate init runs.
    init() {
        if (this._initPromise) return this._initPromise;
        this._initStarted = true;
        this._initPromise = this._doInitWithTimeout();
        return this._initPromise;
    }

    // Await readiness (used by speak() to avoid racing init).
    async ready() {
        if (this._initPromise) await this._initPromise;
    }

    async _doInitWithTimeout() {
        await Promise.race([
            this._doInit(),
            new Promise((resolve) => setTimeout(resolve, INIT_TIMEOUT_MS)),
        ]);
        // If still loading after the timeout, fall back gracefully so the
        // UI never stays on "Preparing voice…".
        if (this._status === TTS_STATUS.LOADING) {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                this._supported = true;
                this._webVoice = this.pickWebVoice();
                this._setStatus(TTS_STATUS.READY);
            } else {
                this._supported = false;
                this._setStatus(TTS_STATUS.UNAVAILABLE);
            }
        }
    }

    async _doInit() {
        if (isNativePlatform()) {
            const TTS = loadNativeTTS();
            if (TTS) {
                this._native = TTS;
                // The Android TTS engine initialises asynchronously: the native
                // plugin constructs android.speech.tts.TextToSpeech in load()
                // and only becomes "available" once onInit(SUCCESS) fires.
                // Until then speak() rejects with "Not yet initialized...". The
                // JS init() must therefore block until the engine is truly ready,
                // otherwise the first user tap races the engine and silently
                // fails. _waitForNativeEngineReady() polls getSupportedVoices()
                // (which rejects until onInit(SUCCESS)) so init() only resolves
                // once the engine can actually speak.
                await this._waitForNativeEngineReady(TTS);
                this._supported = true;
                this._setStatus(TTS_STATUS.READY);
                return;
            }
            // Native plugin failed to load — fall through to web fallback.
        }

        // Web path
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            this._supported = false;
            this._setStatus(TTS_STATUS.UNAVAILABLE);
            return;
        }
        this._supported = true;
        this._webVoice = this.pickWebVoice();
        this._setVoices(window.speechSynthesis.getVoices?.() || []);
        this._setStatus(TTS_STATUS.READY);
    }

    // Poll the native TTS engine until it reports ready (onInit(SUCCESS) has
    // fired). getSupportedVoices() rejects until the engine is initialised, so
    // a successful resolve is a reliable readiness signal. Bounded so init()
    // can never hang forever (the outer _doInitWithTimeout also caps this).
    async _waitForNativeEngineReady(TTS, attempts = 20, delayMs = 250) {
        for (let i = 0; i < attempts; i++) {
            if (this._cancelled) return false;
            try {
                const res = await TTS.getSupportedVoices();
                this._setVoices((res && res.voices) || []);
                return true;
            } catch {
                // Engine not yet initialised (onInit hasn't fired) or voices
                // unavailable yet — wait and retry. Bounded by `attempts`.
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
        return false;
    }

    // ---- web speak helper ----
    _speakWeb(text, opts, onEnd) {
        try {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = opts.lang || this._accentLang;
            utterance.rate = opts.rate ?? 0.95;
            utterance.pitch = opts.pitch ?? 1;
            const voices = window.speechSynthesis.getVoices();

            const requestedLang = opts.lang || this._accentLang;

            const femaleNames = [
                "zira",
                "hazel",
                "samantha",
                "aria",
                "jenny",
                "libby",
                "sonia",
                "serena",
                "female"
            ];

            const voice =
                voices.find(v =>
                    v.lang === requestedLang &&
                    femaleNames.some(name =>
                        v.name.toLowerCase().includes(name)
                    )
                ) ||
                voices.find(v => v.lang === requestedLang) ||
                voices.find(v => v.lang.startsWith(requestedLang.split("-")[0]));
            if (voice) {
                utterance.voice = voice;
            }

            utterance.lang = requestedLang;
            utterance.onstart = () => this._setSpeaking(true);
            utterance.onend = () => onEnd();
            utterance.onerror = () => onEnd();
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn("[speechService] Web TTS error:", err);
            this._setSpeaking(false);
            onEnd();
        }
    }

    // ---- native speak with init-wait retry ----
    // The Android TTS engine initialises asynchronously: the native plugin
    // constructs android.speech.tts.TextToSpeech in its load() and only
    // becomes "available" once onInit(status) fires. Until then speak()
    // rejects with "Not yet initialized or not available on this device".
    // The JS init() only awaits the plugin proxy load, not the native
    // engine, so the very first user tap can land before the engine is
    // ready. We retry a few times with short delays so that first tap still
    // plays once the engine finishes warming up — instead of silently
    // failing (the previous code fell back to window.speechSynthesis, which
    // exists on the Android WebView but produces no audio, hence "Play Demo
    // does nothing" with no visible error).
    async _speakNativeWithRetry(TTS, options, attempts = 8, delayMs = 300) {
        let lastErr = null;
        for (let i = 0; i < attempts; i++) {
            // Respect a stop() issued while we were waiting for the engine.
            if (this._cancelled) return;
            try {
                await TTS.speak(options);
                return;
            } catch (err) {
                lastErr = err;
                const msg = String((err && err.message) || err || "");
                const notReady = /not yet initialized|not available|unavailable/i.test(msg);
                if (!notReady) throw err; // genuine error — don't retry
                // Engine still warming up — wait and retry.
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
        throw lastErr;
    }

    // ---- speak ----
    async speak(text, opts = {}) {

        if (!text) return;
        this._lastText = text;
        this._lastOpts = opts;
        this._cancelled = false;

        const onEnd = () => {
            if (this._cancelled) {
                this._cancelled = false;
                return;
            }

            this._setSpeaking(false);
            this._cancelled = false;
            opts.onEnd?.();
        };

        // Ensure the engine has finished initialising so we never race the
        // native plugin load or the web voice population. This is bounded by
        // the init timeout, so it can never hang forever.
        await this.init();
        await this.ready();

        // Native path
        if (isNativePlatform() && this._native) {
            const TTS = this._native;
            this._setSpeaking(true);
            try {
                await this._speakNativeWithRetry(TTS, {
                    text,
                    lang: opts.lang || this._accentLang,
                    rate: opts.rate ?? 0.95,
                    pitch: opts.pitch ?? 1.0,
                });
                onEnd();
            } catch (err) {
                console.error("Native TTS Error:", err);
                // Do NOT fall back to window.speechSynthesis here: on the
                // Android WebView that API is present but non-functional
                // (it produces no audio), which is exactly the silent
                // "Play Demo does nothing" failure. The native plugin is
                // loaded, so just fire onEnd so the caller's "speaking"
                // state never gets stuck.
                onEnd();
            }
            return;
        }

        // Web path
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            // No TTS available at all — fire onEnd so the caller's UI never
            // stays in a "speaking" state forever.
            onEnd();
            return;
        }
        this._speakWeb(text, opts, onEnd);
    }

    speakSlow(text, opts = {}) {
        return this.speak(text, { ...opts, rate: 0.55 });
    }

    replay() {
        if (this._lastText) {
            return this.speak(this._lastText, this._lastOpts);
        }
    }

    async stop() {
        this._cancelled = true;

        if (isNativePlatform() && this._native) {
            try {
                await this._native.stop?.();
            } catch (e) {
                console.warn(e);
            }
        }

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
                window.speechSynthesis.cancel();
            } catch {
                /* ignore — web speechSynthesis may be unavailable */
            }
        }

        this._setSpeaking(false);

        this._cancelled = false;
    }

    async retry() {
        await this.stop();

        this._native = null;
        this._webVoice = null;

        this._initStarted = false;
        this._initPromise = null;

        this._supported = false;
        this._setStatus(TTS_STATUS.LOADING);

        await this.init();
    }
}

// ===========================================================================
// SREngine — Speech Recognition (singleton)
// ===========================================================================
class SREngine {
    constructor() {
        this._status = SR_STATUS.LOADING;
        this._listening = false;
        this._supported = false;
        this._transcript = "";
        this._interim = "";
        this._error = null;

        this._lang = "en-US";
        this._native = null;
        this._webRec = null;
        this._manualStop = false;
        this._nativeListening = false;
        this._lastPartial = "";
        this._lastFinal = "";
        this._initStarted = false;
        this._initPromise = null;

        // Pub/sub channels
        this._statusPub = createPubSub();
        this._listeningPub = createPubSub();
        this._transcriptPub = createPubSub();
        this._interimPub = createPubSub();
        this._errorPub = createPubSub();
    }

    // ---- pub/sub accessors ----
    onStatusChange(cb) { return this._statusPub.add(cb); }
    onListeningChange(cb) { return this._listeningPub.add(cb); }
    onTranscriptChange(cb) { return this._transcriptPub.add(cb); }
    onInterimChange(cb) { return this._interimPub.add(cb); }
    onErrorChange(cb) { return this._errorPub.add(cb); }

    // ---- useSyncExternalStore adapters ----
    subscribeStatus = (cb) => this._statusPub.add(cb);
    subscribeListening = (cb) => this._listeningPub.add(cb);
    subscribeTranscript = (cb) => this._transcriptPub.add(cb);
    subscribeInterim = (cb) => this._interimPub.add(cb);
    subscribeError = (cb) => this._errorPub.add(cb);
    getSnapshotStatus = () => this._status;
    getSnapshotListening = () => this._listening;
    getSnapshotSupported = () => this._supported;
    getSnapshotTranscript = () => this._transcript;
    getSnapshotInterim = () => this._interim;
    getSnapshotError = () => this._error;

    // ---- reactive getters ----
    get status() { return this._status; }
    get listening() { return this._listening; }
    get supported() { return this._supported; }
    get transcript() { return this._transcript; }
    get interim() { return this._interim; }
    get error() { return this._error; }
    get fullTranscript() { return (this._transcript + " " + this._interim).trim(); }

    // ---- internal setters (emit on change) ----
    _setStatus(s) {
        if (this._status === s) return;
        this._status = s;
        this._statusPub.emit(s);
    }
    _setListening(v) {
        if (this._listening === v) return;
        this._listening = v;
        this._listeningPub.emit(v);
    }
    _setTranscript(v) {
        // Always coerce to a string. This is the single source of truth for
        // the transcript value that every consumer reads, so it must NEVER be
        // a function/array/object — otherwise callers hit "transcript.trim is
        // not a function" and React hits "Functions are not valid as a React
        // child" when rendering {transcript}.
        const text = normalizeText(v);
        this._transcript = text;
        this._transcriptPub.emit(text);
    }
    _setInterim(v) {
        const text = normalizeText(v);
        this._interim = text;
        this._interimPub.emit(text);
    }
    _setError(v) {
        this._error = v;
        this._errorPub.emit(v);
    }

    setLang(lang) {
        if (this._lang === lang) return;
        this._lang = lang;
        this._recreateWebRec();
    }

    // ---- initialisation (raced against a timeout) ----
    // Returns a shared promise so multiple callers can await readiness
    // without triggering duplicate init runs.
    init() {
        if (this._initPromise) return this._initPromise;
        this._initStarted = true;
        this._initPromise = this._doInitWithTimeout();
        return this._initPromise;
    }

    // Await readiness (used by start() to avoid racing init).
    async ready() {
        if (this._initPromise) await this._initPromise;
    }

    async _doInitWithTimeout() {
        await Promise.race([
            this._doInit(),
            new Promise((resolve) => setTimeout(resolve, INIT_TIMEOUT_MS)),
        ]);
        if (this._status === SR_STATUS.LOADING) {
            // Timeout — optimistically assume ready; start() surfaces real errors.
            if (isNativePlatform()) {
                this._supported = true;
                this._setStatus(SR_STATUS.READY);
            } else {
                this._initWeb();
            }
        }
    }

    async _doInit() {
        if (isNativePlatform()) {
            const SR = await loadNativeSR();
            if (SR) {
                this._native = SR;
                try {
                    const avail = await SR.available();
                    if (avail && avail.available === false) {
                        this._supported = false;
                        this._setStatus(SR_STATUS.UNAVAILABLE);
                        return;
                    }
                    this._supported = true;
                    this._setStatus(SR_STATUS.READY);
                } catch (err) {
                    console.warn("[speechService] Native SR availability check failed:", err);
                    this._supported = true;
                    this._setStatus(SR_STATUS.READY);
                }
                return;
            }
            // Native plugin failed — fall back to web.
        }
        this._initWeb();
    }

    _initWeb() {
        const SR =
            (typeof window !== "undefined" &&
                (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
            null;
        if (!SR) {
            this._supported = false;
            this._setStatus(SR_STATUS.UNAVAILABLE);
            return;
        }
        this._supported = true;
        this._setStatus(SR_STATUS.READY);
        this._recreateWebRec();
    }

    _recreateWebRec() {
        if (typeof window === "undefined") return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        try {
            // Abort any previous instance.
            this._webRec?.abort?.();
        } catch { /* noop */ }

        const recognition = new SR();
        recognition.lang = this._lang;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            this._setListening(true);
            this._setError(null);
        };
        recognition.onresult = (event) => {
            let finalText = "";
            let interimText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }
            if (finalText) {
                this._lastFinal = finalText.trim();
                // _setTranscript is a plain setter (NOT React setState), so it
                // must not receive a function updater — that would store the
                // function itself as the transcript and break every caller
                // ("transcript.trim is not a function" / "Functions are not
                // valid as a React child"). Append to the previous transcript
                // manually; _setTranscript normalizes the result to a string.
                const prev = this._transcript;
                this._setTranscript((prev ? prev + " " : "") + this._lastFinal);
            }
            this._setInterim(interimText);
        };
        recognition.onerror = (event) => {
            this._setError(event.error || "Speech recognition error");
            this._setListening(false);
        };
        recognition.onend = () => {
            this._setListening(false);
            this._setInterim("");
        };

        this._webRec = recognition;
    }

    // ---- permission (native) ----
    async requestPermission() {
        if (!isNativePlatform() || !this._native) return true;
        try {
            const perm = await this._native.requestPermissions();
            if (perm && perm.speechRecognition === "granted") return true;
            this._setStatus(SR_STATUS.DENIED);
            this._setError("Microphone permission denied.");
            return false;
        } catch (err) {
            console.warn("[speechService] Permission request failed:", err);
            this._setStatus(SR_STATUS.DENIED);
            this._setError("Microphone permission denied.");
            return false;
        }
    }

    // ---- start ----
    async start(opts = {}) {
        const lang = opts.lang || this._lang;
        this._setError(null);
        // Ensure the engine has finished initialising so the native plugin is
        // loaded before we call start(). Bounded by the init timeout.
        await this.ready();
        this._setTranscript("");
        this._setInterim("");
        this._lastPartial = "";
        this._lastFinal = "";

        // Native path
        if (isNativePlatform() && this._native) {
            const SR = this._native;
            const granted = await this.requestPermission();
            if (!granted) return;
            try {
                // Remove previous listeners so callbacks never accumulate.
                try { await SR.removeAllListeners(); } catch { /* noop */ }

                if (SR.start) {
                    await SR.start({
                        language: lang,
                        maxResults: 1,
                        partialResults: true,
                        popup: false,
                    });
                }
                this._nativeListening = true;
                this._setListening(true);

                const onPartial = (ev) => {
                    // Capacitor partialResults: ev.matches is usually an array
                    // of strings. normalizeText turns any shape into a string.
                    const text = normalizeText(ev && (ev.matches || ev.results || ev.transcript));
                    if (text) {
                        this._lastPartial = text;
                        this._setInterim(text);
                    }
                };
                const onComplete = (ev) => {
                    // Capacitor results: ev.matches / ev.results may be arrays.
                    const text = normalizeText(ev && (ev.matches || ev.results || ev.transcript));
                    if (text) {
                        this._lastFinal = text;
                        this._setTranscript(text);
                    }
                };
                const onListeningState = (ev) => {
                    const st = ev && ev.status;
                    if (st === "stopped" || st === "inactive") {
                        // Use the final result if we got one, otherwise the
                        // latest partial so the caller still has something.
                        const final = normalizeText(this._lastFinal || this._lastPartial);
                        if (final) this._setTranscript(final);
                        this._nativeListening = false;
                        this._setListening(false);
                        this._setInterim("");
                    }
                };
                if (SR.addListener) {
                    try {
                        await SR.addListener("partialResults", onPartial);
                        await SR.addListener("results", onComplete);
                        await SR.addListener("listeningState", onListeningState);
                    } catch { /* some versions use different event names */ }
                }
            } catch (err) {
                console.warn("[speechService] Native SR start error:", err);
                this._setError("Could not start speech recognition.");
                this._setListening(false);
                this._nativeListening = false;
            }
            return;
        }

        // Web path
        if (!this._webRec) {
            // Try to (re)create if the web API exists.
            this._initWeb();
        }
        if (!this._webRec) {
            this._setError("Speech recognition is not supported on this device.");
            return;
        }
        this._manualStop = false;
        try {
            this._webRec.lang = lang;
            this._webRec.start();
        } catch {
            // start() throws if already started — ignore.
        }
    }

    // ---- stop ----
    stop() {
        this._manualStop = true;
        if (isNativePlatform() && this._native) {
            this._nativeListening = false;
            try { this._native.stop?.(); } catch { /* noop */ }
            try { this._native.removeAllListeners?.(); } catch { /* noop */ }
            this._setListening(false);
            return;
        }
        if (this._webRec) {
            try { this._webRec.stop(); } catch { /* noop */ }
        }
        this._setListening(false);
    }

    reset() {
        this._setTranscript("");
        this._setInterim("");
        this._setError(null);
        this._lastPartial = "";
        this._lastFinal = "";
    }

    // Re-attempt initialisation after an "unavailable"/"denied" state so the
    // user can retry (e.g. after granting mic permission in OS settings).
    async retry() {
        this._setStatus(SR_STATUS.LOADING);
        this._setError(null);
        // Force a fresh init run (clear the cached promise first).
        this._initPromise = null;
        await this._doInitWithTimeout();
    }
}

// ---------------------------------------------------------------------------
// Singleton instances — the whole app shares these.
// ---------------------------------------------------------------------------
export const tts = new TTSEngine();
export const sr = new SREngine();

// Kick off initialisation eagerly so the first consumer mount is fast.
// These are async and self-contained; failures fall back gracefully.
tts.init();
sr.init();
