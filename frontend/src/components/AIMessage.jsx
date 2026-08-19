// AIMessage.jsx
// Composes a single COMPLETED AI reply. Only the LATEST AI message in the
// conversation renders the premium tutor avatar card; all previous AI
// replies render just the chat bubble and feedback cards. This guarantees
// exactly one avatar card is visible in the chat at any time.
//
// The temporary "thinking" state is handled by the separate
// ThinkingAIMessage component, so this component never mutates or reuses a
// message as a loading indicator.
//
// This is a pure presentation component — it does not touch conversation
// state, refs, or the API.

import AITutorAvatar from "./AITutorAvatar";
import AIBubble from "./AIBubble";
import GrammarCard from "./GrammarCard";
import VocabularyCard from "./VocabularyCard";
import EncouragementCard from "./EncouragementCard";

/**
 * @param {object}  message             - the completed AI message { text, grammar, vocabulary, encouragement }
 * @param {boolean} isLatestAIMessage  - true only for the most recent AI reply; renders the avatar card
 * @param {boolean} isSpeaking         - this reply is currently being spoken (TTS)
 * @param {boolean} isListening        - the tutor is listening to the user
 * @param {boolean} online             - show the online indicator
 */
export default function AIMessage({
    message = {},
    isLatestAIMessage = false,
    isSpeaking = false,
    isListening = false,
    online = true,
}) {
    return (
        <div className="flex flex-col gap-4 mb-8">
            {/* Avatar card — only on the latest AI message */}
            {isLatestAIMessage && (
                <AITutorAvatar
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    online={online}
                />
            )}

            {/* Bubble */}
            <div className="pl-1">
                <AIBubble message={message.text || ""} />
            </div>

            {/* Feedback cards */}
            {(message.grammar || message.vocabulary || message.encouragement) && (
                <div className="pl-1 space-y-3">
                    {message.grammar && <GrammarCard text={message.grammar} />}
                    {message.vocabulary && <VocabularyCard text={message.vocabulary} />}
                    {message.encouragement && <EncouragementCard text={message.encouragement} />}
                </div>
            )}
        </div>
    );
}
