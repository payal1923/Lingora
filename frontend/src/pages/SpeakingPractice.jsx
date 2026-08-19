import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Data
import {
    ALL_SPEAKING_LESSONS,
    getLessonByKey,
} from "../data/speakingCourseData";

// Service
import speakingService from "../services/speakingService";

// Hooks
import useAvatarStateMachine from "../Hooks/useAvatarStateMachine";
import useLessonResume from "../Hooks/useLessonResume";

// Components (always-on: cheap, used in roadmap view)
import SpeakingDashboard from "../components/speaking/SpeakingDashboard";
import LevelSelector from "../components/speaking/LevelSelector";
import LessonGrid from "../components/speaking/LessonGrid";
import LessonProgress from "../components/speaking/LessonProgress";
import SpeakingAvatar from "../components/speaking/SpeakingAvatar";
import StatisticsPanel from "../components/speaking/StatisticsPanel";
import BadgesPanel from "../components/speaking/BadgesPanel";
import DailyGoal from "../components/speaking/DailyGoal";
import ResumeModal from "../components/speaking/ResumeModal";
import UserAvatar from "../components/UserAvatar";

// Lazy-loaded lesson components (Section 8: only loaded when a lesson starts)
const VocabularyPractice = lazy(() => import("../components/speaking/VocabularyPractice"));
const SentencePractice = lazy(() => import("../components/speaking/SentencePractice"));
const ConversationPractice = lazy(() => import("../components/speaking/ConversationPractice"));
const LessonSummary = lazy(() => import("../components/speaking/LessonSummary"));

/**
 * SpeakingPractice
 * ---------------
 * The redesigned Lingora AI Speaking Course.
 *
 * Views:
 *   - "roadmap"   : dashboard + level selector + lesson grid + stats/badges
 *   - "lesson"    : a single lesson (vocabulary → sentences → conversation → summary)
 *
 * Progress auto-saves via the backend speaking service.
 */
