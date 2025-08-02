"use client";

import React, { useState } from "react";
import { CircleArrowUp } from "lucide-react";
import { useConversations } from "@/app/contexts/ConversationsContext";
import { decodeStream } from "@/lib/utils/decodeStram";
import { askConversationTitle } from "@/lib/utils/askConversationTitle";
import { chatInputSchema } from "@/lib/schemas";
import { postConversation } from "@/lib/utils/conversationsUtils";
import { postMessages } from "@/lib/utils/messagesUtils";
import { useSession } from "next-auth/react";

function UserInput() {
  const {
    messages,
    setMessages,
    addMessage,
    updateLastMessage,
    conversationId,
    setConversationId,
    addConversation,
    setError
  } = useConversations();
  const [input, setInput] = useState<string>("");
  const { status } = useSession();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!input.trim()) return;

    // Blur the active element (input) immediately on submit to close mobile keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    };

    // Validate data with zod
    const validatedData = chatInputSchema.safeParse({ message: input });
    if (!validatedData.success) {
      setError(validatedData.error.issues[0].message)
      return
    };

    // Save form input in a variable and reset before reseting it
    const userContent = validatedData.data.message;
    setInput("");

    // Add the user message first
    addMessage("user", userContent);

    // Add an empty assistant message as a placeholder
    addMessage("assistant", "");

    // Updated messages including the new user input
    const updatedMessages = [...messages, { role: "user", content: userContent }];


    try {
      const res = await fetch("/api/mistral/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Remove last two messages from state and throw error
        setMessages((prevMessages) => prevMessages.slice(0, -2));
        if (errorData?.error) throw new Error(errorData.error);
        else throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      // Decode streamed response and update last message
      const assistantContent = await decodeStream(res, updateLastMessage);

      // Ask conversation title to Mistral if new conversation, save conversation and messages to db (if user logged in)
      if (messages.length < 2) {
        document.title = await askConversationTitle(userContent);
        if (status === "authenticated") {
          const newConversationId = await postConversation(addConversation, setConversationId);
          // Save messages to db
          await postMessages(newConversationId, userContent, assistantContent)
        }
      } else {
        if (status === "authenticated") {
          await postMessages(conversationId, userContent, assistantContent)
        }
      }
    } catch (error) {
      console.error("Error calling Mistral API:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unknown error occurred");
      }
    }
  };

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
