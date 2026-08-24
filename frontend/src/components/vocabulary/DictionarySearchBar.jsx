/**
 * DictionarySearchBar
 * -------------------
 * Prominent dictionary-style search input.
 *
 * Props:
 *   value     - current query string
 *   onChange  - callback(newValue)
 *   onSearch  - callback to trigger lookup
 *   loading   - boolean, whether a search is in progress
 */
export default function DictionarySearchBar({
    value,
    onChange,
    onSearch,
    loading,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!value.trim() || loading) return;
        onSearch(value.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                <span className="pl-3 text-slate-400 select-none">🔍</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search any English word..."
                    className="flex-1 bg-transparent py-3 pl-2 pr-2 text-base text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button
                    type="submit"
                    disabled={!value.trim() || loading}
                    className="touch-target flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        "Search"
                    )}
                </button>
            </div>
        </form>
    );
}
