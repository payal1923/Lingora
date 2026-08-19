/**
 * VocabularySearchBar
 * -------------------
 * Premium search input for the Vocabulary module.
 *
 * Props:
 *   value    - current search string
 *   onChange - callback(newValue)
 */
export default function VocabularySearchBar({ value, onChange }) {
    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search by word, meaning, category or difficulty..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:text-base"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
