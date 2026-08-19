import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

export default function Lesson() {

    const { id } = useParams();

    const navigate = useNavigate();

    // ================================
    // STATES
    // ================================

    const [lesson, setLesson] = useState(null);

    const [quiz, setQuiz] = useState([]);

    const [loading, setLoading] = useState(true);

    const [completing, setCompleting] = useState(false);

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [selectedAnswers, setSelectedAnswers] = useState({});

    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const [score, setScore] = useState(0);

    const [passed, setPassed] = useState(false);

    // ================================
    // LOAD LESSON
    // ================================

    useEffect(() => {

        loadLesson();

    }, [id]);

    const loadLesson = async () => {

        try {

            const [lessonResponse, quizResponse] = await Promise.all([

                axios.get(`${API_URL}/lesson-ai/${id}`),

                axios.get(`${API_URL}/lesson-quiz/${id}`),

            ]);

            setLesson(

                lessonResponse.data

            );

            setQuiz(

                quizResponse.data.questions

            );

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setLoading(false);

        }

    };

    // ================================
    // LOADING
    // ================================

    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-slate-100">

                <div className="text-center">

                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

                    <p className="mt-6 text-xl font-semibold">

                        Loading Lesson...

                    </p>

                </div>

            </div>

        );

    }

    // ================================
    // NOT FOUND
    // ================================

    if (!lesson) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-slate-100">

                <div className="bg-white rounded-3xl shadow-xl p-10 text-center">

                    <h1 className="text-4xl font-bold text-red-600">

                        Lesson Not Found

                    </h1>

                    <button

                        onClick={() => navigate("/roadmap")}

                        className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl"

                    >

                        ← Back to Roadmap

                    </button>

                </div>

            </div>

        );

    }

    // ================================
    // CURRENT QUESTION
    // ================================

    const question = quiz[currentQuestion];
    // ================================
    // SELECT OPTION
    // ================================

    const selectOption = (option) => {

        setSelectedAnswers({

            ...selectedAnswers,

            [currentQuestion]: option

        });

    };

    // ================================
    // NEXT QUESTION
    // ================================

    const nextQuestion = () => {

        if (currentQuestion < quiz.length - 1) {

            setCurrentQuestion(

                currentQuestion + 1

            );

        }

    };

    // ================================
    // PREVIOUS QUESTION
    // ================================

    const previousQuestion = () => {

        if (currentQuestion > 0) {

            setCurrentQuestion(

                currentQuestion - 1

            );

        }

    };

    // ================================
    // SUBMIT QUIZ
    // ================================

    const submitQuiz = () => {

        let correctAnswers = 0;

        quiz.forEach((q, index) => {

            if (

                selectedAnswers[index] === q.answer

            ) {

                correctAnswers++;

            }

        });

        setScore(correctAnswers);

        setQuizSubmitted(true);

        // Pass if 2 or more answers are correct

        if (correctAnswers >= 2) {

            setPassed(true);

        }

        else {

            setPassed(false);

        }

    };

    // ================================
    // COMPLETE LESSON
    // ================================

    const completeLesson = async () => {

        try {

            setCompleting(true);

            const user = JSON.parse(

                localStorage.getItem("user")

            );

            const response = await axios.post(
                `${API_URL}/complete-lesson`,

                {

                    user_id: user.user_id,

                    lesson_id: Number(id)

                }

            );

            if (

                response.data.message === "Lesson already completed"

            ) {

                alert(

                    "✅ You have already completed this lesson."

                );

                navigate("/roadmap");

                return;

            }

            alert(

                `🎉 Lesson Completed!\n\n` +

                `+${response.data.xp_earned} XP\n\n` +

                `Level: ${response.data.level}\n` +

                `Rank: ${response.data.english_rank}`

            );

            navigate("/roadmap");

        }

        catch (error) {

            console.log(error);

            alert(

                "Unable to complete lesson."

            );

        }

        finally {

            setCompleting(false);

        }

    };

    // ================================
    // UI START
    // ================================

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-10">

            <div className="max-w-5xl mx-auto px-6">

                <div className="bg-white rounded-3xl shadow-2xl p-10">                    {/* ======================================
                            LESSON HEADER
                    ====================================== */}

                    <h1 className="text-5xl font-bold text-blue-600">

                        📖 {lesson.title}

                    </h1>

                    <div className="mt-5 flex items-center gap-4">

                        <span className="bg-yellow-100 text-yellow-700 px-5 py-2 rounded-xl font-bold">

                            ⭐ {lesson.xp_reward} XP

                        </span>

                        <span className="bg-green-100 text-green-700 px-5 py-2 rounded-xl font-bold">

                            Beginner

                        </span>

                    </div>

                    {/* ======================================
                            EXPLANATION
                    ====================================== */}

                    <div className="mt-12">

                        <h2 className="text-3xl font-bold">

                            📚 Explanation

                        </h2>

                        <div className="mt-5 bg-slate-50 rounded-2xl border p-6">

                            <p className="text-lg leading-8 text-slate-700">

                                {lesson.explanation}

                            </p>

                        </div>

                    </div>

                    {/* ======================================
                            EXAMPLES
                    ====================================== */}

                    <div className="mt-12">

                        <h2 className="text-3xl font-bold">

                            💬 Examples

                        </h2>

                        <div className="space-y-4 mt-6">

                            {(lesson.examples || []).map((example, index) => (

                                <div

                                    key={index}

                                    className="bg-blue-50 border-l-4 border-blue-500 rounded-2xl p-5"

                                >

                                    <div className="flex items-center gap-4">

                                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">

                                            {index + 1}

                                        </div>

                                        <p className="text-lg">

                                            {example}

                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* ======================================
                            LEARNING TIP
                    ====================================== */}

                    <div className="mt-12">

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-2xl p-6">

                            <h2 className="text-2xl font-bold">

                                💡 Learning Tip

                            </h2>

                            <p className="mt-4 text-lg leading-8 text-slate-700">

                                {lesson.learning_tip}

                            </p>

                        </div>

                    </div>

                    {/* ======================================
                            QUIZ
                    ====================================== */}

                    <div className="mt-14">

                        <h2 className="text-3xl font-bold">

                            📝 Lesson Quiz

                        </h2>

                        <p className="mt-2 text-slate-600">

                            Answer at least 2 out of 3 questions correctly.

                        </p>

                        <div className="mt-8 bg-slate-50 rounded-3xl p-8">

                            <div className="flex justify-between items-center">

                                <h3 className="text-2xl font-bold">

                                    Question {currentQuestion + 1}

                                </h3>

                                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold">

                                    {currentQuestion + 1} / {quiz.length}

                                </span>

                            </div>

                            <p className="mt-6 text-xl font-medium">

                                {question.question}

                            </p>

                            <div className="mt-8 space-y-4">

                                {question.options.map((option, index) => (

                                    <button

                                        key={index}

                                        onClick={() => selectOption(option)}

                                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-200

                                        ${selectedAnswers[currentQuestion] === option

                                                ? "bg-blue-600 text-white border-blue-600"

                                                : "bg-white hover:bg-blue-50 border-slate-300"

                                            }`}

                                    >

                                        {option}

                                    </button>

                                ))}

                            </div>                            {/* Navigation */}

                            <div className="flex justify-between mt-10">

                                <button

                                    onClick={previousQuestion}

                                    disabled={currentQuestion === 0}

                                    className={`px-8 py-3 rounded-xl font-bold transition

                                    ${currentQuestion === 0

                                            ? "bg-gray-300 cursor-not-allowed"

                                            : "bg-gray-700 text-white hover:bg-gray-800"

                                        }`}

                                >

                                    ⬅ Previous

                                </button>

                                {

                                    currentQuestion < quiz.length - 1 ? (

                                        <button

                                            onClick={nextQuestion}

                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold"

                                        >

                                            Next ➡

                                        </button>

                                    ) : (

                                        <button

                                            onClick={submitQuiz}

                                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold"

                                        >

                                            ✅ Submit Quiz

                                        </button>

                                    )

                                }

                            </div>

                        </div>

                    </div>

                    {/* ======================================
                            QUIZ RESULT
                    ====================================== */}

                    {

                        quizSubmitted && (

                            <div className="mt-10 rounded-3xl shadow-xl p-8 bg-white border">

                                <h2 className="text-3xl font-bold">

                                    🎯 Quiz Result

                                </h2>

                                <div className="mt-6">

                                    <h3 className="text-2xl">

                                        Score:

                                        <span className="font-bold text-blue-600">

                                            {" "}{score} / {quiz.length}

                                        </span>

                                    </h3>

                                </div>

                                {

                                    passed ? (

                                        <div className="mt-6 bg-green-100 border border-green-400 rounded-2xl p-6">

                                            <h3 className="text-2xl font-bold text-green-700">

                                                🎉 Congratulations!

                                            </h3>

                                            <p className="mt-3 text-green-700">

                                                You passed this lesson.

                                            </p>

                                        </div>

                                    ) : (

                                        <div className="mt-6 bg-red-100 border border-red-400 rounded-2xl p-6">

                                            <h3 className="text-2xl font-bold text-red-700">

                                                ❌ Try Again

                                            </h3>

                                            <p className="mt-3 text-red-700">

                                                You need at least <strong>2 correct answers</strong> to pass.

                                            </p>

                                        </div>

                                    )

                                }

                                {

                                    passed && (

                                        <div className="mt-8">

                                            <button

                                                onClick={completeLesson}

                                                disabled={completing}

                                                className={`w-full py-5 rounded-2xl text-xl font-bold transition-all

                                                ${completing

                                                        ? "bg-gray-400 cursor-not-allowed"

                                                        : "bg-blue-600 hover:bg-blue-700 text-white"

                                                    }`}

                                            >

                                                {

                                                    completing

                                                        ? "Completing Lesson..."

                                                        : `✅ Complete Lesson (+${lesson.xp_reward} XP)`

                                                }

                                            </button>

                                        </div>

                                    )

                                }

                            </div>

                        )

                    }

                </div>

            </div>

        </div>

    );

}