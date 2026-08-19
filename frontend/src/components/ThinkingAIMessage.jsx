// ThinkingAIMessage.jsx
// A dedicated, temporary "thinking" indicator shown while the AI is
// generating a reply. It is intentionally separate from AIMessage:
//   - AIMessage always renders a COMPLETED AI response (avatar + bubble +
//     feedback cards).
//   - ThinkingAIMessage renders ONLY the tutor avatar in its thinking state
//     plus a typing indicator — no bubble, no feedback cards.
//
// This keeps the temporary loading state from ever mutating or reusing a
// completed message. It is a pure presentation component and touches no
// conversation state, refs, or the API.

import AITutorAvatar from "./AITutorAvatar";

export default function ThinkingAIMessage({ isListening = false, online = true }) {
    return (
        <div className="flex flex-col gap-3 mb-8">
            <AITutorAvatar
                isThinking
                isListening={isListening}
                online={online}
            />

            {/* Typing indicator line */}
            <div className="pl-1 flex items-center gap-3">
                <div className="flex items-center gap-1.5 h-6">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="lingora-aitutor-dot w-2.5 h-2.5 rounded-full bg-indigo-500"
                            style={{ animationDelay: `${i * 0.18}s` }}
                        />
                    ))}
                </div>
                <span className="text-sm text-slate-500 font-medium">
                    Lingora AI is thinking…
                </span>
            </div>
        </div>
    );
}
