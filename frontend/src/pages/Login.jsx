import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

export default function Login() {
    const navigate = useNavigate();
    useEffect(() => {
        const user = localStorage.getItem("user");

        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const clearOnboardingStorage = () => {
        const onboardingKeys = Object.keys(localStorage).filter((key) =>
            key.startsWith("lingora_onboarding_")
        );

        onboardingKeys.forEach((key) => {
            localStorage.removeItem(key);
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_URL}/login`,
                {
                    email,
                    password,
                }
            );

            alert(response.data.message);

            localStorage.setItem("user", JSON.stringify(response.data));

            if (response.data.onboarding_completed) {
                navigate("/dashboard");
            } else {
                clearOnboardingStorage();
                navigate("/onboarding/language");
            }
        } catch (error) {
            console.log("LOGIN ERROR:", error);

            if (error.response) {
                alert(error.response.data.detail);
            } else {
                alert("Unable to connect to server.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center px-4 py-12">

            {/* Background Blur */}
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-50 blur-3xl opacity-80" />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 px-8 py-10 sm:px-10 sm:py-12">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>

                    <span className="text-2xl font-bold text-slate-900">
                        Lingora
                    </span>
                </div>

                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="typo-page-title text-slate-900">
                        Welcome Back
                    </h1>

                    <p className="typo-secondary text-slate-500 mt-2">
                        Log in to continue your English learning journey
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block typo-badge text-slate-700 mb-2">
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 typo-body outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block typo-badge text-slate-700 mb-2">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 typo-body outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {showPassword ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>
                    {/* Remember + Forgot */}
                    <div className="flex items-center justify-between typo-secondary">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            Remember Me
                        </label>

                        <Link
                            to="/forgot-password"
                            className="text-blue-600 font-semibold hover:text-blue-700"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 py-3 typo-button text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-7">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">OR</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Google */}
                <button className="w-full rounded-xl border border-slate-200 py-3 font-semibold">
                    Continue with Google
                </button>

                {/* Signup */}
                <p className="text-center text-sm text-slate-500 mt-8">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-blue-600 font-semibold"
                    >
                        Sign Up
                    </Link>
                </p>

            </div>
        </div>
    );
}