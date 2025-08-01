"use client"

import { useEffect } from "react";
import UserInput from "@/components/UserInput";
import UserMessage from "@/components/UserMessage";
import AssistantMessage from "@/components/AssistantMessage";
import { useConversations } from "./contexts/ConversationsContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import scrollDown from "@/lib/utils/scrollDown";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function Home() {
  const { messages, conversationId, conversations, error } = useConversations();

  // Get login and delete params in url (to later display toast message or not)
  const searchParams = useSearchParams();
  const isLogin = searchParams.get('login');
  const isDelete = searchParams.get('delete');

  // If user just logged in or deleted his account, display a toast message
  useEffect(() => {
    // Function to remove query param from URL (cleanup)
    const removeQueryParam = (param: string) => {
      const url = new URL(window.location.href);
      url.searchParams.delete(param);
      window.history.replaceState({}, '', url.toString());
    };
    // If user logged in (or deleted account) -> show toast message, then cleanup url
    if (isLogin) {
      toast.success("Logged in successfully")
      removeQueryParam('login');
    } else if (isDelete) {
      toast.success("Account deleted")
      removeQueryParam('delete');
    }
  }, [])

  useEffect(() => {
    // Scroll down to better display the upcoming assistant message
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
  }, [conversationId])

  return (
    <div className="flex justify-center min-h-[85vh] w-full px-2 md:px-0">

      {/* Render either error message, welcome message, or chat messages */}
      {error ? (
        <p className="text-2xl text-center w-full self-center">{error}</p>
      ) : messages.length < 2 ? (
        <p className="text-3xl/16 text-center self-center mt-12 md:mt-0"> Hi, I'm Aria 👋,<br /> Ask me anything 🙂</p>

      ) : (
        <section className="max-w-2xl h-full flex flex-col items-center gap-12 pb-32 pt-8 w-full flex-1 md:ml-20 ml-0 lg:ml-0 mt-16 lg:mt-0">

          {messages.map((message, index) => {
            if (message.role === "user") {
              return <UserMessage key={`${message.role}-${index}`} content={message.content} />;

            } else if (message.role === "assistant") {
              // If this is the last message and content is empty, render loading animation instead
              if (index === messages.length - 1 && message.content.trim() === "") {
                return (
                  <LoadingAnimation key={index} />
                );

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
  )
};
