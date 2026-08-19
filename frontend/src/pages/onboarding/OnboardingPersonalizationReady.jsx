import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config/api";


const levelLabels = {
    beginner: "Beginner",
    elementary: "Elementary",
    intermediate: "Intermediate",
    upper_intermediate: "Upper Intermediate",
    advanced: "Advanced",
};

const goalLabels = {
    speak_confidently: "Speak confidently",
    career: "Career & interviews",
    study: "Study & exams",
    travel: "Travel",
    grammar: "Improve grammar",
    vocabulary: "Build vocabulary",
    fluency: "Become fluent",
};

const teacherStyleLabels = {
    clear: "Clear & Structured",
    friendly: "Friendly & Supportive",
    casual: "Casual & Natural",
};

const correctionStyleLabels = {
    gentle: "Gentle corrections",
    direct: "Direct corrections",
    detailed: "Detailed explanations",
};

const dailyGoalLabels = {
    "5": "5 minutes daily",
    "10": "10 minutes daily",
    "15": "15 minutes daily",
    "20": "20 minutes daily",
    "30": "30 minutes daily",
};

const interestLabels = {
    technology: "Technology",
    business: "Business",
    travel: "Travel",
    music: "Music",
    movies: "Movies & TV",
    sports: "Sports",
    gaming: "Gaming",
    food: "Food",
    fitness: "Fitness",
    science: "Science",
    finance: "Finance",
    fashion: "Fashion",
    books: "Books",
    social: "Social life",
    culture: "Culture",
};

function getFirstName(name) {
    if (!name) return "";

    const parts = name.trim().split(/\s+/).filter(Boolean);

    return parts.length > 0 ? parts[0] : "";
}

function getSavedInterests() {
    const savedInterests = localStorage.getItem(
        "lingora_onboarding_interests"
    );

    if (!savedInterests) {
        return [];
    }

    try {
        const parsedInterests = JSON.parse(savedInterests);

        if (!Array.isArray(parsedInterests)) {
            return [];
        }

        return parsedInterests
            .filter((interest) => interestLabels[interest])
            .map((interest) => interestLabels[interest]);
    } catch (error) {
        return [];
    }
}

