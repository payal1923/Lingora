import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import UserAvatar from "../components/UserAvatar";

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}") || {};
        } catch {
            return {};
        }
    })();
    const currentUserName =
        currentUser?.full_name || currentUser?.fullName || currentUser?.name || "";
    const currentUserId = currentUser?.user_id || currentUser?.id;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get(`${API_URL}/leaderboard`);
                setUsers(response.data.leaderboard);
                console.log(
                    "[XP-DEBUG] Leaderboard.jsx fetch | users=",
                    response.data.leaderboard.length,
                    "| top_xp=",
                    response.data.leaderboard[0]?.xp
                );
            } catch (error) {
                console.log("Error loading leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();

        const onFocus = () => fetchLeaderboard();
        const onVisibility = () => {
            if (document.visibilityState === "visible") fetchLeaderboard();
        };

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    const medal = (index) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return "🏅";
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:p-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <div className="max-w-3xl mx-auto">
                <h1 className="typo-page-title text-blue-600 mb-6 sm:mb-8">
                    🏆 Leaderboard
                </h1>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <svg className="h-8 w-8 animate-spin mb-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="typo-body">Loading…</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p className="typo-body">No leaderboard data yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {users.map((user, index) => {
                            const isMe =
                                (currentUserId && user.user_id === currentUserId) ||
                                (currentUserName && user.name === currentUserName);
                            return (
                                <div
                                    key={user.user_id}
                                    className={`bg-white p-4 sm:p-5 rounded-2xl shadow flex justify-between items-center hover:shadow-lg transition min-h-[64px] ${isMe ? "ring-2 ring-blue-400 border-blue-200" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="text-2xl sm:text-3xl flex-shrink-0 w-8 text-center">
                                            {medal(index)}
                                        </div>
                                        <UserAvatar name={user.name} size="md" />
                                        <div className="min-w-0">
                                            <h2 className="typo-card-title text-slate-800 truncate">
                                                {user.name}
                                                {isMe && (
                                                    <span className="ml-2 typo-badge text-blue-600 align-middle">
                                                        (You)
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="typo-secondary text-slate-500">
                                                Quizzes: {user.quizzes}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="typo-card-title text-blue-600">
                                            ⭐ {user.xp} XP
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
