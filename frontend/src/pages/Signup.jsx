import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

export default function Signup() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            setLoading(true);

            const response = await axios.post(
                `${API_URL}/register`,
                {
                    full_name: fullName,
                    email: email,
                    password: password,
                }
            );

            console.log(response.data);

            alert("Registration Successful!");

            navigate("/login");

        } catch (error) {

            console.log(error.response?.data);

            if (error.response) {

                alert(
                    error.response.data.detail ||
                    error.response.data.message ||
                    "Registration failed."
                );

            } else {

                alert("Unable to connect to server.");

            }

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center px-4 py-12">

            {/* Soft background accents */}
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-50 blur-3xl opacity-80" />

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 px-8 py-10 sm:px-10 sm:py-12">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                        Lingora
                    </span>
                </div>

                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Create Your Account
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Start learning English smarter with AI
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignup} className="flex flex-col gap-5">

                    {/* Full Name */}
                    <input
                        type="text"
                        placeholder="Full Name"
                        autoComplete="off"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                    />

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Email Address"
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                    />

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-sm text-blue-600"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-sm text-blue-600"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2 text-sm text-slate-600">
                        <input type="checkbox" className="mt-1" required />
                        I agree to the Terms and Privacy Policy
                    </label>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                {/* Login link */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}