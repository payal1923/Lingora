import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

import DictionarySearchBar from "../components/vocabulary/DictionarySearchBar";
import DictionaryCard from "../components/vocabulary/DictionaryCard";
import FlashcardModal from "../components/vocabulary/FlashcardModal";
import VocabQuizModal from "../components/vocabulary/VocabQuizModal";
import FavoriteDrawer from "../components/vocabulary/FavoriteDrawer";

export default function Vocabulary() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.user_id ?? user?.id;

    const [query, setQuery] = useState("");
    const [searchedWords, setSearchedWords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [toast, setToast] = useState(null);

    const [learnedMap, setLearnedMap] = useState({});
    const [favoriteIds, setFavoriteIds] = useState([]);

    // --------------------------------------------------
    // Load favorites + learned state + search history
    // --------------------------------------------------
    useEffect(() => {
        const loadMeta = async () => {
            try {
                const [learnedRes, favRes, historyRes] = await Promise.all([
                    userId
                        ? axios.get(`${API_URL}/learned-words/${userId}`)
                        : Promise.resolve({ data: { learned_words: [] } }),
                    userId
                        ? axios.get(`${API_URL}/favorite-words/${userId}`)
                        : Promise.resolve({ data: { favorite_ids: [] } }),
                    userId
                        ? axios.get(`${API_URL}/vocabulary/search-history/${userId}`)
                        : Promise.resolve({ data: [] }),
                ]);

                const lMap = {};
                (learnedRes.data.learned_words || []).forEach((lw) => {
                    lMap[lw.vocabulary_id] = lw.status || "Learning";
                });
                setLearnedMap(lMap);
                setFavoriteIds(favRes.data.favorite_ids || []);

                const history = historyRes.data || [];
                setSearchedWords(history);
            } catch (err) {
                console.log("Vocabulary meta load error:", err);
            }
        };

        loadMeta();
    }, [userId]);

    // --------------------------------------------------
    // Toast helper
    // --------------------------------------------------
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2200);
    };

    // --------------------------------------------------
    // Favorites
    // --------------------------------------------------
    const toggleFavorite = async (wordId) => {
        if (!userId) {
            showToast("Please log in to save words.");
            return;
        }
        const isFav = favoriteIds.includes(wordId);
        setFavoriteIds((prev) =>
            isFav ? prev.filter((id) => id !== wordId) : [...prev, wordId]
        );
        try {
            if (isFav) {
                await axios.delete(`${API_URL}/favorite-word`, {
                    params: { user_id: userId, vocabulary_id: wordId },
                });
                showToast("Removed from saved words");
            } else {
                await axios.post(`${API_URL}/favorite-word`, {
                    user_id: userId,
                    vocabulary_id: wordId,
                });
                showToast("Saved to your words ⭐");
            }
        } catch {
            setFavoriteIds((prev) =>
                isFav ? [...prev, wordId] : prev.filter((id) => id !== wordId)
            );
            showToast("Could not update favorites");
        }
    };

    // --------------------------------------------------
    // Search handler
    // --------------------------------------------------
    const handleSearch = async (rawWord) => {
        const normalized = rawWord.trim().toLowerCase();
        if (!normalized) return;

        setLoading(true);
        setSearchError(null);

        try {
            const res = await axios.get(
                `${API_URL}/vocabulary/search?word=${encodeURIComponent(rawWord)}`
            );

            const word = res.data;

            if (!word || !word.id) {
                setSearchError("Word not found. Please try another word.");
                return;
            }

            setSearchedWords((prev) => {
                const exists = prev.some(
                    (w) => w.normalized_word === word.normalized_word
                );
                if (exists) return prev;
                return [word, ...prev];
            });

            setQuery("");

            if (userId) {
                try {
                    await axios.post(`${API_URL}/vocabulary/search-history`, {
                        user_id: userId,
                        vocabulary_id: word.id,
                    });
                } catch (historyErr) {
                    console.log("Search history save error:", historyErr);
                }
            }
        } catch (err) {
            console.log("Vocabulary search error:", err);
            setSearchError(
                err.response?.data?.detail ||
                "Could not fetch word. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // Learning status (preserved for modal flows)
    // --------------------------------------------------
    const handleStatusChange = async (wordId, newStatus) => {
        setLearnedMap((prev) => ({ ...prev, [wordId]: newStatus }));
        if (!userId) {
            showToast("Please log in to track progress.");
            return;
        }
        try {
            await axios.post(`${API_URL}/update-word-status`, {
                user_id: userId,
                vocabulary_id: wordId,
                status: newStatus,
            });

            if (newStatus === "Mastered") {
                const word = searchedWords.find((w) => w.id === wordId);
                const xpAmount = word?.xp_reward || 10;
                await axios.post(`${API_URL}/vocabulary-award-xp`, {
                    user_id: userId,
                    xp_amount: xpAmount,
                });
                showToast(`Mastered! +${xpAmount} XP 🎉`);
            } else {
                showToast(`Status: ${newStatus}`);
            }
        } catch (err) {
            console.log("Status update error:", err);
            showToast("Could not update status");
        }
    };

    // --------------------------------------------------
    // Practice entry point
    // --------------------------------------------------
    const handlePracticeStart = (wordId) => {
        if (wordId == null) {
            setShowFlashcards(true);
            return;
        }
        const currentStatus = learnedMap[wordId];
        if (!currentStatus || currentStatus === "New") {
            handleStatusChange(wordId, "Learning");
        }
        setShowFlashcards(true);
    };

    // --------------------------------------------------
    // Loading state (initial page load only)
    // --------------------------------------------------
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 0);
        return () => clearTimeout(timer);
    }, []);

    if (initialLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="mt-4 font-medium text-slate-600">
                        Loading vocabulary...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
                {/* Page header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="touch-target flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-100"
                            aria-label="Back to dashboard"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Vocabulary
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Look up any English word
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFavorites(true)}
                            className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
                        >
                            ⭐ <span className="hidden sm:inline">Saved</span>
                            <span className="rounded-full bg-amber-100 px-1.5 text-xs text-amber-700">
                                {favoriteIds.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mt-6">
                    <DictionarySearchBar
                        value={query}
                        onChange={setQuery}
                        onSearch={handleSearch}
                        loading={loading}
                    />
                </div>

                {/* Error state */}
                {searchError && (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                        <p className="text-sm font-medium text-rose-700">
                            {searchError}
                        </p>
                        <button
                            onClick={() => setSearchError(null)}
                            className="mt-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && searchedWords.length === 0 && !searchError && (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-16 text-center">
                        <span className="text-5xl">📖</span>
                        <p className="mt-3 font-semibold text-slate-600">
                            Start by searching a word
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                            Type any English word above and press Enter or tap Search.
                        </p>
                    </div>
                )}

                {/* Dictionary cards - newest first */}
                <div className="mt-6 space-y-4">
                    {searchedWords.map((word) => (
                        <DictionaryCard
                            key={word.normalized_word}
                            word={word}
                            favorited={favoriteIds.includes(word.id)}
                            onFavorite={toggleFavorite}
                        />
                    ))}
                </div>

                {/* Practice shortcuts when cards exist */}
                {searchedWords.length > 0 && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <button
                            onClick={() => setShowFlashcards(true)}
                            className="touch-target flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                        >
                            🃏 Practice Flashcards
                        </button>
                        <button
                            onClick={() => setShowQuiz(true)}
                            className="touch-target flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                        >
                            🧠 Quick Quiz
                        </button>
                    </div>
                )}
            </main>

            {/* Modals & Drawers */}
            {showFlashcards && (
                <FlashcardModal
                    words={searchedWords}
                    onClose={() => setShowFlashcards(false)}
                />
            )}

            {showQuiz && (
                <VocabQuizModal
                    userId={userId}
                    onClose={() => setShowQuiz(false)}
                />
            )}

            <FavoriteDrawer
                open={showFavorites}
                favorites={searchedWords.filter((w) =>
                    favoriteIds.includes(w.id)
                )}
                onClose={() => setShowFavorites(false)}
                onRemove={(wordId) => toggleFavorite(wordId)}
            />

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-[fadeIn_0.3s_ease]">
                    <div className="rounded-full bg-slate-900/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md">
                        {toast}
                    </div>
                </div>
            )}
        </div>
    );
}
