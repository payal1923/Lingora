import { Send, Mic } from "lucide-react";

export default function ChatInput({
    message,
    setMessage,
    sendMessage,
    startListening,
    loading,
    listening,
}) {

    return (

        <div className="bg-white border-t border-slate-200 p-4">

            <div className="max-w-5xl mx-auto flex items-center gap-3">

                {/* Voice Button — Capacitor native speech recognition, driven by parent */}

                <button
                    onClick={startListening}
                    disabled={loading || listening}
                    className={`w-12 h-12 rounded-full transition flex items-center justify-center

                    ${listening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-slate-100 hover:bg-slate-200"
                        }`}
                >

                    <Mic size={22} />

                </button>

                {/* Input */}

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {

                        if (e.key === "Enter") {

                            e.preventDefault();
                            sendMessage();

                        }

                    }}
                    placeholder="Type your message..."
                    className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Send Button */}

                <button
                    onClick={() => sendMessage()}
                    disabled={loading}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition

                    ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >

                    <Send size={20} />

                </button>

            </div>

        </div>

    );

}
