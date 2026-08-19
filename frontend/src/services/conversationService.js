import axios from "axios";

import API_URL from "../config/api";

export async function sendConversationMessage({ topic, difficulty, history }) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  console.groupCollapsed(`[conversationService] sendConversationMessage ${requestId}`);
  console.log("Payload:", { topic, difficulty, historyLength: history?.length, history });
  console.log("API_URL:", API_URL);

  try {
    const response = await axios.post(`${API_URL}/conversation-chat`, {
      topic,
      difficulty,
      history,
    });

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    console.groupEnd();

    return response.data;
  } catch (error) {
    console.error("[conversationService] Caught error:", error);
    console.log("Error message:", error.message);
    console.log("Error response:", error.response);
    console.log("Error status:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.groupEnd();

    return {
      reply: "Sorry, I couldn't connect to Lingora AI. Please try again.",
      grammar_feedback: "No grammar feedback available.",
    };
  }
}
