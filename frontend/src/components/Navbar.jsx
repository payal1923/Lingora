import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MobileSidebar from "./MobileSidebar";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const isLoggedIn = !!user;
    const userName = user?.full_name || user?.fullName || user?.name || "Learner";

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    const navLinkClass = (path) =>
        `text-sm font-medium transition ${location.pathname === path
            ? "text-blue-600"
            : "text-slate-600 hover:text-blue-600"
        }`;

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm pt-safe">
                <div className="mx-auto flex min-w-0 max-w-7xl items-center px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="touch-target mr-2 flex shrink-0 items-center justify-center rounded-xl text-2xl text-slate-700 transition hover:bg-slate-100 md:mr-3 md:hidden"
                        aria-label="Open menu"
                    >
                        ☰
                    </button>

                    {/* Logo */}
                    <Link
                        to="/dashboard"
                        className="flex min-w-0 items-center gap-2"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                            L
                        </div>

                        <span className="truncate text-xl font-bold text-slate-800">
                            Lingora
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 overflow-x-auto whitespace-nowrap md:flex">
                        <Link
                            to="/home"
                            className={navLinkClass("/home")}
                        >
                            Home
                        </Link>

                        <Link
                            to="/dashboard"
                            className={navLinkClass("/dashboard")}
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/vocabulary"
                            className={navLinkClass("/vocabulary")}
                        >
                            Vocabulary
                        </Link>

                        <Link
                            to="/ai-chat"
                            className={navLinkClass("/ai-chat")}
                        >
                            AI Teacher
                        </Link>

                        <Link
                            to="/grammar-check"
                            className={navLinkClass("/grammar-check")}
                        >
                            Grammar
                        </Link>

                        <Link
                            to="/speaking-practice"
                            className={navLinkClass("/speaking-practice")}
                        >
                            Speaking
                        </Link>

                        <Link
                            to="/daily-challenge"
                            className={navLinkClass("/daily-challenge")}
                        >
                            Daily Challenge
                        </Link>

                        <Link
                            to="/roadmap"
                            className={navLinkClass("/roadmap")}
                        >
                            Lessons
                        </Link>

                        <Link
                            to="/leaderboard"
                            className={navLinkClass("/leaderboard")}
                        >
                            Leaderboard
                        </Link>

                        <Link
                            to="/profile"
                            className={navLinkClass("/profile")}
                        >
                            My Account
                        </Link>
                    </nav>

                    {/* Desktop Right Side */}
                    <div className="ml-auto hidden md:flex md:items-center md:gap-3">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:bg-slate-50"
                                    aria-label="My Account"
                                >
                                    <UserAvatar name={userName} size="sm" />
                                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                                        {userName.split(" ")[0]}
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="touch-target rounded-xl bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600 cursor-pointer touch-manipulation"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="touch-target rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 cursor-pointer touch-manipulation"
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <MobileSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </>
    );
}