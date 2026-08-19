import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

import VocabularyHero from "../components/vocabulary/VocabularyHero";
import VocabularyProgress from "../components/vocabulary/VocabularyProgress";
import VocabularySearchBar from "../components/vocabulary/VocabularySearchBar";
import VocabularyFilterBar from "../components/vocabulary/VocabularyFilterBar";
import VocabularyCard from "../components/vocabulary/VocabularyCard";
import FlashcardModal from "../components/vocabulary/FlashcardModal";
import VocabQuizModal from "../components/vocabulary/VocabQuizModal";
import FavoriteDrawer from "../components/vocabulary/FavoriteDrawer";

export default function Vocabulary() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.user_id ?? user?.id;

    const [words, setWords] = useState([]);
    const [wordOfDay, setWordOfDay] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [learnedMap, setLearnedMap] = useState({}); // { vocabId: status }
    const [favoriteIds, setFavoriteIds] = useState([]);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [toast, setToast] = useState(null);

    // --------------------------------------------------
    // Load all data
    // --------------------------------------------------
    useEffect(() => {
        const loadAll = async () => {
            try {
                const [vocabRes, wodRes, dashRes, learnedRes, favRes] =
                    await Promise.all([
                        axios.get(`${API_URL}/vocabulary`),
                        axios.get(`${API_URL}/word-of-the-day`),
                        userId
                            ? axios.get(`${API_URL}/vocabulary-dashboard/${userId}`)
                            : Promise.resolve({ data: null }),
                        userId
                            ? axios.get(`${API_URL}/learned-words/${userId}`)
                            : Promise.resolve({ data: { learned_words: [] } }),
                        userId
                            ? axios.get(`${API_URL}/favorite-words/${userId}`)
                            : Promise.resolve({ data: { favorite_ids: [] } }),
                    ]);

                setWords(vocabRes.data || []);
                setWordOfDay(wodRes.data || null);
                setDashboard(dashRes.data || null);

                const lMap = {};
                (learnedRes.data.learned_words || []).forEach((lw) => {
                    lMap[lw.vocabulary_id] = lw.status || "Learning";
                });
                setLearnedMap(lMap);

                setFavoriteIds(favRes.data.favorite_ids || []);
            } catch (err) {
                console.log("Vocabulary load error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        // Optimistic UI
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
            // Revert on error
            setFavoriteIds((prev) =>
                isFav ? [...prev, wordId] : prev.filter((id) => id !== wordId)
            );
            showToast("Could not update favorites");
        }
    };

    // --------------------------------------------------
    // Learning status
    // --------------------------------------------------
    const handleStatusChange = async (wordId, newStatus) => {
        // Optimistic UI
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

            // If marking as Mastered, award XP
            if (newStatus === "Mastered") {
                const word = words.find((w) => w.id === wordId);
                const xpAmount = word?.xp_reward || 10;
                await axios.post(`${API_URL}/vocabulary-award-xp`, {
                    user_id: userId,
                    xp_amount: xpAmount,
                });
                showToast(`Mastered! +${xpAmount} XP 🎉`);
                // Refresh dashboard to reflect new XP
                refreshDashboard();
            } else {
                showToast(`Status: ${newStatus}`);
            }
        } catch (err) {
            console.log("Status update error:", err);
            showToast("Could not update status");
        }
    };

    const refreshDashboard = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(
                `${API_URL}/vocabulary-dashboard/${userId}`
            );
            setDashboard(res.data);
        } catch (err) {
            console.log("Dashboard refresh error:", err);
        }
    };

    // --------------------------------------------------
    // Practice entry point
    // --------------------------------------------------
    // Starting practice on a word should automatically move it from
    // "New" into "Learning" (and thus into Learned Words), reusing the
    // existing handleStatusChange/update-word-status logic so there's
    // no duplicate API call and no separate XP path. Words already
    // past "New" (Learning / Mastered / Reviewed) are left untouched —
    // re-practicing shouldn't regress their progress or fire an
    // unnecessary status update.
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
    // Filtering + search
    // --------------------------------------------------
    const filteredWords = useMemo(() => {
        const q = search.trim().toLowerCase();
        return words.filter((w) => {
            // Search across word, meaning, category, difficulty
            if (q) {
                const haystack = [
                    w.word,
                    w.meaning,
                    w.category,
                    w.difficulty,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            // Filter
            if (filter === "All") return true;
            const difficulties = ["Beginner", "Intermediate", "Advanced"];
            if (difficulties.includes(filter)) {
                return w.difficulty === filter;
            }
            return w.category === filter;
        });
    }, [words, search, filter]);

    const favoriteWords = useMemo(
        () => words.filter((w) => favoriteIds.includes(w.id)),
        [words, favoriteIds]
    );

    // --------------------------------------------------
    // Loading state
    // --------------------------------------------------
    if (loading) {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40">
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
                {/* Page header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-100"
                            aria-label="Back to dashboard"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                Vocabulary
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Learn, practice and master new English words.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFavorites(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
                        >
                            ⭐ <span className="hidden sm:inline">Saved</span>
                            <span className="rounded-full bg-amber-100 px-1.5 text-xs text-amber-700">
                                {favoriteIds.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Hero - Word of the Day */}
                <div className="mt-6">
                    <VocabularyHero
                        word={wordOfDay}
                        onPractice={() =>
                            wordOfDay && handlePracticeStart(wordOfDay.id)
                        }
                        onSave={() => wordOfDay && toggleFavorite(wordOfDay.id)}
                        saved={wordOfDay ? favoriteIds.includes(wordOfDay.id) : false}
                    />
                </div>

                {/* Progress */}
                {dashboard && (
                    <div className="mt-6">
                        <VocabularyProgress data={dashboard} />
                    </div>
                )}

                {/* Daily challenge + practice actions */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <ActionTile
                        icon="🃏"
                        title="Practice Flashcards"
                        desc="Flip cards to study words"
                        onClick={() => setShowFlashcards(true)}
                        color="from-indigo-500 to-blue-500"
                    />
                    <ActionTile
                        icon="🧠"
                        title="Quick Vocabulary Quiz"
                        desc="Test yourself & earn XP"
                        onClick={() => setShowQuiz(true)}
                        color="from-emerald-500 to-teal-500"
                    />
                    <ActionTile
                        icon="🎯"
                        title="Today's Goal"
                        desc="Learn 5 new words today"
                        onClick={() => {
                            setFilter("All");
                            setSearch("");
                            showToast("Let's learn 5 words today! 💪");
                        }}
                        color="from-amber-500 to-orange-500"
                    />
                </div>

                {/* Search + Filters */}
                <div className="mt-8 space-y-4">
                    <VocabularySearchBar value={search} onChange={setSearch} />
                    <VocabularyFilterBar active={filter} onChange={setFilter} />
                </div>

                {/* Results count */}
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {filteredWords.length} word
                        {filteredWords.length !== 1 ? "s" : ""} found
                    </p>
                    {(search || filter !== "All") && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setFilter("All");
                            }}
                            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Vocabulary grid */}
                {filteredWords.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-16 text-center">
                        <span className="text-5xl">🔍</span>
                        <p className="mt-3 font-semibold text-slate-600">
                            No words match your search.
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                            Try a different word or filter.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredWords.map((word) => (
                            <VocabularyCard
                                key={word.id}
                                word={word}
                                status={learnedMap[word.id] || null}
                                favorited={favoriteIds.includes(word.id)}
                                onFavorite={toggleFavorite}
                                onStatusChange={handleStatusChange}
                                onPractice={() => {
                                    // Practice a single word via flashcards.
                                    // Starting practice moves New -> Learning.
                                    handlePracticeStart(word.id);
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modals & Drawers */}
            {showFlashcards && (
                <FlashcardModal
                    words={filteredWords.length > 0 ? filteredWords : words}
                    onClose={() => setShowFlashcards(false)}
                />
            )}

            {showQuiz && (
                <VocabQuizModal
                    userId={userId}
                    onClose={() => setShowQuiz(false)}
                    onXpEarned={() => refreshDashboard()}
                />
            )}

            <FavoriteDrawer
                open={showFavorites}
                favorites={favoriteWords}
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

function ActionTile({ icon, title, desc, onClick, color }) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
        >
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110`}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-800">
                    {title}
                </h3>
                <p className="truncate text-xs text-slate-500">{desc}</p>
            </div>
        </button>
    );
}
