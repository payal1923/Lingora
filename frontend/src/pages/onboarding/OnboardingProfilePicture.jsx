import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const avatars = [
    {
        id: "friendly",
        label: "Friendly Learner",
        emoji: "😊",
        gradient: "from-blue-500 to-cyan-400",
    },
    {
        id: "cool",
        label: "Cool Learner",
        emoji: "😎",
        gradient: "from-violet-500 to-purple-400",
    },
    {
        id: "happy",
        label: "Happy Learner",
        emoji: "😄",
        gradient: "from-amber-500 to-orange-400",
    },
    {
        id: "focused",
        label: "Focused Learner",
        emoji: "🤓",
        gradient: "from-emerald-500 to-teal-400",
    },
    {
        id: "star",
        label: "Star Learner",
        emoji: "⭐",
        gradient: "from-pink-500 to-rose-400",
    },
    {
        id: "explorer",
        label: "Lingora Explorer",
        emoji: "🚀",
        gradient: "from-indigo-500 to-blue-400",
    },
];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function getInitials(name) {
    if (!name) return "L";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "L";
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function OnboardingProfilePicture() {
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedAvatarId, setSelectedAvatarId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [initials, setInitials] = useState("L");
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("lingora_onboarding_name");
        setInitials(getInitials(savedName));

        const savedPicture = localStorage.getItem(
            "lingora_onboarding_profile_picture"
        );
        const savedType = localStorage.getItem(
            "lingora_onboarding_profile_picture_type"
        );

        if (savedType === "avatar" && savedPicture) {
            setSelectedAvatarId(savedPicture);
        } else if (savedType === "upload" && savedPicture) {
            setPhotoPreview(savedPicture);
        }
    }, []);

    const handleBack = () => {
        navigate("/onboarding/name");
    };

    const handleChoosePhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        setErrorMessage("");

        if (!ALLOWED_TYPES.includes(file.type)) {
            setErrorMessage("Please choose a PNG, JPG, or WEBP image.");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setErrorMessage("Profile photo must be smaller than 2 MB.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64Preview = reader.result;
            setPhotoPreview(base64Preview);
            setSelectedAvatarId(null);
            localStorage.setItem(
                "lingora_onboarding_profile_picture",
                base64Preview
            );
            localStorage.setItem(
                "lingora_onboarding_profile_picture_type",
                "upload"
            );
        };
        reader.readAsDataURL(file);
    };

    const handleSelectAvatar = (avatar) => {
        setErrorMessage("");
        setPhotoPreview(null);
        setSelectedAvatarId(avatar.id);
        localStorage.setItem("lingora_onboarding_profile_picture", avatar.id);
        localStorage.setItem("lingora_onboarding_profile_picture_type", "avatar");
    };

    const handleContinue = () => {
        navigate("/onboarding/english-preference");
    };

    const handleSkip = () => {
        localStorage.removeItem("lingora_onboarding_profile_picture");
        localStorage.removeItem("lingora_onboarding_profile_picture_type");
        navigate("/onboarding/english-preference");
    };

    const selectedAvatar = avatars.find((a) => a.id === selectedAvatarId);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50">
            <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col px-6 pb-12 pt-8 sm:pt-10">
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Go back"
                    className="mb-8 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 hover:bg-slate-100 cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>

                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight leading-snug">
                    Let&apos;s set up your
                    <br />
                    profile picture
                </h1>
                <p className="mt-3 text-base text-slate-500 leading-relaxed">
                    Add a photo or choose an avatar. You can change it later.
                </p>

                <div className="mt-10 flex flex-col items-center">
                    <div className="flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-lg">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Your uploaded profile"
                                className="h-full w-full object-cover"
                            />
                        ) : selectedAvatar ? (
                            <div
                                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${selectedAvatar.gradient}`}
                            >
                                <span className="text-5xl" role="img" aria-label={selectedAvatar.label}>
                                    {selectedAvatar.emoji}
                                </span>
                            </div>
                        ) : (
                            <span className="text-4xl font-bold text-slate-400">
                                {initials}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleChoosePhotoClick}
                        aria-label="Choose profile photo"
                        className="mt-6 flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.827 6.175A2.25 2.25 0 0 1 8.92 4.5h6.16a2.25 2.25 0 0 1 2.092 1.675l.126.474c.05.187.208.325.404.325h1.048A2.25 2.25 0 0 1 21 9.225V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V9.225a2.25 2.25 0 0 1 2.25-2.25H6.3a.42.42 0 0 0 .404-.325l.123-.475Z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                        </svg>
                        Choose profile photo
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-hidden="true"
                    />

                    {errorMessage && (
                        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
                    )}
                </div>

                <div className="mt-10">
                    <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
                        or choose your avatar
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {avatars.map((avatar) => {
                            const isSelected = selectedAvatarId === avatar.id;
                            return (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    onClick={() => handleSelectAvatar(avatar)}
                                    aria-label={`Select ${avatar.label} avatar`}
                                    className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200 hover:scale-105 cursor-pointer ${isSelected
                                            ? "bg-blue-50 ring-2 ring-blue-400 border border-blue-400"
                                            : "border border-transparent"
                                        }`}
                                >
                                    <div
                                        className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${avatar.gradient} shadow-sm`}
                                    >
                                        <span className="text-2xl" role="img" aria-label={avatar.label}>
                                            {avatar.emoji}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 text-center">
                                        {avatar.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto pt-12">
                    <button
                        type="button"
                        onClick={handleContinue}
                        className="w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-blue-700 cursor-pointer"
                    >
                        Continue
                    </button>
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="mt-4 w-full text-center text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-slate-700 cursor-pointer"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
}
