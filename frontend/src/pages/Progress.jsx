import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

export default function Progress() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    const userId = user?.id ?? user?.user_id;

    const [dashboard, setDashboard] = useState({
        total_quizzes: 0,
        highest_score: 0,
        average_score: 0,
        learned_words: 0,
        progress: 0,
        total_words: 0,
    });

    const [xp, setXp] = useState({
        xp: 0,
        level: 1,
        progress: 0,
        english_rank: "Beginner",
    });

    const [streak, setStreak] = useState(0);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const loadProgress = async () => {
            try {
                const [
                    dashboardRes,
                    learnedRes,
                    progressRes,
                    xpRes,
                    streakRes,
                    badgeRes,
                ] = await Promise.all([
                    axios.get(
                        `${API_URL}/dashboard/${userId}`
                    ),

                    axios.get(
                        `${API_URL}/learned-count/${userId}`
                    ),

                    axios.get(
                        `${API_URL}/vocabulary-progress/${userId}`
                    ),

                    axios.get(
                        `${API_URL}/xp/${userId}`
                    ),

                    axios.get(
                        `${API_URL}/streak/${userId}`
                    ),

                    axios.get(
                        `${API_URL}/badges/${userId}`
                    ),
                ]);

                setDashboard({
                    ...dashboardRes.data,
                    learned_words: learnedRes.data.learned_words,
                    progress: progressRes.data.progress,
                    total_words: progressRes.data.total_words,
                });

                setXp({
                    xp: xpRes.data.xp,
                    level: xpRes.data.level,
                    progress: xpRes.data.progress,
                    english_rank: xpRes.data.english_rank,
                });

                setStreak(streakRes.data.streak);

                setBadges(
                    Array.isArray(badgeRes.data.badges)
                        ? badgeRes.data.badges
                        : []
                );
            } catch (error) {
                console.error("Progress Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProgress();
    }, [userId]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>

                    <p className="mt-4 font-medium text-slate-600">
                        Loading Progress...
                    </p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Quizzes",
            value: dashboard.total_quizzes,
            icon: "📚",
            valueClass: "text-blue-600",
        },
        {
            label: "Highest Score",
            value: dashboard.highest_score,
            icon: "🎯",
            valueClass: "text-green-600",
        },
        {
            label: "Average Score",
            value: dashboard.average_score,
            icon: "📈",
            valueClass: "text-orange-500",
        },
        {
            label: "Learned Words",
            value: dashboard.learned_words,
            icon: "📖",
            valueClass: "text-purple-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:py-8">
                {/* Page Header */}

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-100"
                        aria-label="Back to dashboard"
                    >
                        ←
                    </button>

                    <div>
                        <h1 className="typo-page-title text-slate-900">
                            Your Progress
                        </h1>

                        <p className="mt-1 typo-body text-slate-500">
                            Track your English learning journey.
                        </p>
                    </div>
                </div>

                {/* Level Hero */}

                <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-5 text-white shadow-xl md:p-8">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10"></div>

                    <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-white/10"></div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="typo-stat-label text-blue-100">
                                    Current Level
                                </p>

                                <h2 className="mt-1 typo-hero text-white">
                                    Level {xp.level}
                                </h2>

                                <p className="mt-2 typo-card-title text-yellow-300">
                                    🎓 {xp.english_rank}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/15 px-4 py-3 text-right backdrop-blur-md">
                                <p className="typo-stat-label text-blue-100">
                                    Total XP
                                </p>

                                <p className="mt-1 typo-stat-value text-white">
                                    ⭐ {xp.xp}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="mb-2 flex items-center justify-between typo-secondary text-white">
                                <span className="font-semibold">
                                    Level Progress
                                </span>

                                <span>{xp.progress}/100 XP</span>
                            </div>

                            <div className="h-4 overflow-hidden rounded-full bg-white/20">
                                <div
                                    className="h-full rounded-full bg-yellow-400 transition-all duration-1000"
                                    style={{
                                        width: `${Math.min(
                                            Number(xp.progress) || 0,
                                            100
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Streak */}

                <section className="mt-5 rounded-3xl bg-white p-5 shadow-lg md:mt-8 md:p-7">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Current Learning Streak
                            </p>

                            <h2 className="mt-1 text-3xl font-bold text-red-500 md:text-5xl">
                                🔥 {streak} Days
                            </h2>
                        </div>

                        <div className="text-5xl md:text-7xl">🔥</div>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                        Keep learning every day to grow your streak.
                    </p>
                </section>

                {/* Quiz Stats */}

                <section className="mt-6 md:mt-8">
                    <h2 className="text-xl font-bold text-slate-900 md:text-3xl">
                        📊 Learning Statistics
                    </h2>

                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl bg-white p-4 shadow-md md:rounded-3xl md:p-6"
                            >
                                <div className="text-3xl md:text-5xl">
                                    {stat.icon}
                                </div>

                                <p className="mt-3 text-xs text-slate-500 md:text-sm">
                                    {stat.label}
                                </p>

                                <p
                                    className={`mt-1 text-2xl font-bold md:text-4xl ${stat.valueClass}`}
                                >
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Vocabulary */}

                <section className="mt-6 rounded-3xl bg-white p-5 shadow-lg md:mt-8 md:p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 md:text-3xl">
                                📚 Vocabulary Progress
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Words learned in your vocabulary journey.
                            </p>
                        </div>

                        <span className="text-xl font-bold text-blue-600 md:text-3xl">
                            {dashboard.progress}%
                        </span>
                    </div>

                    <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                            style={{
                                width: `${Math.min(
                                    Number(dashboard.progress) || 0,
                                    100
                                )}%`,
                            }}
                        ></div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-purple-50 p-4 md:p-6">
                            <p className="text-sm text-slate-500">
                                Learned Words
                            </p>

                            <p className="mt-1 text-3xl font-bold text-purple-600 md:text-5xl">
                                {dashboard.learned_words}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 md:p-6">
                            <p className="text-sm text-slate-500">
                                Total Words
                            </p>

                            <p className="mt-1 text-3xl font-bold text-slate-900 md:text-5xl">
                                {dashboard.total_words}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/vocabulary")}
                        className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 md:w-auto"
                    >
                        Continue Vocabulary →
                    </button>
                </section>

                {/* Badges */}

                <section className="mt-6 rounded-3xl bg-white p-5 shadow-lg md:mt-8 md:p-8">
                    <h2 className="text-xl font-bold text-slate-900 md:text-3xl">
                        🏅 Your Badges
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Achievements earned while learning English.
                    </p>

                    {badges.length > 0 ? (
                        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
                            {badges.map((badge, index) => (
                                <div
                                    key={badge.id ?? badge.name ?? index}
                                    className="rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 p-4 text-center shadow-sm"
                                >
                                    <div className="text-4xl">
                                        {badge.icon || "🏅"}
                                    </div>

                                    <p className="mt-2 text-sm font-bold text-slate-900">
                                        {badge.name ||
                                            badge.badge_name ||
                                            "Achievement"}
                                    </p>

                                    {badge.description && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            {badge.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center">
                            <div className="text-5xl">🏅</div>

                            <p className="mt-3 font-semibold text-slate-800">
                                No badges yet
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Complete lessons and challenges to unlock
                                achievements.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}