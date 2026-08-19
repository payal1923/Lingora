import useVocabSpeech from "../../Hooks/useVocabSpeech";

/**
 * FavoriteDrawer
 * ------------
 * A slide-in drawer showing the user's saved (favorite) words.
 *
 * Props:
 *   open       - boolean, whether the drawer is visible
 *   favorites  - array of vocabulary objects the user has favorited
 *   onClose    - callback to close the drawer
 *   onRemove   - callback(wordId) to remove a word from favorites
 */
export default function FavoriteDrawer({ open, favorites, onClose, onRemove }) {
    const { speak, speakSlow } = useVocabSpeech();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            ⭐ Saved Words
                        </h2>
                        <p className="text-sm text-slate-500">
                            {favorites.length} word{favorites.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close favorites"
                    >
                        ✕
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {favorites.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <span className="text-5xl">📭</span>
                            <p className="mt-3 text-sm font-medium text-slate-500">
                                No saved words yet.
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Tap the ☆ on any word to save it here.
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {favorites.map((word) => (
                                <li
                                    key={word.id}
                                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-lg font-bold text-slate-800">
                                                    {word.word}
                                                </h3>
                                                <button
                                                    onClick={() => speak(word.word)}
                                                    className="rounded-full p-1 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                                    aria-label={`Listen to ${word.word}`}
                                                >
                                                    🔊
                                                </button>
                                                <button
                                                    onClick={() => speakSlow(word.word)}
                                                    className="rounded-full p-1 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                                    aria-label={`Slow pronunciation of ${word.word}`}
                                                >
                                                    🐢
                                                </button>
                                            </div>
                                            {word.pronunciation && (
                                                <p className="text-xs text-slate-500">
                                                    {word.pronunciation}
                                                </p>
                                            )}
                                            <p className="mt-1.5 text-sm text-slate-600">
                                                {word.meaning}
                                            </p>
                                            {word.example && (
                                                <p className="mt-1 text-xs italic text-slate-500">
                                                    “{word.example}”
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onRemove(word.id)}
                                            className="shrink-0 rounded-lg p-1.5 text-amber-500 transition hover:bg-amber-50"
                                            aria-label="Remove from favorites"
                                        >
                                            ⭐
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </>
    );
}
