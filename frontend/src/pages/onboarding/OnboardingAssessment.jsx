import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const assessmentQuestions = [
    {
        id: 1,
        skill: "basic_grammar",
        difficulty: "beginner",
        question: "Choose the correct sentence.",
        options: [
            { value: "a", text: "She go to school every day.", score: 0 },
            { value: "b", text: "She goes to school every day.", score: 1 },
            { value: "c", text: "She going to school every day.", score: 0 },
            { value: "d", text: "She gone to school every day.", score: 0 },
        ],
    },
    {
        id: 2,
        skill: "past_tense",
        difficulty: "elementary",
        question: "Complete the sentence: Yesterday, I ___ to the market.",
        options: [
            { value: "a", text: "go", score: 0 },
            { value: "b", text: "going", score: 0 },
            { value: "c", text: "went", score: 2 },
            { value: "d", text: "gone", score: 0 },
        ],
    },
    {
        id: 3,
        skill: "natural_english",
        difficulty: "intermediate",
        question: "Which sentence sounds the most natural in everyday English?",
        options: [
            { value: "a", text: "I am agree with you.", score: 0 },
            { value: "b", text: "I agree with you.", score: 3 },
            { value: "c", text: "I agreeing with you.", score: 0 },
            { value: "d", text: "I do agree to you.", score: 0 },
        ],
    },
    {
        id: 4,
        skill: "context_and_tense",
        difficulty: "upper_intermediate",
        question:
            "Choose the best sentence for this situation: You started learning English three years ago and you still learn it now.",
        options: [
            { value: "a", text: "I learn English for three years.", score: 0 },
            { value: "b", text: "I learned English since three years.", score: 0 },
            {
                value: "c",
                text: "I have been learning English for three years.",
                score: 4,
            },
            { value: "d", text: "I am learning English since three years.", score: 0 },
        ],
    },
    {
        id: 5,
        skill: "advanced_usage",
        difficulty: "advanced",
        question: "Choose the sentence with the most accurate and natural English.",
        options: [
            {
                value: "a",
                text: "Had I known about the delay, I would have left later.",
                score: 5,
            },
            { value: "b", text: "If I would know about the delay, I left later.", score: 0 },
            {
                value: "c",
                text: "Had I knew about the delay, I would leave later.",
                score: 0,
            },
            {
                value: "d",
                text: "If I had know the delay, I would have leaving later.",
                score: 0,
            },
        ],
    },
];

const skillLabels = {
    basic_grammar: "Basic grammar",
    past_tense: "Past tense",
    natural_english: "Natural English",
    context_and_tense: "Context & tense",
    advanced_usage: "Advanced usage",
};

const VALID_ASSESSED_LEVELS = [
    "beginner",
    "elementary",
    "intermediate",
    "upper_intermediate",
    "advanced",
];

function getAssessedLevel(score) {
    if (score <= 1) return "beginner";
    if (score <= 3) return "elementary";
    if (score <= 6) return "intermediate";
    if (score <= 10) return "upper_intermediate";
    return "advanced";
}

function calculateAssessmentScore(answersList) {
    return assessmentQuestions.reduce((total, question) => {
        const answer = answersList.find((a) => a.questionId === question.id);
        if (!answer) return total;
        const option = question.options.find(
            (opt) => opt.value === answer.selectedValue
        );
        return total + (option ? option.score : 0);
    }, 0);
}

function getValidatedAnswers(rawAnswers) {
    let parsed = [];
    try {
        const result = JSON.parse(rawAnswers);
        if (Array.isArray(result)) {
            parsed = result;
        }
    } catch (error) {
        parsed = [];
    }

    const seenQuestionIds = new Set();
    const validAnswers = [];

    parsed.forEach((answer) => {
        if (!answer || typeof answer.questionId !== "number") return;
        if (seenQuestionIds.has(answer.questionId)) return;

        const question = assessmentQuestions.find(
            (q) => q.id === answer.questionId
        );
        if (!question) return;

        const hasValidOption = question.options.some(
            (opt) => opt.value === answer.selectedValue
        );
        if (!hasValidOption) return;

        seenQuestionIds.add(answer.questionId);
        validAnswers.push({
            questionId: answer.questionId,
            selectedValue: answer.selectedValue,
        });
    });

    return validAnswers;
}

