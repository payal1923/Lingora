// ProfilePhotoUploader.jsx
// ------------------------
// Reusable profile-picture uploader with Crop / Preview / Replace / Remove.
//
// Used by the Profile page. Writes to the shared profile-picture module
// (Hooks/profilePicture.js) so every surface (Navbar, MobileSidebar,
// Dashboard, Leaderboard, Speaking, Lingora AI) updates instantly.
//
// Crop: a lightweight, dependency-free center-crop with a zoom slider. The
// uploaded image is drawn to an offscreen canvas at the chosen zoom, square
// cropped, and exported as a compressed JPEG data URL. This is reliable in
// Android WebView (no external crop library needed) and keeps storage small.
//
// Constraints (mirrors OnboardingProfilePicture): max 2 MB, PNG/JPEG/WEBP.

import { useCallback, useEffect, useRef, useState } from "react";
import {
    getProfilePicture,
    setProfilePicture,
    clearProfilePicture,
} from "../Hooks/profilePicture";
import UserAvatar from "./UserAvatar";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const OUTPUT_SIZE = 320; // square output px

export default function ProfilePhotoUploader({ name, size = "2xl" }) {
    const { src } = getProfilePicture();
    const [showEditor, setShowEditor] = useState(false);
    const [rawImage, setRawImage] = useState(null); // data URL of uploaded file
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    // Reset error when editor closes.
    useEffect(() => {
        if (!showEditor) {
            setError("");
            setZoom(1);
        }
    }, [showEditor]);

    const handleChooseClick = useCallback(() => {
        setError("");
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        // Always reset the input so the same file can be re-selected.
        e.target.value = "";
        if (!file) return;

        if (!ACCEPTED.includes(file.type)) {
            setError("Please choose a PNG, JPEG, or WEBP image.");
            return;
        }
        if (file.size > MAX_SIZE) {
            setError("Image must be under 2 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setRawImage(reader.result);
            setShowEditor(true);
            setZoom(1);
        };
        reader.onerror = () => setError("Could not read that image. Try another.");
        reader.readAsDataURL(file);
    }, []);

    // Crop the raw image at the current zoom and produce a square data URL.
    const cropAndExport = useCallback(() => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = canvasRef.current || document.createElement("canvas");
                    canvas.width = OUTPUT_SIZE;
                    canvas.height = OUTPUT_SIZE;
                    const ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

                    // Source dimensions scaled by zoom.
                    const sw = img.width / zoom;
                    const sh = img.height / zoom;
                    const sx = (img.width - sw) / 2;
                    const sy = (img.height - sh) / 2;

                    // Cover-fit the cropped square into the output canvas.
                    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                    resolve(dataUrl);
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Image load failed"));
            img.src = rawImage;
        });
    }, [rawImage, zoom]);

    const handleSave = useCallback(async () => {
        try {
            const dataUrl = await cropAndExport();
            setProfilePicture({ src: dataUrl, type: "upload" });
            setShowEditor(false);
            setRawImage(null);
        } catch (err) {
            console.warn("Crop failed:", err);
            setError("Could not process the image. Try another.");
        }
    }, [cropAndExport]);

    const handleRemove = useCallback(() => {
        clearProfilePicture();
    }, []);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <UserAvatar name={name} size={size} />
                {/* Online indicator */}
                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white" />
                {/* Camera edit button overlay */}
                <button
                    type="button"
                    onClick={handleChooseClick}
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 0 1 .55-1.38l1.2-1.2A2 2 0 0 1 6.16 6h11.68a2 2 0 0 1 1.41.42l1.2 1.2A2 2 0 0 1 21 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                        <circle cx="12" cy="13" r="3.5" />
                    </svg>
                </button>
            </div>

            {/* Action row: Replace / Remove (only when a photo exists) */}
            {src && (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleChooseClick}
                        className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer touch-manipulation"
                    >
                        Replace
                    </button>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer touch-manipulation"
                    >
                        Remove
                    </button>
                </div>
            )}

            {!src && (
                <button
                    type="button"
                    onClick={handleChooseClick}
                    className="rounded-full bg-indigo-50 border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                    Upload Photo
                </button>
            )}

            {error && (
                <p className="text-xs text-rose-500 text-center max-w-[220px]">{error}</p>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED.join(",")}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Crop / Preview editor modal */}
            {showEditor && rawImage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                    <button
                        type="button"
                        aria-label="Close photo editor"
                        onClick={() => setShowEditor(false)}
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                    />
                    <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-5">
                            <h2 className="text-xl font-bold text-white">Adjust Photo</h2>
                            <p className="mt-1 text-sm text-white/70">
                                Zoom and position your photo, then save.
                            </p>
                        </div>

                        <div className="px-6 py-6">
                            {/* Preview square */}
                            <div className="mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-full bg-slate-100 border-4 border-white shadow-inner">
                                <img
                                    ref={imgRef}
                                    src={rawImage}
                                    alt="Preview"
                                    className="max-h-none max-w-none"
                                    style={{
                                        width: `${100 * zoom}%`,
                                        height: `${100 * zoom}%`,
                                        objectFit: "cover",
                                    }}
                                />
                            </div>

                            {/* Zoom slider */}
                            <div className="mt-5">
                                <label htmlFor="photo-zoom" className="block text-xs font-semibold text-slate-600 mb-2">
                                    Zoom
                                </label>
                                <input
                                    id="photo-zoom"
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full accent-indigo-600"
                                />
                            </div>

                            {error && (
                                <p className="mt-3 text-xs text-rose-500 text-center">{error}</p>
                            )}

                            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditor(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer touch-manipulation"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
                                >
                                    Save Photo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden canvas for export */}
            <canvas ref={canvasRef} width={OUTPUT_SIZE} height={OUTPUT_SIZE} className="hidden" />
        </div>
    );
}
