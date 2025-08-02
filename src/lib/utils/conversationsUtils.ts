import type { Conversation, Message } from "@/app/contexts/ConversationsContext";

// ------------ Post a conversation to db ------------
export async function postConversation(
  addConversation: (id: string, title: string) => void,
  setConversationId: (id: string) => void
) {
  try {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: document.title }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create conversation: ${res.status} - ${errorText}`);
    }

    const data = await res.json();

    await addConversation(data.id, data.title);
    setConversationId(data.id);

    return data.id;
  } catch (error) {
    throw new Error(`Error saving conversation to db: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// ------------ Delete a conversation from db ------------
export async function deleteConversation(
  conversation_id: string,
  conversationId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setConversationId: React.Dispatch<React.SetStateAction<string>>,
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  try {
    // If deleting current conversation, reset messages and conversationId
    if (conversation_id === conversationId) {
      setMessages([]);
      setConversationId("");
    };
    // Remove conversation from conversations list
    setConversations((prev) =>
      prev.filter((conversation) => conversation.id !== conversation_id)
    );
    // Delete conversation in db
    const res = await fetch(`/api/conversations?id=${conversation_id}`, {
      method: "DELETE"
    });

    if (res.status === 429) {
      setError("Too many requests... Please wait a minute 🙏");
      return
    };


    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.error || "Failed to delete conversation");
    }

  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
};
