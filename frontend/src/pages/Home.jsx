import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen w-full bg-white overflow-hidden relative">

            {/* Background */}

            <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-70"></div>

            <div className="pointer-events-none absolute top-1/2 -left-32 h-72 w-72 rounded-full bg-blue-50 blur-3xl opacity-80"></div>

            {/* ================= HERO ================= */}

            <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-20 lg:pt-16 lg:pb-32 grid lg:grid-cols-2 gap-16 items-center">

                {/* LEFT */}

                <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">

                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-2 typo-badge text-blue-600">

                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>

                        Powered by Artificial Intelligence

                    </span>

                    <h1 className="typo-hero text-slate-900">

                        Learn English

                        <span className="block text-blue-600">

                            with AI

                        </span>

                    </h1>

                    <p className="typo-body text-slate-600 max-w-xl">

                        Lingora helps you master English using Artificial Intelligence.

                        Practice Grammar, Speaking, Vocabulary and Quizzes —

                        all inside one beautiful learning platform.

                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">

                        <button
                            onClick={() => navigate("/signup")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full typo-button transition"
                        >
                            🚀 Get Started
                        </button>

                        <button
                            onClick={() => navigate("/ai-chat")}
                            className="border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-8 py-4 rounded-full typo-button transition"
                        >
                            🤖 Try AI Teacher
                        </button>

                    </div>

                    <div className="flex items-center gap-8 mt-8">

                        <div>

                            <h2 className="typo-stat-value text-slate-900">
                                50K+
                            </h2>

                            <p className="typo-stat-label text-slate-500">
                                Learners
                            </p>

                        </div>

                        <div>

                            <h2 className="typo-stat-value text-slate-900">
                                4.9★
                            </h2>

                            <p className="typo-stat-label text-slate-500">
                                Rating
                            </p>

                        </div>

                        <div>

                            <h2 className="typo-stat-value text-slate-900">
                                24/7
                            </h2>

                            <p className="typo-stat-label text-slate-500">
                                AI Support
                            </p>

                        </div>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="relative flex justify-center items-center">

                    <div className="h-96 w-96 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl">

                        <div className="text-center text-white">

                            <div className="text-8xl mb-4">

                                🤖

                            </div>

                            <h2 className="typo-section-title text-white">

                                Lingora AI

                            </h2>

                            <p className="mt-3 typo-secondary text-blue-100">

                                Your Personal English Teacher

                            </p>

                        </div>

                    </div>

                    {/* Floating Cards */}

                    <div className="absolute -left-8 top-8 bg-white rounded-2xl shadow-xl p-5">

                        <h3 className="typo-card-title text-blue-600">

                            📚 Vocabulary

                        </h3>

                        <p className="typo-caption text-slate-500">

                            Learn New Words Daily

                        </p>

                    </div>

                    <div className="absolute -right-8 bottom-12 bg-white rounded-2xl shadow-xl p-5">

                        <h3 className="typo-card-title text-green-600">

                            🎤 Speaking

                        </h3>

                        <p className="typo-caption text-slate-500">

                            Practice Fluency

                        </p>

                    </div>

                </div>

            </main>
            {/* ================= TESTIMONIALS ================= */}

            <section className="max-w-7xl mx-auto px-6 py-24">

                <div className="text-center mb-16">

                    <h2 className="typo-page-title text-slate-900">
                        ❤️ Loved by Learners
                    </h2>

                    <p className="text-slate-500 mt-4 typo-body">
                        Thousands of students are improving their English with Lingora.
                    </p>

                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="bg-white rounded-3xl shadow-lg p-8">

                        <div className="text-yellow-400 text-2xl mb-4">
                            ⭐⭐⭐⭐⭐
                        </div>

                        <p className="typo-secondary text-slate-600">
                            "Lingora helped me improve my English speaking confidence within a few weeks."
                        </p>

                        <h3 className="mt-6 typo-card-title text-slate-900">
                            — Priya S.
                        </h3>

                    </div>

                    <div className="bg-white rounded-3xl shadow-lg p-8">

                        <div className="text-yellow-400 text-2xl mb-4">
                            ⭐⭐⭐⭐⭐
                        </div>

                        <p className="typo-secondary text-slate-600">
                            "The AI Teacher explains grammar much better than traditional apps."
                        </p>

                        <h3 className="mt-6 typo-card-title text-slate-900">
                            — Rahul K.
                        </h3>

                    </div>

                    <div className="bg-white rounded-3xl shadow-lg p-8">

                        <div className="text-yellow-400 text-2xl mb-4">
                            ⭐⭐⭐⭐⭐
                        </div>

                        <p className="typo-secondary text-slate-600">
                            "Vocabulary learning and quizzes made English practice enjoyable every day."
                        </p>

                        <h3 className="mt-6 typo-card-title text-slate-900">
                            — Sneha P.
                        </h3>

                    </div>

                </div>

            </section>

            {/* ================= CALL TO ACTION ================= */}

            <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

                <div className="max-w-5xl mx-auto text-center px-6">

                    <h2 className="typo-hero text-white mb-6">
                        Ready to Start Learning?
                    </h2>

                    <p className="text-blue-100 typo-body mb-10">
                        Join Lingora today and improve your English with AI-powered learning.
                    </p>

                    <button
                        onClick={() => navigate("/register")}
                        className="bg-white text-blue-700 px-10 py-4 rounded-full typo-button hover:scale-105 transition"
                    >
                        🚀 Start Learning Now
                    </button>
                </div>

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="bg-slate-900 text-slate-300 py-12">

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">

                    <div>

                        <h2 className="text-3xl font-bold text-white">
                            Lingora
                        </h2>

                        <p className="mt-4 leading-7">
                            AI-powered English Learning Platform that helps learners improve speaking, grammar, vocabulary and confidence.
                        </p>

                    </div>

                    <div>

                        <h3 className="text-xl font-bold text-white mb-4">
                            Features
                        </h3>

                        <ul className="space-y-2">

                            <li>🤖 AI Teacher</li>

                            <li>✍️ Grammar Checker</li>

                            <li>🎤 Speaking Practice</li>

                            <li>📚 Vocabulary Builder</li>

                            <li>📝 Daily Quiz</li>

                        </ul>

                    </div>

                    <div>

                        <h3 className="text-xl font-bold text-white mb-4">
                            Contact
                        </h3>

                        <p>support@lingora.ai</p>

                        <p className="mt-2">
                            Made with ❤️ using React + FastAPI
                        </p>

                    </div>

                </div>

                <div className="text-center mt-12 text-slate-500 border-t border-slate-700 pt-6">

                    © 2026 Lingora. All Rights Reserved.

                </div>

            </footer>

        </div>
    );
}

export default Home;