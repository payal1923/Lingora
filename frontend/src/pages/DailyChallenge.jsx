import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";

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

    return (
        <div className="min-h-screen bg-slate-100 py-10">

            <div className="max-w-5xl mx-auto px-6">

                {/* Progress Card */}

                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl p-8 mb-8">

                    <h2 className="text-3xl font-bold">
                        👋 Welcome {user.full_name || "Learner"}
                    </h2>

                    <p className="mt-2 text-blue-100">
                        Keep learning every day and level up your English.
                    </p>

                    <div className="grid md:grid-cols-4 gap-6 mt-8">

                        <div className="bg-white/10 rounded-2xl p-5">
                            <p className="typo-stat-label text-blue-100">🏆 Level</p>
                            <h3 className="typo-stat-value text-white">
                                {userProgress.level}
                            </h3>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-5">
                            <p className="typo-stat-label text-blue-100">⭐ XP</p>
                            <h3 className="typo-stat-value text-white">
                                {userProgress.xp}
                            </h3>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-5">
                            <p className="typo-stat-label text-blue-100">🎓 Rank</p>
                            <h3 className="typo-card-title text-white">
                                {userProgress.english_rank}
                            </h3>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-5">
                            <p className="typo-stat-label text-blue-100">🔥 Streak</p>
                            <h3 className="typo-stat-value text-white">
                                {userProgress.streak}
                            </h3>
                        </div>

                    </div>

                    <div className="mt-8">

                        <div className="flex justify-between typo-secondary text-white mb-2">
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

                <div className="bg-white rounded-3xl shadow-lg p-8">

                    <h1 className="typo-page-title text-blue-600 mb-3">
                        🔥 Daily Challenge
                    </h1>

                    <p className="typo-body text-slate-600 mb-8">
                        Complete today's challenge and earn XP!
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8">

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
                                className="bg-slate-50 border rounded-2xl p-6 mb-6"
                            >

                                <h2 className="font-bold text-xl mb-3">
                                    Question {index + 1}/5
                                </h2>

                                <p className="mb-5">
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
                                                className={`block p-4 rounded-xl border cursor-pointer ${style}`}
                                            >

                                                <input
                                                    type="radio"
                                                    disabled={submitted}
                                                    checked={normalize(answers[q.id]) === normalize(option)}
                                                    onChange={() =>
                                                        handleSelect(q.id, option)
                                                    }
                                                    className="mr-3"
                                                />

                                                {option}
                                            </label>

                                        );

                                    })}

                                </div>

                                {submitted && q.explanation && (

                                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">

                                        <h3 className="font-bold text-blue-700 mb-2">
                                            💡 Explanation
                                        </h3>

                                        <p>{q.explanation}</p>

                                    </div>

                                )}

                            </div>

                        ))

                    )}

                    {!submitted && questions.length > 0 && (

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition"
                        >
                            Submit Challenge
                        </button>

                    )}

                    {submitted && (

                        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-8">

                            <h2 className="text-3xl font-bold">
                                🎉 Challenge Completed
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6 mt-6">

                                <div>

                                    <p className="text-lg">
                                        ✅ Score
                                    </p>

                                    <h3 className="text-3xl font-bold">
                                        {score}/5
                                    </h3>

                                </div>

                                <div>

                                    <p className="text-lg">
                                        ⭐ XP Earned
                                    </p>

                                    <h3 className="text-3xl font-bold text-blue-600">
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

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm">

                            <h2 className="text-3xl font-bold mb-6">

                                🎉 Achievement Unlocked!

                            </h2>

                            <div className="text-7xl mb-4">

                                {achievement.badge_icon}

                            </div>

                            <h3 className="text-2xl font-bold">

                                {achievement.badge_name}

                            </h3>

                            <p className="mt-4 text-slate-600">

                                Congratulations!

                                <br />

                                You earned a new badge.

                            </p>

                            <button

                                onClick={() => setAchievement(null)}

                                className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700"

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