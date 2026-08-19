import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";
import UserAvatar from "../components/UserAvatar";
import speakingService from "../services/speakingService";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAILY_GOAL = 5;
const WEEKLY_GOAL = 35;
const RESUME_KEY = "lingora_speaking_resume";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read the saved speaking-lesson resume state (if any) from localStorage. */
function readResume() {
    try {
        const raw = localStorage.getItem(RESUME_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.lessonKey) return null;
        return parsed;
    } catch {
        return null;
    }
}

/** Human-readable "time ago" from an ISO timestamp. */
function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

/** Map a resume step to a friendly label + progress percentage. */
function resumeStepInfo(step) {
    switch (step) {
        case "vocabulary":
            return { label: "Vocabulary", pct: 25 };
        case "sentences":
            return { label: "Sentences", pct: 50 };
        case "conversation":
            return { label: "Conversation", pct: 75 };
        case "summary":
            return { label: "Summary", pct: 100 };
        default:
            return { label: "In Progress", pct: 10 };
    }
}

/** Score band color helper. */
function scoreColor(score) {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
}

function scoreBarColor(score) {
    if (score >= 80) return "from-emerald-400 to-teal-500";
    if (score >= 60) return "from-amber-400 to-orange-500";
    return "from-rose-400 to-pink-500";
}

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

