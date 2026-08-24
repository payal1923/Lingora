// OptionPickerModal.jsx
// ---------------------
// Reusable single-select option picker used by the Profile page for every
// learning preference (Accent, Teaching Language, Learning Goal, Daily Goal,
// Study Time, Difficulty) and the settings modals (Reminder Time, Privacy).
//
// Props:
//   open       — boolean, whether the modal is visible
//   title      — modal title
//   subtitle   — optional subtitle / helper text
//   options    — [{ key, label, icon?, hint?, flag?, sample? }]
//   value      — currently selected key
//   onSelect   — (key) => void  (called when an option is chosen)
//   onClose    — () => void     (called on backdrop / close)
//   accentDemo — boolean, when true renders an AccentVoiceDemo for each
//                option (used only by the Accent picker)

import AccentVoiceDemo from "./AccentVoiceDemo";
import useModalBehavior from "../Hooks/useModalBehavior";

export default function OptionPickerModal({
    open,
    title,
    subtitle,
    options = [],
    value,
    onSelect,
    onClose,
    accentDemo = false,
}) {
    useModalBehavior(open, onClose);

    if (!open) return null;

    return (
        <div className="mobile-modal-backdrop fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:px-4">
            {/* Backdrop */}
            <button
                type="button"
                aria-label={`Close ${title}`}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />

            {/* Modal — bottom sheet on mobile, centered card on desktop */}
            <div role="dialog" aria-modal="true" aria-label={title} className="mobile-modal-panel relative z-10 w-full max-w-lg rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl">
                {/* Drag handle (mobile) */}
                <div className="sm:hidden sticky top-0 z-10 flex justify-center bg-white pt-3 pb-2">
                    <span className="h-1.5 w-10 rounded-full bg-slate-200" />
                </div>

                <div className="px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="touch-target flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer touch-manipulation"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 flex flex-col gap-2.5">
                        {options.map((opt) => {
                            const isSelected = value === opt.key;
                            return (
                                // The selectable row is a div[role="button"] (not a real
                                // <button>) so that the AccentVoiceDemo — which renders its
                                // own <button> — can live inside it. HTML forbids nesting a
                                // <button> inside another <button>; using a div with the
                                // button role + keyboard handler keeps the row fully
                                // clickable/keyboard-accessible while staying valid DOM.
                                <div
                                    key={opt.key}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isSelected}
                                    onClick={() => onSelect(opt.key)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onSelect(opt.key);
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 touch-manipulation min-h-[52px] cursor-pointer ${isSelected
                                        ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-200"
                                        : "border-slate-200 bg-white hover:bg-slate-50"
                                        }`}
                                >
                                    {opt.flag && (
                                        <span className="text-2xl flex-shrink-0" role="img" aria-label={opt.label}>
                                            {opt.flag}
                                        </span>
                                    )}
                                    {opt.icon && !opt.flag && (
                                        <span className="text-xl flex-shrink-0">{opt.icon}</span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>
                                            {opt.label}
                                        </p>
                                        {opt.hint && (
                                            <p className="mt-0.5 text-xs text-slate-500">{opt.hint}</p>
                                        )}
                                    </div>
                                    {accentDemo && opt.sample && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <AccentVoiceDemo accent={opt} active={isSelected} size="sm" />
                                        </div>
                                    )}
                                    {isSelected && !accentDemo && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-indigo-600 flex-shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
