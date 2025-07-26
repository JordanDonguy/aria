"use client";

import React from "react";
import { useState } from "react";
import { CircleArrowUp } from "lucide-react";
import { useConversations } from "@/app/contexts/ConversationsContext";
import { decodeStream } from "@/lib/utils/decodeStram";

function UserInput() {
  const { messages, addMessage, updateLastMessage } = useConversations();
  const [input, setInput] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;

    // Add the user message first
    addMessage("user", input);

    // Add an empty assistant message as a placeholder
    addMessage("assistant", "");

    // Define an updatedMessages array to send the messages array along with the new user message to Mistral AI
    const updatedMessages = [...messages, {role: "user", content: input}];

    setInput("");

    try {
      const res = await fetch("/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.body) {
        throw new Error("No response body");
      };

      // Decode streamed response and updates bot message's content in messages
      await decodeStream(res, updateLastMessage);

    } catch (error) {
      console.error("Error calling Mistral API:", error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        fixed bottom-[2vh] w-[calc(100%-1rem)] md:w-full max-w-xl
        rounded-4xl bg-[var(--input-color)]
        shadow-sm text-lg
        transition-[margin] duration-500 ease-in-out"
    >
      <fieldset className="flex justify-between p-4 w-full ">
        <input
          id="text-input"
          name="text-input"
          value={input}
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          className="w-full text-[var(--text-color)] bg-transparent outline-none"
        />
        <button
          type="submit"
          aria-label="submit-button"
          className="
            w-10 aspect-square flex items-center justify-center
            text-[var(--text-color)] transition-transform duration-150
            hover:scale-115 hover:cursor-pointer active:scale-90"
        >
          <CircleArrowUp size={32} />
        </button>
      </fieldset>
    </form>
  )
}

export default UserInput
