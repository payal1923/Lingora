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

        <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-4 sm:py-10">

            <div className="mx-auto min-w-0 max-w-5xl px-3 sm:px-6">

                <div className="min-w-0 bg-white rounded-3xl shadow-2xl p-4 sm:p-10">                    {/* ======================================
                            LESSON HEADER
                    ====================================== */}

                    <h1 className="break-words text-2xl font-bold text-blue-600 sm:text-5xl">

                        📖 {lesson.title}

                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">

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

                    <div className="mt-8 sm:mt-12">

                        <h2 className="text-xl font-bold sm:text-3xl">

                            📚 Explanation

                        </h2>

                        <div className="mt-5 bg-slate-50 rounded-2xl border p-4 sm:p-6">

                            <p className="break-words text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">

                                {lesson.explanation}

                            </p>

                        </div>

                    </div>

                    {/* ======================================
                            EXAMPLES
                    ====================================== */}

                    <div className="mt-8 sm:mt-12">

                        <h2 className="text-xl font-bold sm:text-3xl">

                            💬 Examples

                        </h2>

                        <div className="space-y-4 mt-6">

                            {(lesson.examples || []).map((example, index) => (

                                <div

                                    key={index}

                                    className="min-w-0 bg-blue-50 border-l-4 border-blue-500 rounded-2xl p-4 sm:p-5"

                                >

                                    <div className="flex items-start gap-3 sm:items-center sm:gap-4">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">

                                            {index + 1}

                                        </div>

                                        <p className="min-w-0 break-words text-base sm:text-lg">

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

                    <div className="mt-8 sm:mt-12">

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-2xl p-4 sm:p-6">

                            <h2 className="text-xl font-bold sm:text-2xl">

                                💡 Learning Tip

                            </h2>

                            <p className="mt-4 break-words text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">

                                {lesson.learning_tip}

                            </p>

                        </div>

                    </div>

                    {/* ======================================
                            QUIZ
                    ====================================== */}

                    <div className="mt-10 sm:mt-14">

                        <h2 className="text-xl font-bold sm:text-3xl">

                            📝 Lesson Quiz

                        </h2>

                        <p className="mt-2 text-slate-600">

                            Answer at least 2 out of 3 questions correctly.

                        </p>

                        <div className="mt-6 bg-slate-50 rounded-3xl p-4 sm:mt-8 sm:p-8">

                            <div className="flex flex-wrap items-center justify-between gap-3">

                                <h3 className="text-xl font-bold sm:text-2xl">

                                    Question {currentQuestion + 1}

                                </h3>

                                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold">

                                    {currentQuestion + 1} / {quiz.length}

                                </span>

                            </div>

                            <p className="mt-6 break-words text-base font-medium leading-7 sm:text-xl">

                                {question.question}

                            </p>

                            <div className="mt-8 space-y-4">

                                {question.options.map((option, index) => (

                                    <button

                                        key={index}

                                        onClick={() => selectOption(option)}

                                        className={`min-h-[44px] w-full break-words text-left p-4 rounded-2xl border transition-all duration-200 sm:p-5

                                        ${selectedAnswers[currentQuestion] === option

                                                ? "bg-blue-600 text-white border-blue-600"

                                                : "bg-white hover:bg-blue-50 border-slate-300"

                                            }`}

                                    >

                                        {option}

                                    </button>

                                ))}

                            </div>                            {/* Navigation */}

                            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-between">

                                <button

                                    onClick={previousQuestion}

                                    disabled={currentQuestion === 0}

                                    className={`min-h-[44px] px-6 py-3 rounded-xl font-bold transition sm:px-8

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

                                            className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold sm:px-8"

                                        >

                                            Next ➡

                                        </button>

                                    ) : (

                                        <button

                                            onClick={submitQuiz}

                                            className="min-h-[44px] bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold sm:px-8"

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

                            <div className="mt-8 rounded-3xl shadow-xl p-4 bg-white border sm:mt-10 sm:p-8">

                                <h2 className="text-xl font-bold sm:text-3xl">

                                    🎯 Quiz Result

                                </h2>

                                <div className="mt-6">

                                    <h3 className="text-xl sm:text-2xl">

                                        Score:

                                        <span className="font-bold text-blue-600">

                                            {" "}{score} / {quiz.length}

                                        </span>

                                    </h3>

                                </div>

                                {

                                    passed ? (

                                        <div className="mt-6 bg-green-100 border border-green-400 rounded-2xl p-4 sm:p-6">

                                            <h3 className="text-xl font-bold text-green-700 sm:text-2xl">

                                                🎉 Congratulations!

                                            </h3>

                                            <p className="mt-3 text-green-700">

                                                You passed this lesson.

                                            </p>

                                        </div>

                                    ) : (

                                        <div className="mt-6 bg-red-100 border border-red-400 rounded-2xl p-4 sm:p-6">

                                            <h3 className="text-xl font-bold text-red-700 sm:text-2xl">

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

                                                className={`touch-target w-full rounded-2xl py-4 text-lg font-bold transition-all sm:py-5 sm:text-xl

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