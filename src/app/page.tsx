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
  const { messages, conversationId, conversations, error, isLoading } = useConversations();

  // Use states to check if user just logged in or deleted his account
  const [isLogin, setIsLogin] = useState<string | null>(null);
  const [isDelete, setIsDelete] = useState<string | null>(null);

  // Define a padding bottom state to auto adjust padding bottom based on userInput textarea heigh
  const [paddingBottom, setPaddingBottom] = useState<number>(0);

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

  // Auto scroll down when new messages are added to chat
  useEffect(() => {
    scrollDown();
  }, [messages.length]);

  // Set document.title when changing cconversation
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
      {isLoading ? (
        <div className="h-40 w-40 self-center rounded-full border-8 border-[var(--input-text-color)] border-t-[var(--menu-color)] animate-spin" />
      ) : error ? (
      <p className="text-2xl text-center w-full self-center" style={{ whiteSpace: "pre-wrap" }}>{error}</p>
      ) : messages.length < 2 ? (
      <p className="text-3xl/16 text-center self-center mt-12 md:mt-0">
        Hi, I&apos;m Aria 👋,<br /> Ask me anything 🙂
      </p>
      ) : (
      <section
        style={{ paddingBottom: `${paddingBottom}px` }}
        className="max-w-2xl h-full flex flex-col items-center gap-12 mb-32 pt-8 w-full flex-1 md:ml-20 ml-0 lg:ml-0 mt-16 lg:mt-0"
      >
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
      )
      }
      <UserInput setPaddingBottom={setPaddingBottom} />
    </div >
  );
}
