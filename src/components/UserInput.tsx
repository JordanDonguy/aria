"use client";

import React, { useState, useRef } from "react";
import { createSpeechRecognition } from "@/lib/utils/speechRecognition";
import { CircleArrowUp, Mic, MicOff } from "lucide-react";
import { useConversations } from "@/app/contexts/ConversationsContext";
import { decodeStream } from "@/lib/utils/decodeStram";
import { askConversationTitle } from "@/lib/utils/askConversationTitle";
import { chatInputSchema } from "@/lib/schemas";
import { postConversation } from "@/lib/utils/conversationsUtils";
import { postMessages } from "@/lib/utils/messagesUtils";
import { useSession } from "next-auth/react";
import ModelSelect from "./ModelSelect";
import PersonalitySelect from "./PersonalitySelect";

interface UserInputProps {
  setPaddingBottom: React.Dispatch<React.SetStateAction<number>>
}

function UserInput({ setPaddingBottom }: UserInputProps) {
  const {
    messages,
    setMessages,
    addMessage,
    updateLastMessage,
    conversationId,
    setConversationId,
    addConversation,
    setError,
    aiModel,
    setAiModel,
    personality,
    setPersonality
  } = useConversations();

  const { status } = useSession();
  const [input, setInput] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Wait one frame to ensure the latest input is flushed
    await new Promise(requestAnimationFrame);

    // Return if input's empty
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

    // Reset textarea height & main display padding bottom
    setInput("");
    const textarea = document.getElementById("text-input") as HTMLTextAreaElement | null;
    if (textarea) textarea.style.height = "auto"; // shrink back to initial
    setPaddingBottom(0);

    // Build updatedMessages for Mistral without empty content
    const updatedMessages = [
      ...messages.filter(msg => msg.role !== "assistant" || msg.content.trim() !== ""),
      { role: "user", content: userContent }
    ];

    // Add the user message first
    addMessage("user", userContent);

    // Add an empty assistant message as a placeholder
    addMessage("assistant", " ");


    try {
      const res = await fetch("/api/mistral/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, model: aiModel, personality }),
      });

      if (res.status === 429) {
        // Show user-friendly message
        setError(`Looks like our AI is saturated... 😰\nPlease try again later 🙏`);
        // Put the user message back in input text
        setInput(userContent);
        // Remove the last two messages from state
        setMessages((prev) => prev.slice(0, -2));
        return; // Stop further execution
      }

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

  // ------ Speech recognition part ------
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null);

  function toggleRecording() {
    if (!isRecording) {
      recognitionRef.current = createSpeechRecognition({
        onResult: (transcript) => {
          setInput(transcript);
        },
        onError: (err) => {
          console.error("Speech error:", err);
          setIsRecording(false);
        },
        onStop: () => setIsRecording(false),
      });
      recognitionRef.current?.start();
      setIsRecording(true);
    } else {
      recognitionRef.current?.stop();
      setIsRecording(false);
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
      <fieldset className="flex flex-col gap-2 justify-between p-4 w-full ">

        {/* -------- Text input -------- */}
        <textarea
          id="text-input"
          name="text-input"
          value={input}
          placeholder="Ask anything..."
          onChange={(e) => {
            setInput(e.target.value);
            // Auto-resize logic with max height
            e.target.style.height = "auto";
            const newHeight = Math.min(e.target.scrollHeight, 200); // 200px max
            e.target.style.height = `${newHeight}px`;

            // Adjust main display padding-bottom to match textarea height
            setPaddingBottom(newHeight);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // prevent newline
              // Submit form manually
              // Shift+Enter will naturally insert a newline
              const form = e.currentTarget.form;
              if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
            }
          }}
          className="w-full resize-none text-[var(--text-color)] bg-transparent outline-none px-2 overflow-y-auto"
          autoComplete="off"
          rows={1}
        />

        <div className="flex justify-between pl-1 pt-1">
          <div className="flex gap-4">
            {/* -------- AI model select modal -------- */}
            <ModelSelect aiModel={aiModel} setAiModel={setAiModel} />
            {/* -------- AI personality select modal -------- */}
            <PersonalitySelect personality={personality} setPersonality={setPersonality} />
          </div>

          <div className="flex gap-2">
            {/* -------- Voice input button -------- */}
            <button
              type="button"
              aria-label="mic-button"
              onClick={toggleRecording}
              className="w-8 h-8 flex items-center justify-center rounded-full
                       text-[var(--text-color)] transition-transform duration-150
                       hover:bg-[var(--hover-color)] active:scale-90 hover:cursor-pointer"
            >
              {isRecording ? <MicOff size={24} className="text-red-500" /> : <Mic size={24} />}
            </button>

            {/* -------- Submit button -------- */}
            <button
              type="submit"
              aria-label="submit-button"
              className="
                w-8 h-8 flex items-center justify-center
                text-[var(--text-color)] transition-transform duration-150
                hover:scale-115 hover:cursor-pointer active:scale-90  rounded-full"
            >
              <CircleArrowUp size={32} />
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

export default UserInput;
