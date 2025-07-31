// app/contexts/ConversationsContext.tsx
"use client";

import { useEffect } from "react";
import { createContext, useState, useContext, ReactNode } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
}

interface ConversationsContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  addConversation: (id: string, title: string) => void;
  removeConversation: (id: string) => void;
  conversationId: string;
  setConversationId: React.Dispatch<React.SetStateAction<string>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (role: "user" | "assistant", content: string) => void;
  updateLastMessage: (content: string) => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addConversation = (id: string, title: string) => {
    const newConversation: Conversation = {
      id,
      title,
    };
    setConversations((prev) => [newConversation, ...prev]);
  };

  const removeConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      role,
      content,
    };
    setMessages((prev) => [...prev, newMessage])
  };

  const updateLastMessage = (content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content,
      };
      return updated;
    });
  };

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => {
      setError(null);
    }, 60000);
    return () => clearTimeout(timeout);
  }, [error])

  return (
    <ConversationsContext.Provider
      value=
      {{
        conversations,
        setConversations,
        addConversation,
        removeConversation,
        conversationId,
        setConversationId,
        messages,
        setMessages,
        addMessage,
        updateLastMessage,
        error,
        setError
      }}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversations = () => {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversations must be used within ConversationsProvider");
  return ctx;
};
