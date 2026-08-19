import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bot,
    Plane,
    Briefcase,
    UtensilsCrossed,
    Hotel,
    ShoppingBag,
    MessageCircle,
    Sparkles,
    Rocket,
    Clock3,
    GaugeCircle,
    CheckCircle2,
    ChevronLeft,
    Flame,
    Mic,
    PenLine,
    BookMarked,
} from "lucide-react";

// Selection → next-step delay, kept short so the wizard feels instant
// while still giving the user a moment to see their choice register.
const AUTO_ADVANCE_DELAY = 250;

const STEP_LABELS = ["Scenario", "Difficulty", "Duration", "Ready"];

export default function Conversation() {

    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [selectedTopic, setSelectedTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Beginner");
    const [duration, setDuration] = useState("10 Minutes");

    const user =
        JSON.parse(localStorage.getItem("user")) || {};

    const topics = [
        {
            title: "Travel",
            icon: Plane,
            color: "from-sky-500 to-blue-600",
            description:
                "Practice airport, immigration and travel conversations."
        },
        {
            title: "Job Interview",
            icon: Briefcase,
            color: "from-violet-500 to-indigo-600",
            description:
                "Prepare for HR and technical interviews."
        },
        {
            title: "Restaurant",
            icon: UtensilsCrossed,
            color: "from-orange-500 to-red-500",
            description:
                "Order food and communicate confidently."
        },
        {
            title: "Hotel",
            icon: Hotel,
            color: "from-emerald-500 to-green-600",
            description:
                "Practice hotel check-in conversations."
        },
        {
            title: "Shopping",
            icon: ShoppingBag,
            color: "from-pink-500 to-rose-600",
            description:
                "Ask prices and communicate naturally."
        },
        {
            title: "Daily Conversation",
            icon: MessageCircle,
            color: "from-cyan-500 to-blue-500",
            description:
                "Improve everyday English communication."
        },
        {
            title: "Free Talk",
            icon: Sparkles,
            color: "from-indigo-500 to-purple-600",
            description:
                "Talk with Lingora AI about anything."
        },
    ];

    const difficulties = [
        {
            level: "Beginner",
            icon: Sparkles,
            color: "from-emerald-500 to-teal-600",
            description: "Simple words and a slower, patient pace.",
        },
        {
            level: "Intermediate",
            icon: GaugeCircle,
            color: "from-blue-500 to-indigo-600",
            description: "Natural speed with everyday vocabulary.",
        },
        {
            level: "Advanced",
            icon: Flame,
            color: "from-orange-500 to-red-600",
            description: "Fast, idiomatic, near-native conversation.",
        },
    ];

    const durations = [
        { time: "5 Minutes", subtitle: "Quick practice" },
        { time: "10 Minutes", subtitle: "Standard session" },
        { time: "15 Minutes", subtitle: "Deep practice" },
        { time: "20 Minutes", subtitle: "Full immersion" },
    ];

    const startConversation = () => {

        if (!selectedTopic) return;

        navigate("/conversation-chat", {
            state: {
                topic: selectedTopic,
                difficulty,
                duration,
            },
        });

    };

    // --- Selection handlers: highlight, pause briefly, then advance ---

    const handleSelectTopic = (title) => {
        setSelectedTopic(title);
        setTimeout(() => setStep(2), AUTO_ADVANCE_DELAY);
    };

    const handleSelectDifficulty = (level) => {
        setDifficulty(level);
        setTimeout(() => setStep(3), AUTO_ADVANCE_DELAY);
    };

    const handleSelectDuration = (time) => {
        setDuration(time);
        setTimeout(() => setStep(4), AUTO_ADVANCE_DELAY);
    };

    const goBack = () => setStep((s) => Math.max(1, s - 1));

    // --- Shared bits ---

    const BackButton = () => (
        <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold mb-8 transition-colors"
        >
            <ChevronLeft size={20} />
            Back
        </button>
    );

    const ProgressBar = () => (
        <div className="mb-10">

            <div className="flex items-center">

                {STEP_LABELS.map((label, index) => {

                    const stepNumber = index + 1;
                    const isComplete = step > stepNumber;
                    const isActive = step === stepNumber;

                    return (
                        <div key={label} className="flex items-center flex-1 last:flex-none">

                            <div className="flex flex-col items-center gap-2">

                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0

                                    ${isComplete
                                            ? "bg-blue-600 text-white"
                                            : isActive
                                                ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                                                : "bg-slate-200 text-slate-500"
                                        }`}
                                >
                                    {isComplete ? <CheckCircle2 size={18} /> : stepNumber}
                                </div>

                                <span
                                    className={`text-xs font-semibold hidden sm:block transition-colors
                                    ${isActive || isComplete ? "text-blue-600" : "text-slate-400"}`}
                                >
                                    {label}
                                </span>

                            </div>

                            {stepNumber !== STEP_LABELS.length && (
                                <div className="flex-1 h-1 mx-2 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                        className={`h-full bg-blue-600 rounded-full transition-all duration-500 ease-out
                                        ${isComplete ? "w-full" : "w-0"}`}
                                    />
                                </div>
                            )}

                        </div>
                    );

                })}

            </div>

            <p className="text-sm text-slate-400 font-medium mt-3">
                Step {step} of {STEP_LABELS.length}
            </p>

        </div>
    );

    // --- Step content ---

    const renderStepOne = () => (
        <div key="step-1" className="wizard-step">

            {/* HERO */}

            <div className="bg-white rounded-[35px] shadow-xl border border-slate-200 overflow-hidden mb-14">

                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-10 text-white">

                    <div className="flex items-center justify-between flex-wrap gap-6">

                        <div className="flex items-center gap-6">

                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center shrink-0">

                                <Bot size={48} />

                            </div>

                            <div>

                                <div className="flex items-center gap-3 flex-wrap">

                                    <h1 className="text-3xl md:text-5xl font-black">

                                        Lingora AI

                                    </h1>

                                    <span className="px-3 py-1 rounded-full bg-green-500 text-sm font-semibold">

                                        ● Online

                                    </span>

                                </div>

                                <p className="text-blue-100 text-lg mt-3">

                                    Hello, {user.full_name || "Learner"} 👋

                                </p>

                                <p className="text-blue-100 mt-2 max-w-2xl leading-8">

                                    I'm your personal AI English coach.

                                    Choose a scenario below and we'll start
                                    a natural conversation just like talking
                                    with a real person.

                                </p>

                            </div>

                        </div>

                        <div className="hidden lg:flex flex-col gap-4">

                            <div className="bg-white/10 rounded-2xl px-6 py-4 backdrop-blur">

                                🎤 Voice Conversation

                            </div>

                            <div className="bg-white/10 rounded-2xl px-6 py-4 backdrop-blur">

                                ✨ Instant Grammar Feedback

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* SCENARIOS */}

            <h2 className="text-3xl md:text-4xl font-black text-slate-900">

                Choose Your AI Scenario

            </h2>

            <p className="text-slate-500 text-lg mt-3">

                Select a real-life situation to practice English naturally.

            </p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mt-10">

                {topics.map((topic) => {

                    const Icon = topic.icon;
                    const isSelected = selectedTopic === topic.title;

                    return (

                        <div
                            key={topic.title}
                            onClick={() => handleSelectTopic(topic.title)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleSelectTopic(topic.title)}
                            className={`group cursor-pointer rounded-[24px] md:rounded-[30px] p-5 md:p-8 transition-all duration-300 border-2 hover:-translate-y-2 min-h-[48px]

                            ${isSelected
                                    ? "border-blue-500 shadow-2xl bg-white ring-4 ring-blue-100 scale-[1.02]"
                                    : "border-transparent bg-white hover:border-blue-200 hover:shadow-xl"
                                }`}
                        >

                            <div className="flex items-center justify-between">

                                <div
                                    className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${topic.color}
                                    flex items-center justify-center text-white shadow-lg`}
                                >
                                    <Icon size={26} className="md:hidden" />
                                    <Icon size={30} className="hidden md:block" />
                                </div>

                                {isSelected && (

                                    <CheckCircle2
                                        size={26}
                                        className="text-blue-600 animate-[fadeIn_250ms_ease-out]"
                                    />

                                )}

                            </div>

                            <h3 className="text-lg md:text-2xl font-bold text-slate-900 mt-5 md:mt-8">

                                {topic.title}

                            </h3>

                            <p className="text-slate-500 text-sm md:text-base leading-6 md:leading-7 mt-2 md:mt-4">

                                {topic.description}

                            </p>

                        </div>

                    );

                })}

            </div>

        </div>
    );

    const renderStepTwo = () => (
        <div key="step-2" className="wizard-step">

            <BackButton />

            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                Choose Your Difficulty
            </h2>

            <p className="text-slate-500 text-lg mt-3">
                How much of a challenge would you like today?
            </p>

            <div className="grid sm:grid-cols-3 gap-5 md:gap-8 mt-10">

                {difficulties.map((item) => {

                    const Icon = item.icon;
                    const isSelected = difficulty === item.level;

                    return (
                        <button
                            key={item.level}
                            onClick={() => handleSelectDifficulty(item.level)}
                            className={`text-left rounded-[24px] md:rounded-[30px] p-6 md:p-8 transition-all duration-300 min-h-[48px] hover:-translate-y-1

                            ${isSelected
                                    ? `bg-gradient-to-br ${item.color} text-white shadow-2xl scale-[1.02]`
                                    : "bg-white border-2 border-transparent hover:border-blue-200 hover:shadow-xl text-slate-900"
                                }`}
                        >

                            <div className="flex items-center justify-between">

                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                                    ${isSelected ? "bg-white/20" : `bg-gradient-to-br ${item.color} text-white`}`}
                                >
                                    <Icon size={26} className={isSelected ? "text-white" : ""} />
                                </div>

                                {isSelected && <CheckCircle2 size={26} />}

                            </div>

                            <h3 className="text-xl md:text-2xl font-bold mt-6">
                                {item.level}
                            </h3>

                            <p className={`mt-3 leading-6 ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                                {item.description}
                            </p>

                        </button>
                    );

                })}

            </div>

        </div>
    );

    const renderStepThree = () => (
        <div key="step-3" className="wizard-step">

            <BackButton />

            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                Choose Your Duration
            </h2>

            <p className="text-slate-500 text-lg mt-3">
                How long would you like to practice for?
            </p>

            <div className="grid grid-cols-2 gap-4 md:gap-6 mt-10">

                {durations.map((item) => {

                    const isSelected = duration === item.time;

                    return (
                        <button
                            key={item.time}
                            onClick={() => handleSelectDuration(item.time)}
                            className={`rounded-[24px] p-6 md:p-8 transition-all duration-300 min-h-[48px] hover:-translate-y-1

                            ${isSelected
                                    ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-2xl scale-[1.02]"
                                    : "bg-white border-2 border-transparent hover:border-indigo-200 hover:shadow-xl text-slate-900"
                                }`}
                        >

                            <div className="flex items-center justify-between">

                                <Clock3 size={28} className={isSelected ? "text-white" : "text-indigo-600"} />

                                {isSelected && <CheckCircle2 size={24} />}

                            </div>

                            <h3 className="text-2xl md:text-3xl font-black mt-6">
                                {item.time}
                            </h3>

                            <p className={`mt-2 text-sm font-medium ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                                {item.subtitle}
                            </p>

                        </button>
                    );

                })}

            </div>

        </div>
    );

    const renderStepFour = () => (
        <div key="step-4" className="wizard-step">

            <BackButton />

            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                Ready to Practice
            </h2>

            <p className="text-slate-500 text-lg mt-3">
                Here's your session — start whenever you're ready.
            </p>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[35px] shadow-xl p-6 md:p-10 text-white mt-10">

                <div className="grid sm:grid-cols-3 gap-4 md:gap-6">

                    <div className="bg-white/10 rounded-3xl p-6">
                        <p className="text-blue-100">Scenario</p>
                        <h3 className="text-xl md:text-2xl font-bold mt-3">
                            {selectedTopic || "Not Selected"}
                        </h3>
                    </div>

                    <div className="bg-white/10 rounded-3xl p-6">
                        <p className="text-blue-100">Difficulty</p>
                        <h3 className="text-xl md:text-2xl font-bold mt-3">
                            {difficulty}
                        </h3>
                    </div>

                    <div className="bg-white/10 rounded-3xl p-6">
                        <p className="text-blue-100">Estimated Length</p>
                        <h3 className="text-xl md:text-2xl font-bold mt-3">
                            {duration}
                        </h3>
                    </div>

                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-6">

                    <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4">
                        <Mic size={20} />
                        <span className="font-medium">Voice Conversation</span>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4">
                        <PenLine size={20} />
                        <span className="font-medium">AI Grammar Feedback</span>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4">
                        <BookMarked size={20} />
                        <span className="font-medium">Vocabulary Suggestions</span>
                    </div>

                </div>

                <button
                    onClick={startConversation}
                    disabled={!selectedTopic}
                    className={`mt-10 w-full py-5 rounded-2xl text-xl font-bold transition-all duration-300 min-h-[48px]

                    ${selectedTopic
                            ? "bg-white text-blue-700 hover:scale-[1.02] shadow-2xl"
                            : "bg-white/20 cursor-not-allowed"
                        }`}
                >
                    🚀 Start AI Conversation
                </button>

            </div>

        </div>
    );

    const steps = {
        1: renderStepOne,
        2: renderStepTwo,
        3: renderStepThree,
        4: renderStepFour,
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

            {/* Local keyframes for the wizard's step transition + selection check-mark. */}
            <style>{`
                @keyframes wizardFadeSlide {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .wizard-step {
                    animation: wizardFadeSlide 300ms ease-out;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">

                <ProgressBar />

                {steps[step]()}

            </div>

        </div>

    );

}
