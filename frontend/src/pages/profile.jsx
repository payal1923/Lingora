import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
    Pencil,
    Mail,
    CalendarDays,
    Sparkles,
    Map as MapIcon,
    Bot,
    Target,
    TrendingUp,
    BookOpen,
    Flame,
    Library,
    SpellCheck2,
    Mic,
    Lock,
    Bell,
    ShieldCheck,
    LogOut,
    Globe2,
    Clock,
    GraduationCap,
    Gauge,
    ChevronRight,
    CheckCircle2,
    MessageCircle,
    Headphones,
} from "lucide-react";

import UserAvatar from "../components/UserAvatar";
import ProfilePhotoUploader from "../components/ProfilePhotoUploader";
import OptionPickerModal from "../components/OptionPickerModal";
import NotificationsSettingsModal from "../components/NotificationsSettingsModal";
import PrivacySettingsModal from "../components/PrivacySettingsModal";

import {
    ACCENTS,
    TEACHING_LANGUAGES,
    LEARNING_GOALS,
    DAILY_GOALS,
    STUDY_TIMES,
    DIFFICULTIES,
    setPreference,
    setPreferredAccent,
} from "../config/preferences";
import { usePreference } from "../Hooks/preferencesHooks";

/* ------------------------------------------------------------------ */
/* Static data (journey + achievements + recent activity)             */
/* ------------------------------------------------------------------ */

const timeline = [
    {
        title: "Joined Lingora",
        description: "Started the journey toward better English.",
        date: "Started",
        icon: Sparkles,
    },
    {
        title: "Started Learning Roadmap",
        description: "Began structured English learning with Lingora.",
        date: "Learning",
        icon: MapIcon,
    },
    {
        title: "AI English Practice",
        description: "Practiced English with Lingora AI Teacher.",
        date: "AI Practice",
        icon: Bot,
    },
    {
        title: "Daily Challenge",
        description: "Started improving English with daily questions.",
        date: "Challenge",
        icon: Target,
    },
    {
        title: "Growing Every Day",
        description: "Continuing the journey toward English fluency.",
        date: "In Progress",
        icon: TrendingUp,
    },
];

const achievements = [
    { label: "First Lesson", icon: BookOpen, unlocked: true, from: "from-sky-400", to: "to-blue-600" },
    { label: "7 Day Streak", icon: Flame, unlocked: true, from: "from-orange-400", to: "to-red-500" },
    { label: "Vocabulary Explorer", icon: Library, unlocked: true, from: "from-emerald-400", to: "to-teal-600" },
    { label: "AI Explorer", icon: Bot, unlocked: true, from: "from-violet-400", to: "to-indigo-600" },
    { label: "Challenge Master", icon: Target, unlocked: false, from: "from-rose-400", to: "to-pink-600" },
    { label: "Roadmap Completer", icon: MapIcon, unlocked: false, from: "from-amber-400", to: "to-orange-600" },
    { label: "Grammar Hero", icon: SpellCheck2, unlocked: false, from: "from-cyan-400", to: "to-sky-600" },
    { label: "Speaking Star", icon: Mic, unlocked: false, from: "from-fuchsia-400", to: "to-purple-600" },
];

const recentActivities = [
    { title: "Practiced with AI Teacher", description: "Asked Lingora AI an English learning question.", icon: Bot },
    { title: "Visited Learning Roadmap", description: "Continued the structured English learning journey.", icon: MapIcon },
    { title: "Daily English Practice", description: "Stayed active on Lingora.", icon: CheckCircle2 },
    { title: "Conversation Practice", description: "Improved spoken English with AI conversation.", icon: MessageCircle },
];

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function SectionHeading({ eyebrow, title }) {
    return (
        <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <h2 className="typo-section-title text-slate-900">
                {title}
            </h2>
            <span className="typo-stat-label text-indigo-400/80">
                {eyebrow}
            </span>
        </div>
    );
}

