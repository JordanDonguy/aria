"use client"

import { useEffect } from "react";
import Menu from "@/components/Menu";
import UserInput from "@/components/UserInput";
import UserMessage from "@/components/UserMessage";
import AssistantMessage from "@/components/AssistantMessage";
import { useConversations } from "./contexts/ConversationsContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import scrollDown from "@/lib/utils/scrollDown";
import TitleLogo from "@/components/TitleLogo";

export default function Home() {
  const { messages } = useConversations();

  useEffect(() => {
    // Scroll down to better display the upcoming assistant message
    scrollDown();
  }, [messages.length])

  return (
    <div className="flex justify-center min-h-[85vh] w-full px-2 md:px-0">
      <Menu />
      <div className="fixed md:left-20 top-0 md:py-[22px] z-30 pt-[18px] md:z-10 md:w-full md:bg-[var(--bg-color)] lg:bg-transparent">
        <TitleLogo />
      </div>

      {/* Render either a welcome message, or chat messages */}
      {messages.length < 2 ? (
        <p className="text-3xl/16 text-center self-center mt-12 md:mt-0"> Hi, I'm Aria 👋,<br /> Ask me anything 🙂</p>

      ) : (
        <section className="max-w-2xl h-full flex flex-col items-center gap-12 pb-32 pt-8 w-full flex-1 md:ml-20 ml-0 lg:ml-0 mt-16 lg:mt-0">

          {messages.map((message, index) => {
            if (message.role === "user") {
              return <UserMessage key={index} content={message.content} />;

            } else if (message.role === "assistant") {
              // If this is the last message and content is empty, render loading animation instead
              if (index === messages.length - 1 && message.content.trim() === "") {
                return (
                  <LoadingAnimation />
                );

              } else {
                const isLast = index === messages.length - 1;
                return <AssistantMessage key={index} content={message.content} isLast={isLast} />;
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
