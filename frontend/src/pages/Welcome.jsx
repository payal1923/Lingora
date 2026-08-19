import { Link } from "react-router-dom";

export default function Welcome() {
    const features = [
        {
            icon: "🤖",
            title: "AI Teacher",
            desc: "Get instant, personalized guidance from an AI tutor available whenever you want to learn.",
        },
        {
            icon: "📚",
            title: "Vocabulary Builder",
            desc: "Grow your word bank with smart flashcards that adapt to what you already know.",
        },
        {
            icon: "📝",
            title: "Grammar Checker",
            desc: "Catch mistakes instantly and understand exactly why, not just what, went wrong.",
        },
        {
            icon: "🎤",
            title: "Speaking Practice",
            desc: "Build real conversation confidence with AI-powered pronunciation feedback.",
        },
        {
            icon: "🏆",
            title: "Daily Challenge",
            desc: "Stay consistent with bite-sized daily tasks designed to keep you improving.",
        },
        {
            icon: "📈",
            title: "Progress Dashboard",
            desc: "Track your growth across every skill with clear, motivating analytics.",
        },
    ];

    const stats = [
        { value: "10+", label: "Learning Modules" },
        { value: "AI Powered", label: "English Teacher" },
        { value: "5", label: "Practice Modes" },
        { value: "24/7", label: "Learning Support" },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden">

            {/* ---------------- NAVBAR ---------------- */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2 text-2xl font-extrabold text-blue-600">
                        <span>📘</span>
                        <span>Lingora</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 rounded-full font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-300"
                        >
                            Login
                        </Link>

                        <Link
                            to="/signup"
                            className="px-5 py-2.5 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-300"
                        >
                            Sign Up
                        </Link>
                    </div>
                </nav>
            </header>


            {/* ---------------- HERO ---------------- */}
            <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white -z-10" />

                <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-16 items-center">

                    <div>
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 text-blue-600 typo-badge border border-blue-100">
                            ✨ Powered by Artificial Intelligence
                        </span>

                        <h1 className="typo-hero text-slate-900">
                            Learn English{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
                                Smarter with AI
                            </span>
                        </h1>

                        <p className="mt-6 typo-body text-slate-500 max-w-xl">
                            Improve your Grammar, Vocabulary, Speaking, Pronunciation and
                            Communication using Artificial Intelligence.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                to="/signup"
                                className="px-8 py-4 rounded-2xl typo-button text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Get Started →
                            </Link>

                            <Link
                                to="/login"
                                className="px-8 py-4 rounded-2xl typo-button text-blue-600 bg-white border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                    {/* Right: AI Illustration */}
                    <div className="relative flex justify-center items-center">
                        <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-blue-400/20 rounded-full blur-3xl" />

                        <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-2xl shadow-blue-200 p-8 flex flex-col justify-between overflow-hidden">

                            <div className="absolute -top-10 -right-10 w-40 h-40 border-4 border-white/20 rounded-full" />
                            <div className="absolute -bottom-14 -left-14 w-52 h-52 border-4 border-white/10 rounded-full" />

                            <div className="relative bg-white/95 rounded-2xl p-4 shadow-lg max-w-[80%] animate-[pulse_4s_ease-in-out_infinite]">
                                <p className="typo-secondary font-semibold text-slate-700">
                                    🤖 AI Teacher
                                </p>
                                <p className="typo-caption text-slate-500 mt-1">
                                    Great job! Your pronunciation improved by 12% today.
                                </p>
                            </div>

                            <div className="relative bg-white/95 rounded-2xl p-4 shadow-lg max-w-[80%] self-end">
                                <p className="typo-secondary font-semibold text-slate-700">
                                    🎯 Daily Goal
                                </p>
                                <p className="typo-caption text-slate-500 mt-1">
                                    10/10 words learned. Streak: 7 days 🔥
                                </p>
                            </div>

                            <div className="relative mx-auto w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow-inner">
                                    🧠
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </section>


            {/* ---------------- FEATURES ---------------- */}
            <section className="max-w-7xl mx-auto px-6 py-20">

                <div className="text-center max-w-2xl mx-auto mb-14">
                    <h2 className="typo-page-title text-slate-900">
                        Everything you need to master English
                    </h2>

                    <p className="mt-4 typo-body text-slate-500">
                        One platform, six powerful tools, built to accelerate your fluency.
                    </p>
                </div>


                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="group rounded-3xl bg-white border border-slate-100 p-8 shadow-xl shadow-blue-100/60 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-2 transition-all duration-300"
                        >

                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                                {f.icon}
                            </div>

                            <h3 className="typo-card-title text-slate-900 mb-2">
                                {f.title}
                            </h3>

                            <p className="typo-secondary text-slate-500">
                                {f.desc}
                            </p>

                        </div>
                    ))}

                </div>

            </section>


            {/* ---------------- WHY CHOOSE LINGORA ---------------- */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-20">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center max-w-2xl mx-auto mb-14">

                        <h2 className="typo-page-title text-slate-900">
                            Why Choose Lingora
                        </h2>

                        <p className="mt-4 typo-body text-slate-500">
                            AI-powered learning experience designed for students.
                        </p>

                    </div>


                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

                        {stats.map((s, i) => (

                            <div
                                key={i}
                                className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-blue-100/60 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-300"
                            >

                                <p className="typo-stat-value text-blue-600">
                                    {s.value}
                                </p>

                                <p className="mt-2 typo-stat-label text-slate-500">
                                    {s.label}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* ---------------- CTA ---------------- */}
            <section className="max-w-7xl mx-auto px-6 py-20">

                <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-sky-500 px-8 py-16 md:py-20 text-center overflow-hidden shadow-2xl shadow-blue-300">

                    <h2 className="relative typo-page-title text-white">
                        Start Your English Journey Today
                    </h2>

                    <p className="relative mt-4 typo-body text-blue-100 max-w-xl mx-auto">
                        Join learners using AI to speak, write, and think in English with confidence.
                    </p>


                    <div className="relative mt-10 flex flex-wrap justify-center gap-4">

                        <Link
                            to="/signup"
                            className="px-8 py-4 rounded-2xl typo-button text-blue-600 bg-white hover:bg-blue-50 shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Create Free Account
                        </Link>

                        <Link
                            to="/login"
                            className="px-8 py-4 rounded-2xl typo-button text-white border-2 border-white/70 hover:bg-white/10 transition-all duration-300"
                        >
                            Login
                        </Link>

                    </div>

                </div>

            </section>


            {/* ---------------- FOOTER ---------------- */}
            <footer className="border-t border-slate-100 bg-white">

                <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    <div>

                        <div className="flex items-center gap-2 text-xl font-extrabold text-blue-600">
                            <span>📘</span>
                            <span>Lingora</span>
                        </div>

                        <p className="text-sm text-slate-400 mt-1">
                            © 2026 Lingora • AI Powered English Learning Platform
                        </p>

                    </div>


                    <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">

                        <Link
                            to="/login"
                            className="hover:text-blue-600 transition-colors duration-300"
                        >
                            Login
                        </Link>

                        <Link
                            to="/signup"
                            className="hover:text-blue-600 transition-colors duration-300"
                        >
                            Signup
                        </Link>

                    </div>

                </div>

            </footer>

        </div>
    );
}