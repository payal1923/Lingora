/**
 * VocabularyFilterBar
 * ------------------
 * Horizontal scrollable filter chips for the Vocabulary module.
 *
 * Props:
 *   active   - currently active filter value ("All" by default)
 *   onChange - callback(newValue)
 *
 * The "All" chip resets both difficulty and category filters.
 */
const FILTERS = [
    { label: "All", value: "All", type: "all" },
    { label: "Beginner", value: "Beginner", type: "difficulty" },
    { label: "Intermediate", value: "Intermediate", type: "difficulty" },
    { label: "Advanced", value: "Advanced", type: "difficulty" },
    { label: "Travel", value: "Travel", type: "category" },
    { label: "Restaurant", value: "Restaurant", type: "category" },
    { label: "Business", value: "Business", type: "category" },
    { label: "Daily Life", value: "Daily Life", type: "category" },
    { label: "Education", value: "Education", type: "category" },
    { label: "Technology", value: "Technology", type: "category" },
    { label: "Health", value: "Health", type: "category" },
    { label: "Emotions", value: "Emotions", type: "category" },
];

export default function VocabularyFilterBar({ active, onChange }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => {
                const isActive = active === f.value;
                return (
                    <button
                        key={f.value}
                        onClick={() => onChange(f.value)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${isActive
                                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                    >
                        {f.label}
                    </button>
                );
            })}
        </div>
    );
}
