
"use client";

import { useConversations } from "@/app/contexts/ConversationsContext";
import TitleLogo from "./TitleLogo";
import { useState, useEffect } from "react";
import { Sun, Moon, User, MessageCircle, LogOut, CircleX } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import scrollDown from "@/lib/utils/scrollDown";
import Link from 'next/link';

function Menu() {
  const [mounted, setMounted] = useState<boolean>(false);               // To wait for component to be mounted to display some elements
  const [showMenu, setShowMenu] = useState<boolean>(false);             // To display full menu
  const [hideElement, setHideElement] = useState<boolean>(false);       // To hide elements (display: none)
  const [displayElement, setDisplayElement] = useState<boolean>(false)  // To display or not element (opacity, scale, etc...)

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setMessages, conversations, setConversations, conversationId, setConversationId, setError } = useConversations();

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const router = useRouter();

  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/user');

  // If user clicks on new chat, reset messages and document.title
  function newChat() {
    setMessages([]);
    setConversationId("");
    router.push("/");
    if (window.innerWidth < 768) {
      setShowMenu(false)
    }
  };

  // Fetch messages of a conversation when clicking on the conversation's button
  async function fetchMessages(conversation_id: string) {
    try {
      setConversationId(conversation_id);     // Update conversationId (and automatically document.title)
      // If on mobile, close menu
      if (window.innerWidth < 768) {
        setShowMenu(false)
      };
      const res = await fetch(`/api/messages?conversation_id=${conversation_id}`);

      if (res.status === 429) {
        setError("Too many requests... Please wait a minute 🙏");
        return
      };

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to fetch messages");
      }

      const data = await res.json();
      setMessages(data);
      router.push("/");                       // Navigate to chat view
      setTimeout(() => scrollDown(), 50);     // Scroll down after a very short delay to make sure UI's rendered
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // delete a conversation if clicking delete button
  async function deleteConversation(conversation_id: string) {
    try {
      // If deleting current conversation, reset messages and conversationId
      if (conversation_id === conversationId) {
        setMessages([]);
        setConversationId("");
      };
      // Remove conversation from conversations list
      setConversations((prev) =>
        prev.filter((conversation) => conversation.id !== conversation_id)
      );
      // Delete conversation in db
      const res = await fetch(`/api/conversations?id=${conversation_id}`, {
        method: "DELETE"
      });

      if (res.status === 429) {
        setError("Too many requests... Please wait a minute 🙏");
        return
      };


      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to delete conversation");
      }

    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Used to prevent display glitch on elements relying on resolvedTheme and session for colors and display
  useEffect(() => {
    setMounted(true);
  }, []);

  // Used to hide elements (not clickable) but still allow for fade-in / fade-out transitions
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!showMenu) {
      setDisplayElement(false)
      // Wait for fade-out transition, then hide
      timeout = setTimeout(() => {
        setHideElement(true);
      }, 400);
    } else {
      // Unhide element, then fade-in transition
      setHideElement(false)
      timeout = setTimeout(() => setDisplayElement(true), 30)
    }
    return () => clearTimeout(timeout);
  }, [showMenu]);


  // Fetch conversations on mount if user's logged-in
  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchConversations = async () => {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (res.ok) {
        setConversations(data);
      } else {
        console.error("Error:", data.error);
        if (data.error instanceof Error) {
          setError(data.error);
        } else {
          setError("Unknown error occurred");
        }
      }
    };
    fetchConversations();
  }, [status])

  return (
    <header
      className={`fixed z-20 top-0 left-0 md:p-4 px-2 md:min-h-screen
        shrink-0 bg-[var(--menu-color)] flex flex-col 
        items-start gap-3 header-transition
        ${showMenu ? "md:w-64 w-full h-screen md:shadow-sm" : "md:[width:calc(40px+2rem)] w-full md:h-full  h-[70px]"}`}
    >
      {/* ----------- Mobile Logo ----------- */}
      <div className="absolute pt-[18px] left-1/2 -translate-x-1/2 md:hidden">
        <TitleLogo />
      </div>

      <div className={`w-full md:w-auto flex md:flex-col justify-between md:justify-start gap-3 min-h-[70px] md:min-h-fit ${!mounted ? "hidden" : ""}`}>

        {/* ----------- Menu button ----------- */}
        <button
          className="flex items-center text-[var(--text-color)] relative hover:cursor-pointer group"
          onClick={() => setShowMenu(!showMenu)}
        >
          <img
            src="/menu.svg"
            alt="menu-button"
            className={`duration-150 w-[45px] group-hover:scale-115 active:scale-90 ${resolvedTheme === "dark" ? "invert-100" : ""}`} />
          <div className={`duration-400 hidden md:block 
            ${hideElement ? "hidden" : "md:inline"} 
            ${displayElement ? "md:opacity-100" : "md:opacity-0 md:scale-x-0 md:mr-0"}`}
          >
            <TitleLogo />
          </div>
        </button>

        {/* ----------- New chat button ----------- */}
        <button
          className="flex items-center text-[var(--text-color)] relative hover:cursor-pointer group w-fit"
          onClick={newChat}
        >
          <img
            src="/edit.svg"
            alt="menu-button"
            className={`duration-150 w-[40px] group-hover:scale-115 active:scale-90 m-0 p-0 ${resolvedTheme === "dark" ? "invert-100" : ""}`} />
          <p className={`duration-400 text-start w-36 mx-4 text-xl hidden md:origin-left 
            ${hideElement ? "hidden" : "md:inline"} 
            ${displayElement ? "md:opacity-100" : "md:opacity-0 md:scale-x-0 md:mr-0"}`}
          >
            New chat
          </p>
        </button>

      </div>

      {/* ----------- Theme button ----------- */}
      <button
        className={`flex items-center text-[var(--text-color)]
           relative hover:cursor-pointer group duration-300 ease 
           ${hideElement ? "hidden md:block" : ""}
           ${displayElement ? "opacity-100" : "opacity-0 md:opacity-100"} 
           ${!mounted ? "hidden" : ""}`}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {resolvedTheme === "dark" ? (
          <Moon
            size={40}
            className={`duration-150 group-hover:scale-115 active:scale-90`}
          />
        ) : (
          <Sun
            size={40}
            className={`duration-150 group-hover:scale-115 active:scale-90`}
          />
        )}
        <p className={`md:duration-400 text-start w-36 mx-4 text-xl origin-left 
          ${hideElement ? "hidden " : ""} 
          ${displayElement ? "md:opacity-100" : "md:opacity-0 md:scale-x-0 md:mr-0"} `}
        >
          {resolvedTheme === "dark" ? "Theme (dark)" : "Theme (light)"}
        </p>
      </button>

      {/* ----------- Login / Back to chat button ----------- */}
      <Link
        href={isAuthPage ? "/" : (isLoggedIn ? "/user" : "/auth/login")}
        onClick={() => window.innerWidth < 768 ? setShowMenu(false) : null}
        className={`flex items-center text-[var(--text-color)] 
          relative hover:cursor-pointer group duration-300 ease 
          ${hideElement ? "hidden md:block" : ""}
          ${displayElement ? "opacity-100" : "opacity-0 md:opacity-100"} 
          ${!mounted ? "hidden" : ""}`}
      >
        {isAuthPage ? (
          <MessageCircle
            size={40}
            className={`duration-150 group-hover:scale-115 active:scale-90`}
          />
        ) : (
          <User
            size={40}
            className={`duration-150 group-hover:scale-115 active:scale-90`}
          />
        )}
        <p className={`md:duration-400 text-start text-xl w-36 mx-4 md:origin-left 
          ${hideElement ? "hidden " : ""} 
          ${displayElement ? "md:opacity-100" : "md:opacity-0 md:scale-x-0 md:mr-0"}`}
        >
          {isAuthPage ? "Back to chat" : isLoggedIn ? "User profile" : "Login"}
        </p>
      </Link>

      {/* ----------- Logout button ----------- */}
      {isLoggedIn ? (
        <button
          onClick={(e) => {
            e.preventDefault(); // important
            signOut({ redirect: false });
            router.push("/auth/login?logout=true");
          }}
          className={`flex items-center text-[var(--text-color)] 
            relative hover:cursor-pointer group duration-300 ease 
            ${hideElement ? "hidden md:block" : ""}
            ${displayElement ? "opacity-100" : "opacity-0 md:opacity-100"} 
            ${!mounted ? "hidden" : ""}`}
        >
          <LogOut size={40} className="duration-150 group-hover:scale-115 active:scale-90" />
          <p className={`md:duration-400 text-start w-36 text-xl mx-4 md:origin-left 
            ${hideElement ? "hidden " : ""} 
            ${displayElement ? "md:opacity-100" : "md:opacity-0 md:scale-x-0 md:mr-0"}`}
          >
            Logout
          </p>
        </button>
      ) : null }

      {/* Conversations section */}
      {isLoggedIn ? (
        <h2 className={`duration-400 ease text-start text-2xl pt-4 pb-2 w-full md:origin-left
          ${hideElement ? "hidden " : ""} 
          ${displayElement ? "opacity-100" : "opacity-0 md:scale-x-0"}`}
        >
          Conversations:
        </h2>
      ) : null}

      {isLoggedIn ? (
        <div className="w-full flex flex-col gap-4 max-h-fit overflow-y-scroll scrollbar-hide mb-4">
          {conversations.map((conversation, idx) => (
            <div
              key={idx}
              className={`w-full relative ease origin-top
            ${hideElement ? "hidden " : ""}
            ${displayElement ? "opacity-100 scale-y-100 duration-400 " : "opacity-0 scale-y-0 md:scale-y-100 duration-200 md:duration-400"}`}
            >
              {/* Conversation select buttons */}
              <button
                onClick={() => fetchMessages(conversation.id)}
                className={`${conversation.id === conversationId ? "bg-[var(--hover-color)]" : "bg-[var(--bg-color)]"} px-4 py-4 rounded-xl duration-100 
              w-full text-left whitespace-nowrap overflow-hidden text-ellipsis 
              hover:cursor-pointer hover:bg-[var(--hover-color)]`}
              >
                {conversation.title}
              </button>
              {/* Conversation delete button */}
              <button
                onClick={() => deleteConversation(conversation.id)}
                className="text-[var(--text-color)] rounded-full absolute right-[6px] top-[6px] duration-150 hover:cursor-pointer hover:scale-115 active:scale-90"
              >
                <CircleX />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  )
}

export default Menu
