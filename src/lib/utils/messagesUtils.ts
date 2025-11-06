import type { Message } from "@/app/contexts/ConversationsContext";

// ------------ Post messages (user and assistant) to db ------------
export async function postMessages(
  conversationId: string,
  userContent: string,
  assistantContent: string
) {
  try {
    // Post user message first
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        role: "user",
        content: userContent,
      }),
    });

    // Then post assistant message
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantContent,
      }),
    });
  } catch (error) {
    console.error(error);
    throw new Error("Error saving messages to db.");
  }
}

// ------------ Fetch messages of a conversation from db ------------
export async function fetchMessages(
  conversation_id: string,
  setConversationId: React.Dispatch<React.SetStateAction<string>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>,
  scrollDown: () => void,
  setIsloading: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    if (window.innerWidth < 768) {
      setShowMenu(false);
    }

    const res = await fetch(`/api/messages?conversation_id=${conversation_id}`);

    if (res.status === 429) {
      setError("Too many requests... Please wait a minute 🙏");
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.error || "Failed to fetch messages");
    }

    const data = await res.json();
    setMessages(data);
    setConversationId(conversation_id);

    setIsloading(false);

    setTimeout(() => {
      scrollDown();
    }, 100);
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};
