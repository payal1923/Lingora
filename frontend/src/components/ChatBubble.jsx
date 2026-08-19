import { Bot, User } from "lucide-react";

export default function ChatBubble({ sender, message }) {

    const isAI = sender === "ai";

    return (

        <div
            className={`flex ${isAI ? "justify-start" : "justify-end"} mb-6`}
        >

            <div
                className={`flex gap-4 max-w-3xl ${isAI ? "" : "flex-row-reverse"
                    }`}
            >

                {/* Avatar */}

                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg

                    ${isAI
                            ? "bg-gradient-to-r from-blue-600 to-indigo-700"
                            : "bg-blue-600"
                        }`}
                >

                    {isAI ? (
                        <Bot size={22} />
                    ) : (
                        <User size={22} />
                    )}

                </div>

                {/* Message */}

                <div
                    className={`px-6 py-5 rounded-3xl typo-body whitespace-pre-line shadow-lg

                    ${isAI
                            ? "bg-white text-slate-800"
                            : "bg-blue-600 text-white"
                        }`}
                >

                    {message}

                </div>

            </div>

        </div>

    );

}