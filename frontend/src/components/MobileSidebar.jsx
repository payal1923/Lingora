import { Link, useLocation, useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";

export default function MobileSidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.full_name || user?.fullName || user?.name || "Lingora User";

    const handleLogout = () => {
        localStorage.removeItem("user");
        onClose();
        navigate("/login");
        window.location.reload();
    };

    const menuItems = [
        {
            label: "Home",
            icon: "🏠",
            path: "/home",
        },
        {
            label: "Dashboard",
            icon: "📊",
            path: "/dashboard",
        },
        {
            label: "Vocabulary",
            icon: "📚",
            path: "/vocabulary",
        },
        {
            label: "AI Teacher",
            icon: "🤖",
            path: "/ai-chat",
        },
        {
            label: "Grammar",
            icon: "✍️",
            path: "/grammar-check",
        },
        {
            label: "Speaking",
            icon: "🎙️",
            path: "/speaking-practice",
        },
        {
            label: "Daily Challenge",
            icon: "🔥",
            path: "/daily-challenge",
        },
        {
            label: "Lessons",
            icon: "🗺️",
            path: "/roadmap",
        },
        {
            label: "Leaderboard",
            icon: "🏆",
            path: "/leaderboard",
        },
    ];

    return (
        <>
            {/* Dark overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden ${isOpen
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
                    }`}
            />

            {/* Mobile Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-[70] flex h-dvh w-[85%] max-w-[320px] flex-col bg-[#f9f9f9] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-3">
                    <Link
                        to="/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-2 py-2"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                            L
                        </div>

                        <span className="text-lg font-semibold text-slate-900">
                            Lingora
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-slate-700 transition hover:bg-slate-200"
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-2">
                    <div className="space-y-0.5">
                        {menuItems.map((item) => {
                            const active =
                                location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active
                                        ? "bg-[#e9e9e9] font-medium text-slate-950"
                                        : "text-slate-800 hover:bg-[#ececec]"
                                        }`}
                                >
                                    <span className="flex h-7 w-7 items-center justify-center text-lg">
                                        {item.icon}
                                    </span>

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Account Area */}
                <div className="border-t border-slate-200 px-2 py-2">
                    <Link
                        to="/profile"
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-[#ececec] ${location.pathname === "/profile"
                            ? "bg-[#e9e9e9]"
                            : ""
                            }`}
                    >
                        <UserAvatar name={userName} size="sm" />

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {userName}
                            </p>

                            <p className="text-xs text-slate-500">
                                My Account
                            </p>
                        </div>

                        <span className="text-slate-500">›</span>
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                    >
                        <span className="flex h-7 w-7 items-center justify-center text-lg">
                            ↪
                        </span>

                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}