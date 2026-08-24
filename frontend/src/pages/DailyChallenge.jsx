import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import useModalBehavior from "../Hooks/useModalBehavior";

// Deterministic text comparison for answers/options. Ignores leading &
// trailing spaces, case, and accidental newline/whitespace differences so
// that "Paris", "paris", "Paris " and "Paris\n" all compare equal. This is
// the root-cause fix for the intermittent highlighting bug (the backend
// stores `answer` as free-text LLM output that is not guaranteed to be an
// exact string match for any option).
const normalize = (text) =>
    (text ?? "").trim().replace(/\s+/g, " ").toLowerCase();

export default function DailyChallenge() {

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [achievement, setAchievement] = useState(null);

    // User Progress
    const [userProgress, setUserProgress] = useState({
        xp: 0,
        level: 1,
        english_rank: "Beginner",
        streak: 0,
    });

    const user =
        JSON.parse(localStorage.getItem("user")) || {};

    useEffect(() => {
        fetchQuestions();
        fetchUserProgress();
    }, []);

    // ---------------- FETCH QUESTIONS ----------------

    const fetchQuestions = async () => {
        try {

            const response = await axios.get(`${API_URL}/daily-challenge`);

            console.log(response.data);

            setQuestions(response.data);

            // Development-only integrity check. The backend stores `answer`
            // as a free-text field produced by an LLM, so it is NOT
            // guaranteed to be an exact string match for any option. If a
            // question's answer cannot be matched to an option even after
            // normalization, warn so the data issue is visible in dev.
            if (import.meta.env.DEV) {
                response.data.forEach((q) => {
                    const normAnswer = normalize(q.answer);
                    const matches = (q.options || []).some(
                        (opt) => normalize(opt) === normAnswer
                    );
                    if (!matches) {
                        console.warn(
                            `[DailyChallenge] Question ${q.id}: answer does not match any option after normalization.`,
                            { answer: q.answer, options: q.options }
                        );
                    }
                });
            }

        } catch (error) {

            console.log(
                "Daily Challenge Error",
                error.response?.data || error.message
            );

        }
    };

    // ---------------- FETCH USER PROGRESS ----------------

    const fetchUserProgress = async () => {

        try {

            if (!user.user_id) return;

            const response = await axios.get(`${API_URL}/user-progress/${user.user_id}`);

            setUserProgress(response.data);

        } catch (error) {

            console.log(
                "Progress Error",
                error.response?.data || error.message
            );

        }

    };

    // ---------------- SELECT ANSWER ----------------

    const handleSelect = (questionId, option) => {

        setAnswers({
            ...answers,
            [questionId]: option,
        });

    };

    // ---------------- SUBMIT ----------------

    const handleSubmit = async () => {

        let totalScore = 0;

        questions.forEach((q) => {

            if (normalize(answers[q.id]) === normalize(q.answer)) {
                totalScore++;
            }

        });

        setScore(totalScore);

        try {

            if (!user.user_id) {

                alert("Please login again");
                return;

            }

            const response = await axios.post(`${API_URL}/daily-challenge-result`,
                {
                    user_id: user.user_id,
                    score: totalScore,
                }
            );
            if (
                response.data.new_achievements &&
                response.data.new_achievements.length > 0
            ) {
                setAchievement(response.data.new_achievements[0]);
            }

            setUserProgress({
                xp: response.data.total_xp,
                level: response.data.level,
                english_rank: response.data.english_rank,
                streak: response.data.streak || 0,
            });

            console.log(response.data);

        } catch (error) {

            console.log(
                "Save Result Error",
                error.response?.data || error.message
            );

        }

        setSubmitted(true);

    };

    // XP Progress
    const progress = userProgress.xp % 100;

    useModalBehavior(!!achievement, () => setAchievement(null));

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-100 py-4 sm:py-10">

            <div className="mx-auto min-w-0 max-w-5xl px-3 sm:px-6">

                {/* Progress Card */}

                <div className="mb-6 min-w-0 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white shadow-xl sm:mb-8 sm:p-8">

                    <h2 className="break-words text-2xl font-bold sm:text-3xl">
                        👋 Welcome {user.full_name || "Learner"}
                    </h2>

                    <p className="mt-2 text-blue-100">
                        Keep learning every day and level up your English.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 md:grid-cols-4">

                        <div className="min-w-0 rounded-2xl bg-white/10 p-4 sm:p-5">
                            <p className="typo-stat-label text-blue-100">🏆 Level</p>
                            <h3 className="typo-stat-value text-white">
                                {userProgress.level}
                            </h3>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-white/10 p-4 sm:p-5">
                            <p className="typo-stat-label text-blue-100">⭐ XP</p>
                            <h3 className="typo-stat-value text-white">
                                {userProgress.xp}
                            </h3>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-white/10 p-4 sm:p-5">
                            <p className="typo-stat-label text-blue-100">🎓 Rank</p>
                            <h3 className="break-words typo-card-title text-white">
                                {userProgress.english_rank}
                            </h3>
                        </div>

                        <div className="min-w-0 rounded-2xl bg-white/10 p-4 sm:p-5">
                            <p className="typo-stat-label text-blue-100">🔥 Streak</p>
                            <h3 className="typo-stat-value text-white">
                                {userProgress.streak}
                            </h3>
                        </div>

                    </div>

                    <div className="mt-8">

                        <div className="mb-2 flex flex-wrap justify-between gap-2 typo-secondary text-white">
                            <span>Level Progress</span>
                            <span>{progress}/100 XP</span>
                        </div>

                        <div className="w-full h-4 rounded-full bg-white/20 overflow-hidden">

                            <div
                                className="h-full bg-yellow-400 transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />

                        </div>

                    </div>

                </div>

                {/* Daily Challenge */}

                <div className="min-w-0 rounded-3xl bg-white p-4 shadow-lg sm:p-8">

                    <h1 className="typo-page-title text-blue-600 mb-3">
                        🔥 Daily Challenge
                    </h1>

                    <p className="typo-body text-slate-600 mb-8">
                        Complete today's challenge and earn XP!
                    </p>

                    <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 sm:mb-8 sm:p-5">

                        <h2 className="typo-card-title text-yellow-700">
                            🎁 Reward
                        </h2>

                        <p className="typo-body text-slate-700 mt-1">
                            Get up to
                            <span className="font-bold text-blue-600">
                                {" "}50 XP
                            </span>
                        </p>

                    </div>

                    {questions.length === 0 ? (

                        <div className="text-center py-12 text-slate-500">

                            Loading questions...

                        </div>

                    ) : (

                        questions.map((q, index) => (

                            <div
                                key={q.id}
                                className="mb-4 min-w-0 rounded-2xl border bg-slate-50 p-4 sm:mb-6 sm:p-6"
                            >

                                <h2 className="mb-3 text-xl font-bold sm:text-xl">
                                    Question {index + 1}/5
                                </h2>

                                <p className="mb-5 break-words leading-7">
                                    {q.question}
                                </p>

                                <div className="space-y-3">

                                    {(q.options || []).map((option, optionIndex) => {

                                        let style =
                                            "bg-white hover:bg-blue-50";

                                        if (submitted) {

                                            if (normalize(option) === normalize(q.answer)) {

                                                style =
                                                    "bg-green-100 border-green-500";

                                            }

                                            else if (normalize(answers[q.id]) === normalize(option)) {

                                                style =
                                                    "bg-red-100 border-red-500";

                                            }

                                        }

                                        else if (normalize(answers[q.id]) === normalize(option)) {

                                            style =
                                                "bg-blue-100 border-blue-500";

                                        }

                                        return (

                                            <label
                                                key={`${q.id}-${optionIndex}`}
                                                className={`flex min-h-[44px] w-full min-w-0 items-start rounded-xl border p-4 cursor-pointer ${style}`}
                                            >

                                                <input
                                                    type="radio"
                                                    disabled={submitted}
                                                    checked={normalize(answers[q.id]) === normalize(option)}
                                                    onChange={() =>
                                                        handleSelect(q.id, option)
                                                    }
                                                    className="mr-3 mt-1 shrink-0"
                                                />

                                                <span className="min-w-0 break-words">{option}</span>
                                            </label>

                                        );

                                    })}

                                </div>

                                {submitted && q.explanation && (

                                    <div className="mt-4 min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-4">

                                        <h3 className="font-bold text-blue-700 mb-2">
                                            💡 Explanation
                                        </h3>

                                        <p className="break-words leading-7">{q.explanation}</p>

                                    </div>

                                )}

                            </div>

                        ))

                    )}

                    {!submitted && questions.length > 0 && (

                        <button
                            onClick={handleSubmit}
                            className="touch-target w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700"
                        >
                            Submit Challenge
                        </button>

                    )}

                    {submitted && (

                        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 sm:mt-8 sm:p-8">

                            <h2 className="break-words text-xl font-bold sm:text-3xl">
                                🎉 Challenge Completed
                            </h2>

                            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2">

                                <div>

                                    <p className="text-base sm:text-lg">
                                        ✅ Score
                                    </p>

                                    <h3 className="text-2xl font-bold sm:text-3xl">
                                        {score}/5
                                    </h3>

                                </div>

                                <div>

                                    <p className="text-base sm:text-lg">
                                        ⭐ XP Earned
                                    </p>

                                    <h3 className="text-2xl font-bold text-blue-600 sm:text-3xl">
                                        +{score * 10}
                                    </h3>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>
            {
                achievement && (

                    <div className="mobile-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Achievement unlocked"
                            className="mobile-modal-panel w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-10"
                        >

                            <h2 className="mb-6 break-words text-2xl font-bold sm:text-3xl">

                                🎉 Achievement Unlocked!

                            </h2>

                            <div className="mb-4 text-6xl sm:text-7xl">

                                {achievement.badge_icon}

                            </div>

                            <h3 className="break-words text-xl font-bold sm:text-2xl">

                                {achievement.badge_name}

                            </h3>

                            <p className="mt-4 text-slate-600">

                                Congratulations!

                                <br />

                                You earned a new badge.

                            </p>

                            <button

                                onClick={() => setAchievement(null)}

                                className="touch-target mt-8 rounded-xl bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"

                            >

                                Awesome!

                            </button>

                        </div>

                    </div>

                )
            }

        </div>
    );
}