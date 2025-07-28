"use client"

import Menu from "@/components/Menu";
import UserInput from "@/components/UserInput";
import UserMessage from "@/components/UserMessage";
import AssistantMessage from "@/components/AssistantMessage";
import { useConversations } from "./contexts/ConversationsContext";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function Home() {
  const { messages } = useConversations();

  return (
    <div className="flex justify-center min-h-[85vh] w-full px-2 md:px-0">
      <Menu />
      {/* Render either a welcome message, or chat messages */}

      {messages.length < 2 ? (
        <p className="text-3xl/16 text-center self-center"> Hi, I'm Aria 👋,<br /> Ask me anything 🙂</p>

      ) : (
        <section className="max-w-2xl h-full flex flex-col items-center gap-12 pb-32 pt-8 w-full flex-1">

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
