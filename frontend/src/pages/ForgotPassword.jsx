import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import lingoraLogo from "../assets/lingora-logo.png";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | success
    const [error, setError] = useState("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleChange = (e) => {
        setEmail(e.target.value);

        if (error) setError("");

        if (status === "success") {
            setStatus("idle");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setStatus("loading");

        // Simulated API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setStatus("success");
        setEmail("");
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-blue-100"
            >

                {/* Logo */}

                <div className="flex flex-col items-center">

                    <img
                        src={lingoraLogo}
                        alt="Lingora"
                        className="h-16 w-16 select-none"
                        draggable={false}
                    />

                    <h2 className="mt-3 text-xl font-bold text-blue-600">
                        Lingora
                    </h2>

                </div>

                {/* Heading */}

                <div className="mt-6 text-center">

                    <h1 className="text-3xl font-bold text-slate-900">
                        Forgot Password?
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                        Enter your email address and we'll send you a password reset link.
                    </p>

                </div>

                <AnimatePresence mode="wait">

                    {status === "success" ? (

                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-5"
                        >

                            <div className="text-4xl text-center">
                                📩
                            </div>

                            <h3 className="mt-3 text-center text-lg font-semibold text-green-700">
                                Email Sent
                            </h3>

                            <p className="mt-2 text-center text-sm leading-6 text-green-700">

                                Check your email inbox.

                                <br />

                                If an account exists for this email,
                                we've sent you a password reset link.

                                <br /><br />

                                Please also check your Spam or Junk folder.

                            </p>

                        </motion.div>

                    ) : (

                        <motion.form
                            key="form"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >

                            <div className="mt-7">

                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>

                                <input
                                    autoFocus
                                    type="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    aria-invalid={!!error}
                                    className={`w-full rounded-xl border px-4 py-3 bg-slate-50 outline-none transition-all duration-200

                  ${error
                                            ? "border-red-400"
                                            : "border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                        }
                  `}
                                />

                                <AnimatePresence>

                                    {error && (

                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-2 text-sm text-red-500"
                                            aria-live="polite"
                                        >
                                            {error}
                                        </motion.p>

                                    )}

                                </AnimatePresence>

                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={status === "loading"}
                                className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                            >

                                {status === "loading" ? (

                                    <div className="flex items-center justify-center gap-3">

                                        <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />

                                        Sending Reset Link...

                                    </div>

                                ) : (

                                    "Send Reset Link"

                                )}

                            </motion.button>

                        </motion.form>

                    )}

                </AnimatePresence>

                <div className="mt-8 text-center">

                    <Link
                        to="/login"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        ← Back to Login
                    </Link>

                </div>

            </motion.div>

        </div>
    );
}