function ProgressBar({ value, max = 100, barClass = "from-blue-500 to-indigo-600", trackClass = "bg-slate-200", height = "h-3" }) {
    const pct = Math.min(100, Math.max(0, (Number(value) || 0) / max * 100));
    return (
        <div className={`w-full overflow-hidden rounded-full ${trackClass} ${height}`}>
            <div
                className={`h-full rounded-full bg-gradient-to-r ${barClass} transition-all duration-1000`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function StatCard({ icon, label, value, sub, accent = "text-white" }) {
    return (
        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-md md:p-6">
            <p className="typo-stat-label text-blue-100">{icon} {label}</p>
            <p className={`mt-1 typo-stat-value ${accent}`}>{value}</p>
            {sub && <p className="mt-1 typo-caption text-blue-100">{sub}</p>}
        </div>
    );
}

function SectionCard({ title, icon, action, children, className = "" }) {
    return (
        <div className={`rounded-3xl bg-white p-5 shadow-lg md:p-7 ${className}`}>
            <div className="flex items-center justify-between">
                <h2 className="typo-section-title text-slate-900">{icon} {title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
    // --------------------------------------------
    // Authentication
    // --------------------------------------------
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const userId = user?.id ?? user?.user_id;
    const userName = user?.full_name || user?.name || "Learner";

    // --------------------------------------------
    // Dashboard State
    // --------------------------------------------
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
    // `loading` starts false when there is no user (avoids setState-in-effect).
    const [loading, setLoading] = useState(() => !!userId);

    // Speaking-specific state (new)
    const [speaking, setSpeaking] = useState(null); // speaking-dashboard payload
    const [speakingBadges, setSpeakingBadges] = useState([]); // speaking-badges payload
    const [reviewItems, setReviewItems] = useState([]); // weak words/sentences
    // `resume` is initialised lazily from localStorage (avoids setState-in-effect).
    const [resume, setResume] = useState(() => readResume());

    const todayProgress = Math.min(dashboard.total_quizzes, DAILY_GOAL);
    const weeklyProgress = Math.min(dashboard.total_quizzes, WEEKLY_GOAL);

    // --------------------------------------------
    // Load Dashboard
    // --------------------------------------------
    useEffect(() => {
        if (!userId) return;

        const loadDashboard = async () => {
            try {
                const [
                    dashboardRes,
                    learnedRes,
                    progressRes,
                    xpRes,
                    streakRes,
                ] = await Promise.all([
                    axios.get(`${API_URL}/dashboard/${userId}`),
                    axios.get(`${API_URL}/learned-count/${userId}`),
                    axios.get(`${API_URL}/vocabulary-progress/${userId}`),
                    axios.get(`${API_URL}/xp/${userId}`),
                    axios.get(`${API_URL}/streak/${userId}`),
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
            } catch (error) {
                console.error("Dashboard Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [userId]);

    // --------------------------------------------
    // Load Speaking data (dashboard, badges, review) + resume
    // --------------------------------------------
    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        const loadSpeaking = async () => {
            try {
                const [dash, sBadges, review] = await Promise.allSettled([
                    speakingService.getDashboard(),
                    speakingService.getBadges(),
                    speakingService.getReviewItems(),
                ]);

                if (cancelled) return;

                if (dash.status === "fulfilled") setSpeaking(dash.value);
                if (sBadges.status === "fulfilled") setSpeakingBadges(sBadges.value?.badges || []);
                if (review.status === "fulfilled") setReviewItems(review.value?.review_items || []);
            } catch (error) {
                console.error("Speaking data error:", error);
            }
        };

        loadSpeaking();

        // Listen for resume-state changes (e.g. when returning from a lesson)
        const onStorage = (e) => {
            if (e.key === RESUME_KEY) setResume(readResume());
        };
        window.addEventListener("storage", onStorage);
        return () => {
            cancelled = true;
            window.removeEventListener("storage", onStorage);
        };
    }, [userId]);

    // --------------------------------------------
    // Derived: Continue Learning target
    // --------------------------------------------
    const continueLearning = useMemo(() => {
        // Priority 1: a saved in-progress speaking lesson
        if (resume && resume.lessonKey) {
            const step = resumeStepInfo(resume.step);
            return {
                type: "speaking",
                title: resume.lessonTitle || "Speaking Lesson",
                level: resume.level || "",
                progress: step.pct,
                stepLabel: step.label,
                savedAt: resume.savedAt,
                onClick: () => navigate("/speaking-practice", { state: { resumeKey: resume.lessonKey } }),
                cta: "Resume Lesson",
                icon: "🗣️",
            };
        }
        // Priority 2: the current speaking lesson from the backend
        if (speaking && speaking.current_lesson) {
            return {
                type: "speaking",
                title: speaking.current_lesson,
                level: speaking.current_level || "",
                progress: speaking.progress || 0,
                stepLabel: `${speaking.completed_lessons || 0}/${speaking.total_lessons || 45} lessons`,
                savedAt: null,
                onClick: () => navigate("/speaking-practice"),
                cta: "Start Lesson",
                icon: "🗣️",
            };
        }
        // Priority 3: vocabulary if there are words left
        if (dashboard.total_words > 0 && dashboard.learned_words < dashboard.total_words) {
            return {
                type: "vocabulary",
                title: "Continue Vocabulary",
                level: "",
                progress: dashboard.progress || 0,
                stepLabel: `${dashboard.learned_words}/${dashboard.total_words} words`,
                savedAt: null,
                onClick: () => navigate("/vocabulary"),
                cta: "Learn Words",
                icon: "📚",
            };
        }
        // Priority 4: daily challenge
        return {
            type: "daily",
            title: "Daily Challenge",
            level: "",
            progress: (todayProgress / DAILY_GOAL) * 100,
            stepLabel: `${todayProgress}/${DAILY_GOAL} done`,
            savedAt: null,
            onClick: () => navigate("/daily-challenge"),
            cta: "Start Challenge",
            icon: "🔥",
        };
    }, [resume, speaking, dashboard, todayProgress, navigate]);

    // --------------------------------------------
    // Derived: Recent Activity (from available data)
    // --------------------------------------------
    const recentActivity = useMemo(() => {
        const items = [];
        if (speaking) {
            if (speaking.completed_lessons > 0) {
                items.push({
                    icon: "🗣️",
                    text: `${speaking.completed_lessons} speaking lesson${speaking.completed_lessons > 1 ? "s" : ""} completed`,
                    color: "text-indigo-600",
                });
            }
            if (speaking.words_learned > 0) {
                items.push({
                    icon: "📚",
                    text: `${speaking.words_learned} speaking words learned`,
                    color: "text-purple-600",
                });
            }
            if (speaking.conversations_completed > 0) {
                items.push({
                    icon: "💬",
                    text: `${speaking.conversations_completed} AI conversation${speaking.conversations_completed > 1 ? "s" : ""}`,
                    color: "text-blue-600",
                });
            }
        }
        if (dashboard.total_quizzes > 0) {
            items.push({
                icon: "📝",
                text: `${dashboard.total_quizzes} quiz${dashboard.total_quizzes > 1 ? "zes" : ""} completed`,
                color: "text-emerald-600",
            });
        }
        if (dashboard.learned_words > 0) {
            items.push({
                icon: "📖",
                text: `${dashboard.learned_words} vocabulary words learned`,
                color: "text-amber-600",
            });
        }
        if (xp.xp > 0) {
            items.push({
                icon: "⭐",
                text: `${xp.xp} XP earned`,
                color: "text-orange-500",
            });
        }
        if (streak > 0) {
            items.push({
                icon: "🔥",
                text: `${streak} day streak`,
                color: "text-rose-500",
            });
        }
        return items.slice(0, 6);
    }, [speaking, dashboard, xp.xp, streak]);

    // --------------------------------------------
    // Derived: Badge Progress (from speaking badges)
    // --------------------------------------------
    const badgeProgress = useMemo(() => {
        return (speakingBadges || [])
            .slice()
            .sort((a, b) => {
                // Unlocked first, then by progress descending
                if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
                return (b.progress || 0) - (a.progress || 0);
            })
            .slice(0, 4);
    }, [speakingBadges]);

    // --------------------------------------------
    // Authentication Redirect
    // --------------------------------------------
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // --------------------------------------------
    // Loading
    // --------------------------------------------
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="mt-4 font-medium text-slate-600">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    // --------------------------------------------
    // Render
    // --------------------------------------------
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main
                className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:py-8"
                style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
            >
                {/* ===========================================
                    COMPACT HERO
                ============================================ */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-5 text-white shadow-xl md:p-8">
                    {/* Decorative Shapes */}
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
                    <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-white/10" />

                    <div className="relative z-10">
                        {/* Welcome + Avatar */}
                        <div className="flex items-center gap-4">
                            <UserAvatar name={userName} size="xl" ring className="shrink-0" />
                            <div className="min-w-0">
                                <h1 className="typo-page-title text-white">
                                    👋 Welcome,{" "}
                                    <span className="text-yellow-300 truncate">{userName}</span>
                                </h1>
                                <p className="mt-1 typo-secondary text-blue-100">
                                    Keep learning every day and become fluent.
                                </p>
                            </div>
                        </div>

                        {/* Compact Stats */}
                        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-5">
                            <StatCard icon="🏆" label="Level" value={xp.level} />
                            <StatCard icon="⭐" label="Total XP" value={xp.xp} />
                            <StatCard
                                icon="🎓"
                                label="Rank"
                                value={<span className="truncate text-lg font-bold md:mt-3 md:text-2xl">{xp.english_rank}</span>}
                            />
                            <StatCard icon="🔥" label="Streak" value={streak} sub="Days" />
                        </div>

                        {/* Level Progress */}
                        <div className="mt-6 md:mt-10">
                            <div className="mb-2 flex items-center justify-between typo-secondary text-white">
                                <span className="font-semibold">Level Progress</span>
                                <span>{xp.progress}/100 XP</span>
                            </div>
                            <ProgressBar
                                value={xp.progress}
                                max={100}
                                barClass="bg-yellow-400"
                                trackClass="bg-white/20"
                                height="h-3 md:h-4"
                            />
                        </div>

                        {/* Today's Goal */}
                        <div className="mt-5 rounded-2xl bg-white/15 p-4 backdrop-blur-md md:mt-8 md:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="typo-card-title text-white">🎯 Today's Goal</h2>
                                <span className="typo-button text-white">{todayProgress}/{DAILY_GOAL}</span>
                            </div>
                            <div className="mt-3">
                                <ProgressBar
                                    value={todayProgress}
                                    max={DAILY_GOAL}
                                    barClass="bg-green-400"
                                    trackClass="bg-white/20"
                                />
                            </div>
                            <p className="mt-2 typo-caption text-blue-100">
                                Complete today's learning target.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ===========================================
                    CONTINUE LEARNING
                ============================================ */}
                <section className="mt-6 md:mt-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="typo-section-title text-slate-900">▶️ Continue Learning</h2>
                    </div>

                    <button
                        type="button"
                        onClick={continueLearning.onClick}
                        className="flex w-full touch-manipulation items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl md:p-6"
                    >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl md:h-16 md:w-16">
                            {continueLearning.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-slate-900 md:text-lg truncate">
                                    {continueLearning.title}
                                </p>
                                {continueLearning.level && (
                                    <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                        {continueLearning.level}
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-sm text-slate-500">{continueLearning.stepLabel}</p>
                            <div className="mt-2">
                                <ProgressBar
                                    value={continueLearning.progress}
                                    max={100}
                                    barClass="from-blue-500 to-indigo-600"
                                    height="h-2"
                                />
                            </div>
                            {continueLearning.savedAt && (
                                <p className="mt-1 text-xs text-slate-400">
                                    Saved {timeAgo(continueLearning.savedAt)}
                                </p>
                            )}
                        </div>
                        <div className="shrink-0 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 md:px-5 md:py-3">
                            {continueLearning.cta} →
                        </div>
                    </button>
                </section>

                {/* ===========================================
                    QUICK ACTIONS
                ============================================ */}
                <section className="mt-6 md:mt-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="typo-section-title text-slate-900">⚡ Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
                        {[
                            { icon: "🔥", label: "Daily Challenge", sub: "Earn XP today", path: "/daily-challenge" },
                            { icon: "📚", label: "Vocabulary", sub: "Learn new words", path: "/vocabulary" },
                            { icon: "🗣️", label: "Speaking", sub: "Practice speaking", path: "/speaking-practice" },
                            { icon: "✍️", label: "Grammar", sub: "Improve writing", path: "/grammar-check" },
                        ].map((action) => (
                            <button
                                key={action.path}
                                type="button"
                                onClick={() => navigate(action.path)}
                                className="touch-manipulation rounded-2xl bg-white p-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl md:p-6"
                            >
                                <div className="text-3xl">{action.icon}</div>
                                <p className="mt-3 text-sm font-bold text-slate-900 md:text-base">{action.label}</p>
                                <p className="mt-1 text-xs text-slate-500">{action.sub}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ===========================================
                    SPEAKING PROGRESS (Accuracy / Pronunciation / Fluency)
                ============================================ */}
                {speaking && (
                    <section className="mt-6 md:mt-8">
                        <SectionCard
                            title="Speaking Progress"
                            icon="🗣️"
                            action={
                                <button
                                    type="button"
                                    onClick={() => navigate("/speaking-practice")}
                                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                                >
                                    Practice →
                                </button>
                            }
                        >
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {/* Pronunciation */}
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">Pronunciation</p>
                                    <p className={`mt-1 text-3xl font-bold ${scoreColor(speaking.average_pronunciation)}`}>
                                        {speaking.average_pronunciation || 0}
                                        <span className="text-base text-slate-400">/100</span>
                                    </p>
                                    <div className="mt-2">
                                        <ProgressBar
                                            value={speaking.average_pronunciation}
                                            max={100}
                                            barClass={scoreBarColor(speaking.average_pronunciation)}
                                            height="h-2"
                                        />
                                    </div>
                                </div>
                                {/* Accuracy */}
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">Accuracy</p>
                                    <p className={`mt-1 text-3xl font-bold ${scoreColor(speaking.average_accuracy)}`}>
                                        {speaking.average_accuracy || 0}
                                        <span className="text-base text-slate-400">/100</span>
                                    </p>
                                    <div className="mt-2">
                                        <ProgressBar
                                            value={speaking.average_accuracy}
                                            max={100}
                                            barClass={scoreBarColor(speaking.average_accuracy)}
                                            height="h-2"
                                        />
                                    </div>
                                </div>
                                {/* Fluency */}
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">Fluency</p>
                                    <p className={`mt-1 text-3xl font-bold ${scoreColor(speaking.average_fluency)}`}>
                                        {speaking.average_fluency || 0}
                                        <span className="text-base text-slate-400">/100</span>
                                    </p>
                                    <div className="mt-2">
                                        <ProgressBar
                                            value={speaking.average_fluency}
                                            max={100}
                                            barClass={scoreBarColor(speaking.average_fluency)}
                                            height="h-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Speaking stats summary */}
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl bg-indigo-50 p-3 text-center">
                                    <p className="text-xs text-slate-500">Lessons</p>
                                    <p className="mt-0.5 text-lg font-bold text-indigo-600">
                                        {speaking.completed_lessons || 0}/{speaking.total_lessons || 45}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-purple-50 p-3 text-center">
                                    <p className="text-xs text-slate-500">Words</p>
                                    <p className="mt-0.5 text-lg font-bold text-purple-600">
                                        {speaking.words_learned || 0}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-blue-50 p-3 text-center">
                                    <p className="text-xs text-slate-500">Sentences</p>
                                    <p className="mt-0.5 text-lg font-bold text-blue-600">
                                        {speaking.sentences_practiced || 0}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                                    <p className="text-xs text-slate-500">Conversations</p>
                                    <p className="mt-0.5 text-lg font-bold text-emerald-600">
                                        {speaking.conversations_completed || 0}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>
                    </section>
                )}

                {/* ===========================================
                    BADGE PROGRESS
                ============================================ */}
                {badgeProgress.length > 0 && (
                    <section className="mt-6 md:mt-8">
                        <SectionCard
                            title="Badge Progress"
                            icon="🏅"
                            action={
                                <button
                                    type="button"
                                    onClick={() => navigate("/speaking-practice")}
                                    className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                                >
                                    View All →
                                </button>
                            }
                        >
                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {badgeProgress.map((badge) => (
                                    <div
                                        key={badge.key}
                                        className={`flex items-center gap-3 rounded-2xl p-4 transition ${badge.unlocked
                                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 ring-1 ring-amber-200"
                                            : "bg-slate-50"
                                            }`}
                                    >
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${badge.unlocked ? "bg-amber-100" : "bg-slate-200 grayscale"
                                            }`}>
                                            {badge.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-bold text-slate-900">{badge.name}</p>
                                                {badge.unlocked ? (
                                                    <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                                                        ✓ Done
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 text-xs font-semibold text-slate-500">
                                                        {badge.current}/{badge.target}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="truncate text-xs text-slate-500">{badge.desc}</p>
                                            {!badge.unlocked && (
                                                <div className="mt-1.5">
                                                    <ProgressBar
                                                        value={badge.current}
                                                        max={badge.target}
                                                        barClass="from-amber-400 to-yellow-500"
                                                        height="h-1.5"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </section>
                )}

                {/* ===========================================
                    WEAK WORDS REVIEW
                ============================================ */}
                {reviewItems.length > 0 && (
                    <section className="mt-6 md:mt-8">
                        <SectionCard
                            title="Weak Words Review"
                            icon="🔍"
                            action={
                                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-600">
                                    {reviewItems.length} due
                                </span>
                            }
                        >
                            <div className="mt-4 space-y-2">
                                {reviewItems.slice(0, 4).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-800">
                                                {item.item_text}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {item.item_type === "sentence" ? "Sentence" : "Word"}
                                                {" · "}review #{item.review_count || 0}
                                            </p>
                                        </div>
                                        <span className={`ml-3 shrink-0 text-sm font-bold ${scoreColor(item.overall_score)}`}>
                                            {item.overall_score}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/speaking-practice")}
                                className="mt-4 w-full touch-manipulation rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                            >
                                Review Now →
                            </button>
                        </SectionCard>
                    </section>
                )}

                {/* ===========================================
                    DAILY OVERVIEW
                ============================================ */}
                <section className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-6">
                    {/* Learning Overview */}
                    <SectionCard
                        title="Learning Overview"
                        icon="📊"
                        action={
                            <button
                                type="button"
                                onClick={() => navigate("/progress")}
                                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                            >
                                View Progress →
                            </button>
                        }
                    >
                        <div className="mt-5 divide-y divide-slate-100">
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-slate-600">📚 Total Quizzes</span>
                                <span className="font-bold text-slate-900">{dashboard.total_quizzes}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-slate-600">🎯 Highest Score</span>
                                <span className="font-bold text-green-600">{dashboard.highest_score}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-slate-600">📈 Average Score</span>
                                <span className="font-bold text-orange-500">{dashboard.average_score}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-slate-600">📖 Learned Words</span>
                                <span className="font-bold text-purple-600">{dashboard.learned_words}</span>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Vocabulary Progress */}
                    <SectionCard
                        title="Vocabulary"
                        icon="📚"
                        action={
                            <span className="font-bold text-blue-600">{dashboard.progress}%</span>
                        }
                    >
                        <div className="mt-6">
                            <ProgressBar
                                value={dashboard.progress}
                                max={100}
                                barClass="from-blue-500 to-indigo-600"
                            />
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-purple-50 p-4">
                                <p className="text-xs text-slate-500">Learned</p>
                                <p className="mt-1 text-2xl font-bold text-purple-600">{dashboard.learned_words}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Total Words</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{dashboard.total_words}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/vocabulary")}
                            className="mt-5 w-full touch-manipulation rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                        >
                            Continue Vocabulary →
                        </button>
                    </SectionCard>
                </section>

                {/* ===========================================
                    RECENT ACTIVITY
                ============================================ */}
                {recentActivity.length > 0 && (
                    <section className="mt-6 md:mt-8">
                        <SectionCard title="Recent Activity" icon="📋">
                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {recentActivity.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className={`text-sm font-medium ${item.color}`}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </section>
                )}

                {/* ===========================================
                    AI RECOMMENDATION
                ============================================ */}
                <section className="mt-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-700 p-5 text-white shadow-xl md:mt-8 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                            🤖
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="typo-stat-label text-blue-200">
                                Lingora AI Recommendation
                            </p>
                            <h2 className="mt-1 typo-section-title text-white">
                                {speaking && speaking.daily_goal_done
                                    ? "Practice Speaking next"
                                    : "Practice Grammar today"}
                            </h2>
                            <p className="mt-2 typo-ai-tip text-blue-100">
                                {speaking && speaking.daily_goal_done
                                    ? "You've completed today's speaking goal. Keep the momentum going with a conversation practice!"
                                    : "Complete today's Daily Challenge and practice Grammar to improve your English and earn more XP."}
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate(speaking && speaking.daily_goal_done ? "/speaking-practice" : "/ai-chat")}
                                className="mt-4 touch-manipulation rounded-xl bg-yellow-400 px-5 py-3 typo-button text-slate-900 transition hover:bg-yellow-300"
                            >
                                {speaking && speaking.daily_goal_done ? "Practice Speaking →" : "Open AI Teacher →"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ===========================================
                    WEEKLY GOAL
                ============================================ */}
                <section className="mt-6 rounded-3xl bg-white p-5 shadow-lg md:mt-8 md:p-7">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 md:text-2xl">📅 Weekly Goal</h2>
                        <span className="font-bold text-indigo-600">{weeklyProgress}/{WEEKLY_GOAL}</span>
                    </div>
                    <div className="mt-4">
                        <ProgressBar
                            value={weeklyProgress}
                            max={WEEKLY_GOAL}
                            barClass="from-indigo-500 to-purple-600"
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Stay consistent throughout the week.</p>
                </section>
            </main>

            {/* NOTE: The floating AI button is intentionally NOT rendered here.
                MainLayout already provides a single global Lingora AI floating
                button, so a duplicate here would cause two overlapping buttons
                on mobile. Keeping only one AI assistant entry point. */}
        </div>
    );
}