function Card({ children, className = "" }) {
    return (
        <div
            className={`rounded-3xl bg-white border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(30,27,75,0.18)] ${className}`}
        >
            {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Preference row — tappable, opens an OptionPickerModal              */
/* ------------------------------------------------------------------ */

function PreferenceRow({ icon: Icon, label, value, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all duration-200 text-left touch-manipulation min-h-[56px] cursor-pointer"
        >
            <div className="h-11 w-11 shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-indigo-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{value}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0" strokeWidth={2} />
        </button>
    );
}

/* ------------------------------------------------------------------ */
/* Main Profile component                                              */
/* ------------------------------------------------------------------ */

export default function Profile() {
    const navigate = useNavigate();
    const [hoveredAchievement, setHoveredAchievement] = useState(null);

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}") || {};
        } catch {
            return {};
        }
    });

    // Live preferences (re-render when changed anywhere in the app).
    const [preferredAccent] = usePreference("preferredAccent");
    const [teachingLanguage] = usePreference("teachingLanguage");
    const [learningGoal] = usePreference("learningGoal");
    const [dailyGoal] = usePreference("dailyGoal");
    const [studyTime] = usePreference("studyTime");
    const [difficulty] = usePreference("difficulty");

    // Edit-profile modal
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: user.full_name || user.fullName || user.name || "",
        email: user.email || "",
    });

    // Settings modals
    const [showNotifications, setShowNotifications] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    // Option-picker modal state
    const [picker, setPicker] = useState(null); // { title, subtitle, options, value, onSelect, accentDemo }

    const fullName = user.full_name || user.fullName || user.name || "Lingora Learner";
    const email = user.email || "Email not available";
    const joinDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "Lingora Member";

    // Resolve human-readable labels for the current preferences.
    const accentLabel = useMemo(
        () => ACCENTS.find((a) => a.key === preferredAccent)?.label || "American English",
        [preferredAccent]
    );
    const teachingLangLabel = useMemo(
        () => TEACHING_LANGUAGES.find((l) => l.code === teachingLanguage)?.label || "English",
        [teachingLanguage]
    );
    const learningGoalLabel = useMemo(
        () => LEARNING_GOALS.find((g) => g.key === learningGoal)?.label || "Daily Conversation",
        [learningGoal]
    );
    const dailyGoalLabel = useMemo(() => {
        const g = DAILY_GOALS.find((d) => d.key === dailyGoal);
        return g ? `${g.label} · ${g.minutes} min/day` : "Regular · 20 min/day";
    }, [dailyGoal]);
    const studyTimeLabel = useMemo(
        () => STUDY_TIMES.find((s) => s.key === studyTime)?.label || "Flexible",
        [studyTime]
    );
    const difficultyLabel = useMemo(
        () => DIFFICULTIES.find((d) => d.key === difficulty)?.label || "Beginner",
        [difficulty]
    );

    /* ---------------- Handlers ---------------- */

    const handleOpenEditProfile = () => {
        setEditForm({
            full_name: user.full_name || user.fullName || user.name || "",
            email: user.email || "",
        });
        setShowEditProfile(true);
    };

    const handleSaveProfile = (event) => {
        event.preventDefault();
        const updatedFullName = editForm.full_name.trim();
        const updatedEmail = editForm.email.trim();
        if (!updatedFullName || !updatedEmail) {
            alert("Full name and email are required.");
            return;
        }
        const updatedUser = {
            ...user,
            full_name: updatedFullName,
            fullName: updatedFullName,
            name: updatedFullName,
            email: updatedEmail,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowEditProfile(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleAccountAction = (action) => {
        switch (action) {
            case "Edit Profile":
                handleOpenEditProfile();
                break;
            case "Change Password":
                navigate("/forgot-password");
                break;
            case "Notification Settings":
                setShowNotifications(true);
                break;
            case "Privacy Settings":
                setShowPrivacy(true);
                break;
            case "Logout":
                handleLogout();
                break;
            default:
                break;
        }
    };

    const accountActions = [
        { label: "Edit Profile", icon: Pencil, tone: "default" },
        { label: "Change Password", icon: Lock, tone: "default" },
        { label: "Notification Settings", icon: Bell, tone: "default" },
        { label: "Privacy Settings", icon: ShieldCheck, tone: "default" },
        { label: "Logout", icon: LogOut, tone: "danger" },
    ];

    /* ---------------- Preference pickers ---------------- */

    const openAccentPicker = () =>
        setPicker({
            title: "Preferred English Accent",
            subtitle: "Hear each accent, then choose. Updates instantly across all audio.",
            options: ACCENTS.map((a) => ({
                key: a.key,
                label: a.label,
                flag: a.flag,
                hint: a.description,
                sample: a.sample,
                lang: a.lang,
            })),
            value: preferredAccent,
            onSelect: (key) => {
                setPreferredAccent(key);
                setPicker(null);
            },
            accentDemo: true,
        });

    const openTeachingLanguagePicker = () =>
        setPicker({
            title: "Teaching Language",
            subtitle: "The language Lingora AI uses to explain grammar, vocabulary, and feedback.",
            options: TEACHING_LANGUAGES.map((l) => ({
                key: l.code,
                label: l.label,
                flag: l.flag,
            })),
            value: teachingLanguage,
            onSelect: (key) => {
                setPreference("teachingLanguage", key);
                setPicker(null);
            },
        });

    const openLearningGoalPicker = () =>
        setPicker({
            title: "Learning Goal",
            subtitle: "What do you want to achieve with English?",
            options: LEARNING_GOALS.map((g) => ({
                key: g.key,
                label: g.label,
                icon: g.icon,
            })),
            value: learningGoal,
            onSelect: (key) => {
                setPreference("learningGoal", key);
                setPicker(null);
            },
        });

    const openDailyGoalPicker = () =>
        setPicker({
            title: "Daily Goal",
            subtitle: "How much time do you want to spend each day?",
            options: DAILY_GOALS.map((g) => ({
                key: g.key,
                label: `${g.label} · ${g.minutes} min`,
                icon: g.icon,
                hint: `${g.xp} XP per day`,
            })),
            value: dailyGoal,
            onSelect: (key) => {
                setPreference("dailyGoal", key);
                setPicker(null);
            },
        });

    const openStudyTimePicker = () =>
        setPicker({
            title: "Preferred Study Time",
            subtitle: "When do you usually study?",
            options: STUDY_TIMES.map((s) => ({
                key: s.key,
                label: s.label,
                icon: s.icon,
                hint: s.hint,
            })),
            value: studyTime,
            onSelect: (key) => {
                setPreference("studyTime", key);
                setPicker(null);
            },
        });

    const openDifficultyPicker = () =>
        setPicker({
            title: "Preferred Difficulty",
            subtitle: "The challenge level for your lessons.",
            options: DIFFICULTIES.map((d) => ({
                key: d.key,
                label: d.label,
                icon: d.icon,
            })),
            value: difficulty,
            onSelect: (key) => {
                setPreference("difficulty", key);
                setPicker(null);
            },
        });

    const preferencesRows = [
        { icon: Headphones, label: "Preferred English Accent", value: accentLabel, onClick: openAccentPicker },
        { icon: Globe2, label: "Teaching Language", value: teachingLangLabel, onClick: openTeachingLanguagePicker },
        { icon: GraduationCap, label: "Learning Goal", value: learningGoalLabel, onClick: openLearningGoalPicker },
        { icon: Gauge, label: "Daily Goal", value: dailyGoalLabel, onClick: openDailyGoalPicker },
        { icon: Clock, label: "Preferred Study Time", value: studyTimeLabel, onClick: openStudyTimePicker },
        { icon: TrendingUp, label: "Preferred Difficulty", value: difficultyLabel, onClick: openDifficultyPicker },
    ];

    return (
        <div className="min-h-screen bg-[#F7F7FB]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 sm:space-y-12 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                {/* HERO PROFILE — display only, no photo editing here */}
                <section className="relative overflow-hidden rounded-[32px] shadow-[0_20px_60px_-20px_rgba(49,26,129,0.45)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
                    <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/10" />
                    <div className="absolute -right-6 -top-6 h-56 w-56 rounded-full border border-white/10" />
                    <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full border border-white/10" />

                    <div className="relative px-6 py-10 sm:px-10 sm:py-12">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                            <div className="shrink-0 mx-auto sm:mx-0">
                                <div className="rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/40 overflow-hidden">
                                    <UserAvatar
                                        name={fullName}
                                        size="2xl"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl text-white tracking-tight font-bold">
                                    {fullName}
                                </h1>
                                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-white/80 text-sm">
                                    <span className="inline-flex items-center gap-1.5 justify-center">
                                        <Mail className="h-4 w-4" strokeWidth={2} />
                                        {email}
                                    </span>
                                    <span className="hidden sm:inline text-white/30">•</span>
                                    <span className="inline-flex items-center gap-1.5 justify-center">
                                        <CalendarDays className="h-4 w-4" strokeWidth={2} />
                                        {joinDate}
                                    </span>
                                </div>
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/90">
                                    Lingora Learner
                                </div>
                            </div>

                            <div className="sm:self-start">
                                <button
                                    type="button"
                                    onClick={handleOpenEditProfile}
                                    className="inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-indigo-50 hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px]"
                                >
                                    <Pencil className="h-4 w-4" strokeWidth={2.25} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LEARNING JOURNEY */}
                <section>
                    <SectionHeading eyebrow="Your story so far" title="Learning Journey" />
                    <Card className="px-6 py-8 sm:px-10 sm:py-10">
                        <div className="relative">
                            <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent" />
                            <ol className="space-y-9">
                                {timeline.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <li key={`${step.title}-${index}`} className="relative pl-16 group">
                                            <div className="absolute left-0 top-0 h-14 w-14 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center shadow-sm group-hover:border-indigo-500 group-hover:shadow-md transition-all duration-300">
                                                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-white" strokeWidth={2.25} />
                                                </div>
                                            </div>
                                            <div className="pt-1">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <h3 className="text-[15px] font-semibold text-slate-900">{step.title}</h3>
                                                    <span className="text-xs font-medium text-indigo-500 bg-indigo-50 rounded-full px-2.5 py-0.5">
                                                        {step.date}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </Card>
                </section>

                {/* ACHIEVEMENTS */}
                <section>
                    <SectionHeading eyebrow="Badges earned & waiting" title="Achievements" />
                    <Card className="px-6 py-8 sm:px-10 sm:py-10">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
                            {achievements.map((badge, index) => {
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={`${badge.label}-${index}`}
                                        onMouseEnter={() => setHoveredAchievement(index)}
                                        onMouseLeave={() => setHoveredAchievement(null)}
                                        className={`relative flex flex-col items-center text-center gap-3 rounded-2xl px-3 py-6 transition-all duration-300 ${badge.unlocked ? "hover:bg-slate-50 hover:-translate-y-0.5" : "opacity-80"
                                            }`}
                                    >
                                        <div
                                            className={`relative h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${badge.unlocked
                                                ? `bg-gradient-to-br ${badge.from} ${badge.to} shadow-lg ${hoveredAchievement === index ? "scale-110" : ""
                                                }`
                                                : "bg-slate-100 border border-dashed border-slate-300"
                                                }`}
                                        >
                                            <Icon
                                                className={`h-7 w-7 ${badge.unlocked ? "text-white" : "text-slate-300"}`}
                                                strokeWidth={2}
                                            />
                                            {!badge.unlocked && (
                                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                                    <Lock className="h-3 w-3 text-slate-400" strokeWidth={2.5} />
                                                </div>
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs font-semibold leading-tight ${badge.unlocked ? "text-slate-800" : "text-slate-400"
                                                }`}
                                        >
                                            {badge.label}
                                        </span>
                                        <span
                                            className={`text-[10px] font-medium ${badge.unlocked ? "text-emerald-600" : "text-slate-400"
                                                }`}
                                        >
                                            {badge.unlocked ? "Unlocked" : "Locked"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </section>

                {/* LEARNING PREFERENCES */}
                <section>
                    <SectionHeading eyebrow="How you like to learn" title="Learning Preferences" />
                    <Card className="px-6 py-8 sm:px-10 sm:py-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {preferencesRows.map((row) => (
                                <PreferenceRow
                                    key={row.label}
                                    icon={row.icon}
                                    label={row.label}
                                    value={row.value}
                                    onClick={row.onClick}
                                />
                            ))}
                        </div>
                        <p className="mt-5 text-xs text-slate-400 leading-relaxed">
                            Changes save instantly and apply across Speaking, Lingora AI, Vocabulary, and Lesson audio.
                        </p>
                    </Card>
                </section>

                {/* RECENT ACTIVITY */}
                <section>
                    <SectionHeading eyebrow="Your latest learning activity" title="Recent Activity" />
                    <Card className="overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {recentActivities.map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                    <div
                                        key={`${activity.title}-${index}`}
                                        className="flex items-center gap-4 px-6 py-5 sm:px-8 hover:bg-slate-50/80 transition-colors duration-200"
                                    >
                                        <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                                            <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-slate-900">{activity.title}</h3>
                                            <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-300" strokeWidth={2} />
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </section>

                {/* ACCOUNT SETTINGS */}
                <section>
                    <SectionHeading eyebrow="Manage your Lingora account" title="Account Settings" />
                    <Card className="overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {accountActions.map((action, index) => {
                                const Icon = action.icon;
                                const isDanger = action.tone === "danger";
                                return (
                                    <button
                                        key={`${action.label}-${index}`}
                                        type="button"
                                        onClick={() => handleAccountAction(action.label)}
                                        className="w-full flex items-center gap-4 px-6 py-5 sm:px-8 text-left hover:bg-slate-50 transition-colors duration-200 group touch-manipulation min-h-[56px] cursor-pointer"
                                    >
                                        <div
                                            className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDanger ? "bg-red-50" : "bg-indigo-50"
                                                }`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${isDanger ? "text-red-500" : "text-indigo-600"}`}
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <span
                                            className={`flex-1 text-sm font-semibold ${isDanger ? "text-red-500" : "text-slate-800"
                                                }`}
                                        >
                                            {action.label}
                                        </span>
                                        {!isDanger && (
                                            <ChevronRight
                                                className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-200"
                                                strokeWidth={2}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                </section>
            </div>

            {/* EDIT PROFILE MODAL — photo, name, email only */}
            {showEditProfile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <button
                        type="button"
                        aria-label="Close edit profile"
                        onClick={() => setShowEditProfile(false)}
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                    />
                    <div className="relative z-10 w-full max-w-lg rounded-[28px] bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-6 sm:px-8">
                            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                            <p className="mt-1 text-sm text-white/70">
                                Update your Lingora profile information.
                            </p>
                        </div>
                        <form onSubmit={handleSaveProfile} className="px-6 py-7 sm:px-8">
                            {/* Profile Photo section */}
                            <div className="flex flex-col items-center text-center">
                                <p className="text-sm font-semibold text-slate-800 mb-3">Profile Photo</p>
                                <ProfilePhotoUploader
                                    name={fullName}
                                    size="xl"
                                />
                            </div>

                            <div className="mt-7">
                                <label htmlFor="profile-full-name" className="block text-sm font-semibold text-slate-800 mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="profile-full-name"
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({ ...previous, full_name: event.target.value }))
                                    }
                                    placeholder="Enter your full name"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>
                            <div className="mt-5">
                                <label htmlFor="profile-email" className="block text-sm font-semibold text-slate-800 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({ ...previous, email: event.target.value }))
                                    }
                                    placeholder="Enter your email"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>
                            <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditProfile(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer touch-manipulation min-h-[48px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer touch-manipulation min-h-[48px]"
                                >
                                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Option picker modal (accent / teaching language / goals / etc.) */}
            <OptionPickerModal
                open={!!picker}
                title={picker?.title}
                subtitle={picker?.subtitle}
                options={picker?.options}
                value={picker?.value}
                onSelect={picker?.onSelect}
                onClose={() => setPicker(null)}
                accentDemo={picker?.accentDemo}
            />

            {/* Notifications settings modal */}
            <NotificationsSettingsModal open={showNotifications} onClose={() => setShowNotifications(false)} />

            {/* Privacy settings modal */}
            <PrivacySettingsModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </div>
    );
}