"use client";

import React, { useState } from "react";
import { CircleArrowUp } from "lucide-react";
import { useConversations } from "@/app/contexts/ConversationsContext";
import { decodeStream } from "@/lib/utils/decodeStram";
import { askConversationTitle } from "@/lib/utils/askConversationTitle";

function UserInput() {
  const { messages, addMessage, updateLastMessage } = useConversations();
  const [input, setInput] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;

    // Save form input in a variable and reset before reseting it
    const currentInput = input;
    setInput("");

    // Add the user message first
    addMessage("user", currentInput);

    // Add an empty assistant message as a placeholder
    addMessage("assistant", "");

    // Updated messages including the new user input
    const updatedMessages = [...messages, { role: "user", content: currentInput }];

    
    try {
      const res = await fetch("/api/mistral/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!res.body) {
        throw new Error("No response body");
      }
      
      // Decode streamed response and update last message
      await decodeStream(res, updateLastMessage);

      // Ask conversation title to Mistral if new conversation
      if (messages.length < 2) {
        document.title = await askConversationTitle(currentInput);
      };
    } catch (error) {
      console.error("Error calling Mistral API:", error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        fixed bottom-[2vh] w-[calc(100%-1rem)] md:w-full max-w-2xl
        rounded-4xl bg-[var(--input-color)]
        shadow-sm text-lg md:ml-20 ml-0 lg:ml-0
        transition-[margin] duration-500 ease-in-out"
    >
      <fieldset className="flex justify-between p-4 w-full ">
        <input
          id="text-input"
          name="text-input"
          value={input}
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          className="w-full text-[var(--text-color)] bg-transparent outline-none px-2"
          autoComplete="off"
          maxLength={1000}
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
  );
}

export default UserInput;
