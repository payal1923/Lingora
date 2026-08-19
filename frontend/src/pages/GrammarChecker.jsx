import { useState } from "react";
import axios from "axios";
import API_URL from "../config/api";

export default function GrammarChecker() {

    const [sentence, setSentence] = useState("");

    const [correctSentence, setCorrectSentence] = useState("");
    const [explanation, setExplanation] = useState("");
    const [grammarTip, setGrammarTip] = useState("");

    const [loading, setLoading] = useState(false);

    const checkGrammar = async () => {

        if (!sentence.trim() || loading) return;

        try {

            setLoading(true);

            setCorrectSentence("");
            setExplanation("");
            setGrammarTip("");

            const response = await axios.post(
                `${API_URL}/grammar-check`,
                {
                    text: sentence,
                }
            );

            const aiResponse = response.data;

            setCorrectSentence(
                aiResponse.corrected_sentence ||
                "No correction available."
            );

            setExplanation(
                aiResponse.explanation ||
                "No explanation available."
            );

            setGrammarTip(
                aiResponse.grammar_tip ||
                "Keep practicing every day!"
            );

        } catch (error) {

            console.log(
                "Grammar Error",
                error.response?.data || error.message
            );

            setCorrectSentence("");
            setExplanation("");
            setGrammarTip(
                "Unable to connect to Grammar Checker."
            );

        } finally {

            setLoading(false);

        }

    };

    const copySentence = async () => {

        if (!correctSentence) return;

        try {

            await navigator.clipboard.writeText(
                correctSentence
            );

            alert("Correct sentence copied!");

        } catch (error) {

            console.log(
                "Copy Error",
                error
            );

        }

    };

    return (

        <div className="min-h-screen bg-slate-100">

            <div className="max-w-5xl mx-auto py-6 px-4 sm:py-10 sm:px-6">

                <h1 className="typo-page-title text-blue-600 mb-2">
                    ✍️ AI Grammar Checker
                </h1>

                <p className="typo-body text-slate-600 mb-6 sm:mb-8">
                    Improve your English grammar instantly using AI.
                </p>

                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6">

                    <textarea
                        value={sentence}
                        onChange={(e) =>
                            setSentence(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                !e.shiftKey
                            ) {

                                e.preventDefault();

                                checkGrammar();

                            }

                        }}
                        rows="5"
                        placeholder="Example: He go to school yesterday."
                        className="w-full border rounded-2xl p-4 typo-body focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />

                    <button
                        onClick={checkGrammar}
                        disabled={loading}
                        className={`mt-4 w-full sm:w-auto px-8 py-3 rounded-xl typo-button text-white transition ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading
                            ? "Checking..."
                            : "Check Grammar"}
                    </button>

                    {(correctSentence ||
                        explanation ||
                        grammarTip) && (

                            <div className="mt-8 sm:mt-10">

                                <h2 className="typo-section-title text-slate-800 mb-6">
                                    🤖 AI Grammar Feedback
                                </h2>

                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-5 mb-5">

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">

                                        <h3 className="typo-card-title text-green-700">
                                            ✅ Correct Sentence
                                        </h3>

                                        <button
                                            onClick={copySentence}
                                            className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg typo-button hover:bg-green-700"
                                        >
                                            Copy
                                        </button>

                                    </div>

                                    <p className="typo-body text-slate-700 whitespace-pre-line break-words">
                                        {correctSentence}
                                    </p>

                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-5">

                                    <h3 className="typo-card-title text-blue-700 mb-3">
                                        📘 Explanation
                                    </h3>

                                    <p className="typo-body text-slate-700 whitespace-pre-line break-words">
                                        {explanation}
                                    </p>

                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-5">

                                    <h3 className="typo-card-title text-yellow-700 mb-3">
                                        💡 Grammar Tip
                                    </h3>

                                    <p className="typo-ai-tip text-slate-700 whitespace-pre-line break-words">
                                        {grammarTip}
                                    </p>

                                </div>

                            </div>

                        )}

                </div>

            </div>

        </div>

    );

}