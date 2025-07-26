// app/contexts/ConversationsContext.tsx
"use client";

import { createContext, useState, useContext, ReactNode } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
}

interface ConversationsContextType {
  conversations: Conversation[];
  addConversation: (title: string) => void;
  removeConversation: (id: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (role: "user" | "assistant", content: string) => void;
  conversationId: string;
  setConversationId: React.Dispatch<React.SetStateAction<string>>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const addConversation = (title: string) => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title,
    };
    setConversations((prev) => [...prev, newConversation]);
  };

  const removeConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content,
    };
    setMessages((prev) => [...prev, newMessage])
  };

  return (
    <ConversationsContext.Provider
      value=
      {{
        conversations,
        addConversation,
        removeConversation,
        conversationId,
        setConversationId,
        messages,
        setMessages,
        addMessage
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