export default function OnboardingAssessment() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const completed = localStorage.getItem(
            "lingora_onboarding_assessment_completed"
        );
        const savedScore = localStorage.getItem(
            "lingora_onboarding_assessment_score"
        );
        const savedLevel = localStorage.getItem(
            "lingora_onboarding_assessed_level"
        );

        const scoreNum = Number(savedScore);
        const isValidScore =
            savedScore !== null &&
            Number.isInteger(scoreNum) &&
            scoreNum >= 0 &&
            scoreNum <= 15;
        const isValidLevel = VALID_ASSESSED_LEVELS.includes(savedLevel);

        if (completed === "true" && isValidScore && isValidLevel) {
            navigate("/onboarding/assessment-analysis");
            return;
        }

        const savedAnswersRaw = localStorage.getItem(
            "lingora_onboarding_assessment_answers"
        );
        const validAnswers = getValidatedAnswers(savedAnswersRaw);

        let firstUnansweredIndex = assessmentQuestions.findIndex(
            (question) =>
                !validAnswers.some((answer) => answer.questionId === question.id)
        );
        if (firstUnansweredIndex === -1) {
            firstUnansweredIndex = assessmentQuestions.length - 1;
        }

        const savedIndexRaw = localStorage.getItem(
            "lingora_onboarding_assessment_question_index"
        );
        const savedIndexNum = Number(savedIndexRaw);
        let restoredIndex = 0;
        if (
            Number.isInteger(savedIndexNum) &&
            savedIndexNum >= 0 &&
            savedIndexNum <= 4
        ) {
            restoredIndex = savedIndexNum;
        }

        if (restoredIndex > firstUnansweredIndex) {
            restoredIndex = firstUnansweredIndex;
        }

        setAnswers(validAnswers);
        setCurrentQuestionIndex(restoredIndex);

        const restoredQuestion = assessmentQuestions[restoredIndex];
        const existingAnswer = validAnswers.find(
            (answer) => answer.questionId === restoredQuestion.id
        );
        setSelectedAnswer(existingAnswer ? existingAnswer.selectedValue : "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentQuestion = assessmentQuestions[currentQuestionIndex];

    if (!currentQuestion) {
        return null;
    }

    const isLastQuestion =
        currentQuestionIndex === assessmentQuestions.length - 1;
    const progressPercentage =
        ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;

    const handleBack = () => {
        if (currentQuestionIndex === 0) {
            navigate("/onboarding/assessment-intro");
            return;
        }

        const prevIndex = currentQuestionIndex - 1;
        const prevQuestion = assessmentQuestions[prevIndex];
        const existingAnswer = answers.find(
            (answer) => answer.questionId === prevQuestion.id
        );

        setCurrentQuestionIndex(prevIndex);
        localStorage.setItem(
            "lingora_onboarding_assessment_question_index",
            String(prevIndex)
        );
        setSelectedAnswer(existingAnswer ? existingAnswer.selectedValue : "");
    };

    const handleSelectAnswer = (value) => {
        setSelectedAnswer(value);
    };

    const handleContinue = () => {
        if (!selectedAnswer) return;

        const updatedAnswers = [
            ...answers.filter((answer) => answer.questionId !== currentQuestion.id),
            { questionId: currentQuestion.id, selectedValue: selectedAnswer },
        ];

        localStorage.setItem(
            "lingora_onboarding_assessment_answers",
            JSON.stringify(updatedAnswers)
        );
        setAnswers(updatedAnswers);

        if (!isLastQuestion) {
            const nextIndex = currentQuestionIndex + 1;
            const nextQuestion = assessmentQuestions[nextIndex];
            const existingAnswer = updatedAnswers.find(
                (answer) => answer.questionId === nextQuestion.id
            );

            setCurrentQuestionIndex(nextIndex);
            localStorage.setItem(
                "lingora_onboarding_assessment_question_index",
                String(nextIndex)
            );
            setSelectedAnswer(existingAnswer ? existingAnswer.selectedValue : "");
            return;
        }

        const totalScore = calculateAssessmentScore(updatedAnswers);
        const assessedLevel = getAssessedLevel(totalScore);

        localStorage.setItem(
            "lingora_onboarding_assessment_score",
            String(totalScore)
        );
        localStorage.setItem("lingora_onboarding_assessed_level", assessedLevel);
        localStorage.setItem("lingora_onboarding_assessment_completed", "true");
        localStorage.removeItem("lingora_onboarding_assessment_question_index");

        navigate("/onboarding/assessment-analysis");
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-50">
            <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col px-6 pb-12 pt-8 sm:pt-10">
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Go back"
                    className="mb-6 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 hover:bg-slate-100 cursor-pointer"
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

                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-600">
                        Quick English check
                    </span>
                    <span className="text-sm font-semibold text-slate-600">
                        Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
                    </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <span className="mt-6 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    {skillLabels[currentQuestion.skill]}
                </span>

                <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-snug">
                    {currentQuestion.question}
                </h1>

                <div className="mt-8 flex flex-col gap-3">
                    {currentQuestion.options.map((option, optionIndex) => {
                        const isSelected = selectedAnswer === option.value;
                        const optionLetter = String.fromCharCode(65 + optionIndex);

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelectAnswer(option.value)}
                                aria-pressed={isSelected}
                                aria-label={`Select option ${optionLetter}: ${option.text}`}
                                className={`w-full rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${isSelected
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                        : "border-slate-200"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-bold ${isSelected
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {optionLetter}
                                    </div>

                                    <span className="flex-1 text-sm sm:text-base text-slate-700">
                                        {option.text}
                                    </span>

                                    <div
                                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${isSelected
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-slate-300 bg-white"
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={3}
                                                stroke="white"
                                                aria-hidden="true"
                                                className="h-3.5 w-3.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m4.5 12.75 6 6 9-13.5"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <span className="text-lg" role="img" aria-hidden="true">
                        💡
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedAnswer
                            ? "Answer selected. Continue when you're ready."
                            : "Choose the answer that feels right. You can change it before continuing."}
                    </p>
                </div>

                <div className="mt-auto pt-10">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!selectedAnswer}
                        className={`w-full rounded-2xl py-4 text-base font-bold text-white transition-colors duration-200 ${!selectedAnswer
                                ? "bg-blue-200 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {isLastQuestion ? "Finish quick check" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}
