"use client"

import { useEffect, useState } from "react";
import UserInput from "@/components/UserInput";
import UserMessage from "@/components/UserMessage";
import AssistantMessage from "@/components/AssistantMessage";
import { useConversations } from "./contexts/ConversationsContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import scrollDown from "@/lib/utils/scrollDown";
import { toast } from "react-toastify";
import { removeQueryParam } from "@/lib/utils/removeQueryParam";

export default function Home() {
  const { messages, conversationId, conversations, error } = useConversations();

  // Instead of useSearchParams, track these as state and set from window.location.search on mount
  const [isLogin, setIsLogin] = useState<string | null>(null);
  const [isDelete, setIsDelete] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsLogin(params.get("login"));
      setIsDelete(params.get("delete"));
    }
  }, []);

  // If user just logged in or deleted his account, display a toast message
  useEffect(() => {
    if (isLogin) {
      toast.success("Logged in successfully");
      removeQueryParam('login');
      setIsLogin(null);
    } else if (isDelete) {
      toast.success("Account deleted");
      removeQueryParam('delete');
      setIsDelete(null);
    }
  }, [isDelete, isLogin]);

  useEffect(() => {
    scrollDown();
  }, [messages.length]);

  useEffect(() => {
    if (conversationId && conversations.length) {
      const currentConversation = conversations.find(
        conversation => conversation.id === conversationId
      );
      if (currentConversation) {
        document.title = currentConversation.title;
      }
    }
  }, [conversations, conversationId]);

  return (
    <div className="flex justify-center min-h-[85vh] w-full px-2 md:px-0">
      {/* Render either error message, welcome message, or chat messages */}
      {error ? (
        <p className="text-2xl text-center w-full self-center">{error}</p>
      ) : messages.length < 2 ? (
        <p className="text-3xl/16 text-center self-center mt-12 md:mt-0">
          Hi, I&apos;m Aria 👋,<br /> Ask me anything 🙂
        </p>
      ) : (
        <section className="max-w-2xl h-full flex flex-col items-center gap-12 pb-32 pt-8 w-full flex-1 md:ml-20 ml-0 lg:ml-0 mt-16 lg:mt-0">
          {messages.map((message, index) => {
            if (message.role === "user") {
              return <UserMessage key={`${message.role}-${index}`} content={message.content} />;
            } else if (message.role === "assistant") {
              if (index === messages.length - 1 && message.content.trim() === "") {
                return <LoadingAnimation key={index} />;
              } else {
                const isLast = index === messages.length - 1;
                return <AssistantMessage key={`${message.role}-${index}`} content={message.content} isLast={isLast} />;
              }
            } else {
              return null;
            }
          })}
        </section>
      )}
      <UserInput />
    </div>
  );
}