export default function SpeakingPractice() {
    const navigate = useNavigate();

    const [view, setView] = useState("roadmap"); // "roadmap" | "lesson"
    const [activeLevel, setActiveLevel] = useState("beginner");
    const [roadmap, setRoadmap] = useState([]); // from backend
    const [dashboard, setDashboard] = useState({});
    const [stats, setStats] = useState({});
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Current lesson state
    const [currentLesson, setCurrentLesson] = useState(null);
    const [lessonStep, setLessonStep] = useState("vocabulary"); // vocabulary|sentences|conversation|summary
    const [vocabIndex, setVocabIndex] = useState(0);
    const [sentenceIndex, setSentenceIndex] = useState(0);

    // Avatar state machine — guarantees the avatar never stays "speaking"
    // after a lesson ends. Drives: idle → ready → listening/thinking/speaking
    // → happy (celebration) → completed.
    const avatar = useAvatarStateMachine();

    // Resume lesson (Section 3): auto-save + "Continue where you left off?"
    const resume = useLessonResume();

    // Read any saved in-progress lesson once, synchronously, via a lazy
    // initial state. This avoids a setState-in-effect for the resume prompt
    // (React's rules prefer deriving initial state over effects here).
    const [resumePrompt, setResumePrompt] = useState(null);

    const [lessonScores, setLessonScores] = useState([]); // collected scores
    const [lessonXp, setLessonXp] = useState(0);
    const [lessonSummary, setLessonSummary] = useState(null);
    const [xpPopup, setXpPopup] = useState(null); // {amount, id}

    // ---------- Load roadmap + dashboard ----------
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [road, dash, stat, bad] = await Promise.all([
                speakingService.getRoadmap().catch(() => ({ roadmap: [] })),
                speakingService.getDashboard().catch(() => ({})),
                speakingService.getStatistics().catch(() => ({})),
                speakingService.getBadges().catch(() => ({ badges: [] })),
            ]);
            setRoadmap(road.roadmap || []);
            const saved = resume.getSavedLesson();

            if (saved) {
                const lesson = ALL_SPEAKING_LESSONS.find(
                    (l) => l.key === saved.lessonKey
                );

                const roadmapLesson = (road.roadmap || []).find(
                    (l) => l.key === saved.lessonKey
                );

                if (!lesson || roadmapLesson?.completed) {
                    // Lesson already finished → don't show popup
                    resume.clearLesson();
                    setResumePrompt(null);
                } else {
                    // Lesson is still incomplete → show popup
                    setResumePrompt({
                        ...saved,
                        lesson,
                    });
                }
            }
            setDashboard(dash);
            setStats(stat);
            setBadges(bad.badges || []);
            // Default to the level of the current lesson
            if (dash.current_lesson_key) {
                const lvl = dash.current_lesson_key.split("-")[0];
                setActiveLevel(lvl);
            }
        } catch {
            // If not logged in, redirect
            const user = JSON.parse(localStorage.getItem("user") || "null");
            if (!user) navigate("/login");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        // Defer to a microtask so the synchronous setLoading(true) inside
        // loadAll does not run synchronously in the effect body (avoids
        // react-hooks/set-state-in-effect cascading renders).
        let cancelled = false;
        Promise.resolve().then(() => {
            if (!cancelled) loadAll();
        });
        return () => {
            cancelled = true;
        };
    }, [loadAll]);

    // ---------- Build status map from roadmap ----------
    const statusMap = {};
    roadmap.forEach((r) => {
        statusMap[r.key] = {
            status: r.locked
                ? "locked"
                : r.completed
                    ? "completed"
                    : "current",
            score: r.score || 0,
        };
    });
    // If no roadmap yet, derive from static data (all locked except first)
    if (roadmap.length === 0) {
        ALL_SPEAKING_LESSONS.forEach((l, i) => {
            statusMap[l.key] = {
                status: i === 0 ? "current" : "locked",
                score: 0,
            };
        });
    }

    // ---------- Level counts ----------
    const levelCounts = {};
    ["beginner", "intermediate", "advanced"].forEach((lvl) => {
        const lessons = roadmap.filter((r) => r.key.startsWith(lvl + "-"));
        levelCounts[lvl] = {
            completed: lessons.filter((r) => r.completed).length,
            total: lessons.length || 15,
        };
    });

    // ---------- XP popup animation ----------
    useEffect(() => {
        if (!xpPopup) return;
        const t = setTimeout(() => setXpPopup(null), 1800);
        return () => clearTimeout(t);
    }, [xpPopup]);

    const handleXp = useCallback((amount) => {
        if (!amount) return;
        setLessonXp((x) => x + amount);
        setXpPopup({ amount, id: Date.now() });
    }, []);

    const handleScore = useCallback((score) => {
        setLessonScores((prev) => [...prev, score]);
    }, []);

    // ---------- Avatar state bridge ----------
    // The practice components emit string-based avatar states via onAvatarState.
    // This adapter maps them onto the state machine's typed setters so the
    // avatar lifecycle stays correct (and "happy" only fires on completion).
    const handleAvatarState = useCallback(
        (value) => {
            if (value === "speaking") avatar.setSpeaking(true);
            else if (value === "thinking") avatar.setThinking(true);
            else if (value === "listening") avatar.setListening(true);
            else if (value === "happy") {
                // Per-item happy reactions are handled as a brief speaking pause;
                // the true celebration fires on lesson completion via complete().
                avatar.setSpeaking(false);
            } else {
                // "idle" / "encouraging" / anything else -> clear active state
                avatar.clearActive();
            }
        },
        [avatar]
    );

    // Mic listening changes (user speaking) -> avatar "listening".
    const handleListening = useCallback(
        (isListening) => avatar.setListening(isListening),
        [avatar]
    );

    // ---------- Start a lesson ----------
    // savedState is optional — when provided (resume), it restores the
    // lesson to exactly where the user left off.
    const startLesson = (lesson, savedState = null) => {
        const full = getLessonByKey(lesson.key) || lesson;
        setCurrentLesson(full);
        setLessonStep(savedState?.step || "vocabulary");
        setVocabIndex(savedState?.vocabIndex || 0);
        setSentenceIndex(savedState?.sentenceIndex || 0);
        setLessonScores(savedState?.lessonScores || []);
        setLessonXp(savedState?.lessonXp || 0);
        setLessonSummary(null);
        setResumePrompt(null);
        avatar.start(); // idle -> ready
        setView("lesson");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleResumeContinue = () => {
        if (!resumePrompt) return;
        startLesson(resumePrompt.lesson, resumePrompt);
    };

    const handleResumeRestart = () => {
        if (resumePrompt) {
            resume.clearLesson();
            startLesson(resumePrompt.lesson);
        }
        setResumePrompt(null);
    };

    // ---------- Auto-save lesson state (Section 3) ----------
    // Continuously persist progress so the user can resume after closing.
    useEffect(() => {
        if (view !== "lesson" || !currentLesson) return;
        // Don't save the summary step — the lesson is complete.
        if (lessonStep === "summary") {
            resume.clearLesson();
            return;
        }
        const hasProgress =
            vocabIndex > 0 ||
            sentenceIndex > 0 ||
            lessonStep !== "vocabulary";

        if (!hasProgress) {
            return;
        }
        resume.saveLesson({
            lessonKey: currentLesson.key,
            lessonTitle: currentLesson.title,
            level: currentLesson.level,
            lessonIndex: currentLesson.lessonIndex,
            step: lessonStep,
            vocabIndex,
            sentenceIndex,
            lessonXp,
            lessonScores,
            avatarState: avatar.state,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, currentLesson, lessonStep, vocabIndex, sentenceIndex, lessonXp, lessonScores, avatar.state]);

    // Flush a final save immediately on exit (before unmount/navigation).
    useEffect(() => {
        return () => {
            if (view === "lesson" && currentLesson && lessonStep !== "summary") {
                resume.saveLessonNow({
                    lessonKey: currentLesson.key,
                    lessonTitle: currentLesson.title,
                    level: currentLesson.level,
                    lessonIndex: currentLesson.lessonIndex,
                    step: lessonStep,
                    vocabIndex,
                    sentenceIndex,
                    lessonXp,
                    lessonScores,
                    avatarState: avatar.state,
                });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, currentLesson, lessonStep]);

    // ---------- Lesson step transitions ----------
    const handleVocabComplete = () => {
        setLessonStep("sentences");
        setSentenceIndex(0);
        avatar.clearActive();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSentencesComplete = () => {
        setLessonStep("conversation");
        avatar.clearActive();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleConversationComplete = async () => {
        // Compute final lesson score
        const avg =
            lessonScores.length > 0
                ? Math.round(
                    lessonScores.reduce((a, b) => a + b, 0) / lessonScores.length
                )
                : 80;
        const perfect = avg >= 90;
        const perfectConversation = avg >= 95;

        try {
            const res = await speakingService.completeLesson({
                lesson_key: `${currentLesson.levelId}-${currentLesson.lessonIndex}`,
                level: currentLesson.level,
                lesson_index: currentLesson.lessonIndex,
                score: avg,
                words_learned: currentLesson.vocabulary.length,
                sentences_practiced: currentLesson.sentences.length,
                conversation_completed: true,
                perfect,
                perfect_conversation: perfectConversation,
            });

            setLessonSummary({
                score: avg,
                xp: (res.xp_earned || 0) + lessonXp,
                wordsLearned: currentLesson.vocabulary.length,
                sentencesPracticed: currentLesson.sentences.length,
                conversationCompleted: true,
                perfect,
                perfectConversation,
                newAchievements: res.new_achievements || [],
            });
        } catch {
            // Fallback summary even if backend fails
            setLessonSummary({
                score: avg,
                xp: lessonXp,
                wordsLearned: currentLesson.vocabulary.length,
                sentencesPracticed: currentLesson.sentences.length,
                conversationCompleted: true,
                perfect,
                perfectConversation,
                newAchievements: [],
            });
        }

        setLessonStep("summary");
        // Lesson complete — clear any saved resume state so we don't prompt
        // the user to "continue" a finished lesson.
        resume.clearLesson();
        // Trigger the celebration: happy (2.5s) -> completed.
        avatar.complete();
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Refresh dashboard + roadmap in background
        loadAll();
    };

    // ---------- Next lesson ----------
    const handleNextLesson = () => {
        const idx = ALL_SPEAKING_LESSONS.findIndex(
            (l) => l.key === currentLesson.key
        );
        const next = ALL_SPEAKING_LESSONS[idx + 1];
        if (next) {
            startLesson(next); // start() resets the avatar to "ready"
        } else {
            // Course complete
            avatar.reset();
            setView("roadmap");
            loadAll();
        }
    };

    const handleBackToRoadmap = () => {
        // Exiting mid-lesson keeps the auto-saved state (so the user can resume
        // later). Only completed lessons clear it.
        setView("roadmap");
        setCurrentLesson(null);
        avatar.reset(); // back to idle on the roadmap
        loadAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ---------- Render ----------
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">
                        Loading your speaking course…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 pb-16"
            // Android safe-area insets so content isn't hidden under the status
            // bar / navigation bar in the Capacitor WebView.
            style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
            }}
        >
            {/* XP popup */}
            {xpPopup && (
                <div
                    key={xpPopup.id}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold shadow-2xl animate-[fadeIn_0.3s_ease] pointer-events-none"
                >
                    ⚡ +{xpPopup.amount} XP
                </div>
            )}

            {/* Resume lesson prompt (Section 3) */}
            <ResumeModal
                open={!!resumePrompt}
                saved={resumePrompt}
                onContinue={handleResumeContinue}
                onRestart={handleResumeRestart}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* ---------- ROADMAP VIEW ---------- */}
                {view === "roadmap" && (
                    <div className="space-y-6">
                        {/* Hero header */}
                        <div className="flex flex-col items-center text-center mb-2">
                            <UserAvatar
                                name={JSON.parse(localStorage.getItem("user"))?.full_name || "Learner"}
                                size="xl"
                                ring
                                className="mb-3"
                            />
                            <h1 className="typo-page-title text-slate-800">
                                🎤 Lingora AI Speaking Course
                            </h1>
                            <p className="typo-body text-slate-500 mt-2 max-w-2xl mx-auto">
                                Master English speaking with 45 AI-powered lessons. Learn
                                vocabulary, practice sentences, and have real conversations
                                with your AI tutor.
                            </p>
                        </div>

                        {/* Dashboard */}
                        <SpeakingDashboard data={dashboard} />

                        {/* Daily goal + Avatar row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2">
                                <DailyGoal data={dashboard} />
                            </div>
                            <SpeakingAvatar state="idle" />
                        </div>

                        {/* Level selector */}
                        <div>
                            <h2 className="typo-section-title text-slate-800 mb-3">
                                Choose Your Level
                            </h2>
                            <LevelSelector
                                activeLevel={activeLevel}
                                onSelect={setActiveLevel}
                                counts={levelCounts}
                            />
                        </div>

                        {/* Lesson grid */}
                        <LessonGrid
                            activeLevel={activeLevel}
                            statusMap={statusMap}
                            onSelectLesson={startLesson}
                        />

                        {/* Stats + Badges */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <StatisticsPanel stats={stats} />
                            <BadgesPanel badges={badges} />
                        </div>
                    </div>
                )}

                {/* ---------- LESSON VIEW ---------- */}
                {view === "lesson" && currentLesson && (
                    <div className="space-y-6">
                        {/* Lesson header */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <button
                                onClick={handleBackToRoadmap}
                                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                ← Exit Lesson
                            </button>
                            <div className="text-right">
                                <h1 className="text-lg sm:text-xl font-extrabold text-slate-800">
                                    {currentLesson.title}
                                </h1>
                                <p className="text-xs text-slate-500">
                                    {currentLesson.level} · Lesson {currentLesson.lessonIndex}
                                </p>
                            </div>
                        </div>

                        {/* Progress steps */}
                        {lessonStep !== "summary" && (
                            <LessonProgress
                                step={lessonStep}
                                vocabIndex={vocabIndex}
                                sentenceIndex={sentenceIndex}
                            />
                        )}

                        {/* Main content + avatar
                            Mobile (Section 4): avatar is rendered ABOVE the
                            vocabulary/sentence/conversation card so it's never
                            pushed below the analysis. Desktop (lg): content
                            takes the left 2/3 and the avatar is a sticky sidebar
                            on the right. We achieve this with order utilities. */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Avatar — order-1 on mobile, order-2 on desktop */}
                            <div className="order-1 lg:order-2 lg:sticky lg:top-6 self-start">
                                <SpeakingAvatar state={avatar.state} />
                                {lessonStep !== "summary" && (
                                    <div className="mt-4 rounded-2xl p-4 bg-white/70 backdrop-blur-xl border border-white/70 shadow-sm">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                            ⚡ Lesson XP
                                        </p>
                                        <p className="text-2xl font-extrabold text-amber-500">
                                            {lessonXp}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Content — order-2 on mobile, order-1 on desktop */}
                            <div className="order-2 lg:order-1 lg:col-span-2">
                                <Suspense
                                    fallback={
                                        <div className="flex items-center justify-center py-16">
                                            <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                                        </div>
                                    }
                                >
                                    {lessonStep === "vocabulary" && (
                                        <VocabularyPractice
                                            key={currentLesson.key + "-vocab"}
                                            lesson={currentLesson}
                                            onComplete={handleVocabComplete}
                                            onAvatarState={handleAvatarState}
                                            onListening={handleListening}
                                            onXp={handleXp}
                                            onIndexChange={setVocabIndex}
                                            onScore={handleScore}
                                            startIndex={vocabIndex}
                                        />
                                    )}

                                    {lessonStep === "sentences" && (
                                        <SentencePractice
                                            key={currentLesson.key + "-sent"}
                                            lesson={currentLesson}
                                            onComplete={handleSentencesComplete}
                                            onAvatarState={handleAvatarState}
                                            onListening={handleListening}
                                            onXp={handleXp}
                                            onIndexChange={setSentenceIndex}
                                            onScore={handleScore}
                                            startIndex={sentenceIndex}
                                        />
                                    )}

                                    {lessonStep === "conversation" && (
                                        <ConversationPractice
                                            key={currentLesson.key + "-conv"}
                                            lesson={currentLesson}
                                            onComplete={handleConversationComplete}
                                            onAvatarState={handleAvatarState}
                                            onListening={handleListening}
                                            onXp={handleXp}
                                        />
                                    )}

                                    {lessonStep === "summary" && lessonSummary && (
                                        <LessonSummary
                                            lesson={currentLesson}
                                            summary={lessonSummary}
                                            onNextLesson={handleNextLesson}
                                            onBackToRoadmap={handleBackToRoadmap}
                                        />
                                    )}
                                </Suspense>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