export default function OnboardingPersonalizationReady() {
    const [firstName, setFirstName] = useState("");
    const [assessedLevel, setAssessedLevel] = useState("");
    const [learningGoal, setLearningGoal] = useState("");
    const [teacherStyle, setTeacherStyle] = useState("");
    const [correctionStyle, setCorrectionStyle] = useState("");
    const [dailyGoal, setDailyGoal] = useState("");
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        const savedName = localStorage.getItem(
            "lingora_onboarding_name"
        );

        const savedAssessedLevel = localStorage.getItem(
            "lingora_onboarding_assessed_level"
        );

        const savedEnglishLevel = localStorage.getItem(
            "lingora_onboarding_english_level"
        );

        const savedLearningGoal = localStorage.getItem(
            "lingora_onboarding_learning_goal"
        );

        const savedTeacherStyle = localStorage.getItem(
            "lingora_onboarding_teacher_style"
        );

        const savedCorrectionStyle = localStorage.getItem(
            "lingora_onboarding_correction_style"
        );

        const savedDailyGoal = localStorage.getItem(
            "lingora_onboarding_daily_goal"
        );

        setFirstName(getFirstName(savedName));

        const finalLevel =
            savedAssessedLevel || savedEnglishLevel || "";

        if (levelLabels[finalLevel]) {
            setAssessedLevel(levelLabels[finalLevel]);
        }

        if (goalLabels[savedLearningGoal]) {
            setLearningGoal(goalLabels[savedLearningGoal]);
        }

        if (teacherStyleLabels[savedTeacherStyle]) {
            setTeacherStyle(
                teacherStyleLabels[savedTeacherStyle]
            );
        }

        if (correctionStyleLabels[savedCorrectionStyle]) {
            setCorrectionStyle(
                correctionStyleLabels[savedCorrectionStyle]
            );
        }

        if (dailyGoalLabels[savedDailyGoal]) {
            setDailyGoal(dailyGoalLabels[savedDailyGoal]);
        }

        setInterests(getSavedInterests());
    }, []);

    const handleStartJourney = async () => {
        if (loading) return;

        setError("");

        try {
            setLoading(true);

            const savedUser = localStorage.getItem("user");

            if (!savedUser) {
                throw new Error("Logged-in user not found. Please log in again.");
            }

            const user = JSON.parse(savedUser);

            if (!user.user_id) {
                throw new Error("User ID not found. Please log in again.");
            }

            const response = await axios.put(
                `${API_URL}/users/${user.user_id}/complete-onboarding`
            );

            const updatedUser = {
                ...user,
                onboarding_completed: response.data.onboarding_completed,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            localStorage.setItem(
                "lingora_onboarding_completed",
                "true"
            );

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error) {
            console.error("Unable to complete onboarding:", error);

            if (error.response) {
                setError(
                    error.response.data?.detail ||
                    "Unable to complete onboarding. Please try again."
                );
            } else {
                setError(
                    error.message ||
                    "Unable to connect to the server. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const personalizedRows = [
        {
            emoji: "🎯",
            title: "Your main goal",
            value: learningGoal || "Improve your English",
        },
        {
            emoji: "📚",
            title: "Your starting level",
            value: assessedLevel || "Personalized level",
        },
        {
            emoji: "🤖",
            title: "Your AI teacher",
            value: teacherStyle || "Personalized teaching",
        },
        {
            emoji: "✨",
            title: "Your feedback style",
            value: correctionStyle || "Personalized feedback",
        },
        {
            emoji: "🔥",
            title: "Your daily goal",
            value: dailyGoal || "Daily English practice",
        },
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50">
            <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col px-6 pb-12 pt-10 sm:pt-14">

                <div className="flex flex-col items-center text-center">

                    <div
                        className="relative flex h-52 w-52 items-center justify-center"
                        aria-hidden="true"
                    >
                        <div className="absolute h-44 w-44 rounded-full bg-blue-300/40 blur-2xl animate-pulse" />

                        <div className="absolute top-2 right-5 h-3 w-3 rounded-full bg-blue-300 animate-pulse" />

                        <div className="absolute bottom-6 -left-1 h-2.5 w-2.5 rounded-full bg-indigo-300 animate-pulse" />

                        <div className="absolute top-12 -right-4 h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />

                        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl">

                            <div className="absolute -top-4 h-6 w-1.5 rounded-full bg-gradient-to-b from-blue-400 to-indigo-400" />

                            <div className="absolute -top-6 h-3 w-3 rounded-full bg-blue-400" />

                            <div className="flex h-28 w-28 flex-col items-center justify-center gap-3 rounded-full bg-white">

                                <div className="flex gap-4">
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                </div>

                                <div className="h-3 w-9 rounded-b-full border-b-2 border-blue-500" />

                            </div>

                        </div>
                    </div>

                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Your Lingora is ready
                    </p>

                    <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight leading-snug">

                        {firstName ? (
                            <>
                                Your learning journey is
                                <br />
                                ready, {firstName}!
                            </>
                        ) : (
                            <>
                                Your learning journey
                                <br />
                                is ready!
                            </>
                        )}

                    </h1>

                    <p className="mt-4 mx-auto max-w-md text-base text-slate-500 leading-relaxed">
                        Lingora has personalized your English learning
                        experience around your level, goals, interests,
                        and learning preferences.
                    </p>

                </div>

                <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between gap-4">

                        <div>
                            <p className="text-sm font-semibold text-slate-500">
                                Personalized learning plan
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-slate-800">
                                Built for you
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                            <span
                                className="text-2xl"
                                role="img"
                                aria-hidden="true"
                            >
                                ✨
                            </span>
                        </div>

                    </div>

                    <div className="mt-5 flex flex-col gap-4">

                        {personalizedRows.map((row) => (
                            <div
                                key={row.title}
                                className="flex items-center gap-3"
                            >

                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">

                                    <span
                                        className="text-lg"
                                        role="img"
                                        aria-hidden="true"
                                    >
                                        {row.emoji}
                                    </span>

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="text-xs font-medium text-slate-400">
                                        {row.title}
                                    </p>

                                    <p className="mt-0.5 font-semibold text-slate-800">
                                        {row.value}
                                    </p>

                                </div>

                            </div>
                        ))}

                    </div>

                </div>

                {interests.length > 0 && (
                    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                        <p className="text-sm font-semibold text-slate-800">
                            Topics you'll practice with
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Lingora will use your interests to make learning
                            more relevant.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">

                            {interests.map((interest) => (
                                <span
                                    key={interest}
                                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                                >
                                    {interest}
                                </span>
                            ))}

                        </div>

                    </div>
                )}

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">

                    <p className="text-sm text-slate-600 leading-relaxed">
                        🚀 Your plan isn't fixed forever. Lingora will adapt
                        your learning experience as your English improves.
                    </p>

                </div>

                <div className="mt-auto pt-10">

                    {error && (
                        <div
                            role="alert"
                            className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
                        >
                            <p className="text-sm font-medium text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleStartJourney}
                        disabled={loading}
                        className={`w-full rounded-2xl py-4 text-base font-bold text-white transition-all duration-200 ${loading
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                            }`}
                    >
                        {loading
                            ? "Preparing your Lingora journey..."
                            : "Start my Lingora journey"}
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        Your personalized English learning experience starts now.
                    </p>

                </div>

            </div>
        </div>
    );
}