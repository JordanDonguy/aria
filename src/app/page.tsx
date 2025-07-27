"use client"

import UserInput from "@/components/UserInput";
import UserMessage from "@/components/UserMessage";
import AssistantMessage from "@/components/AssistantMessage";
import { useConversations } from "./contexts/ConversationsContext";

export default function Home() {
  const { messages } = useConversations();

  return (
    <div className="flex justify-center h-[85vh] w-full">
      {/* Render either a welcome message, or chat messages */}
      {messages.length < 2 ? (
        <p className="text-3xl/16 text-center self-center"> Hi, I'm Aria 👋,<br /> Ask me anything 🙂</p>
      ) : (
        <section className="max-w-2xl flex flex-col items-center gap-12 pb-38 pt-8 w-full flex-1">
          {messages.map((message, index) => {
            return message.role === "user" ? (
              <UserMessage key={index} content={message.content} />
            ) : message.role === "assistant" ? (
              <AssistantMessage key={index} content={message.content} />
            ) : ""
          })}
        </section>
      )}
      <UserInput />
    </div>
  );
}
