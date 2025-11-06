
"use client";

import { useConversations } from "@/app/contexts/ConversationsContext";
import TitleLogo from "./TitleLogo";
import { useState, useEffect } from "react";
import { Sun, Moon, LogOut, CircleX } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import scrollDown from "@/lib/utils/scrollDown";
import { deleteConversation } from "@/lib/utils/conversationsUtils";
import { fetchMessages } from "@/lib/utils/messagesUtils";
import NavButton from "./NavButton";

function Menu() {
  const [mounted, setMounted] = useState<boolean>(false);               // To wait for component to be mounted to display some elements
  const [showMenu, setShowMenu] = useState<boolean>(false);             // To display full menu
  const [hideElement, setHideElement] = useState<boolean>(false);       // To hide elements (display: none)
  const [displayElement, setDisplayElement] = useState<boolean>(false)  // To display or not element (opacity, scale, etc...)

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setMessages, conversations, setConversations, conversationId, setConversationId, setError, setIsLoading } = useConversations();

  const { status } = useSession();
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
    };
    document.title = "Aria";
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
  }, [status, setConversations, setError]);

  return (
    <header
      className={`fixed z-30 top-0 left-0 md:p-4 px-2 md:min-h-screen
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
          className={`${status === "loading" ? "opacity-0 sm:opacity-100" : "opacity-100"} relative flex items-center text-[var(--text-color)] hover:cursor-pointer group`}
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

      {/* ----------- Login / User / Back to chat buttons ----------- */}
      {status === "loading" ? (
        <div className="absolute top-4 left-3 sm:top-0 sm:left-0 sm:relative sm:flex items-center justify-center shrink-0">
          <div className="h-10 w-10 rounded-full border-4 border-[var(--input-text-color)] border-t-[var(--menu-color)] animate-spin"></div>
        </div>
      ) : (
        <NavButton
          isAuthPage={isAuthPage}
          isLoggedIn={isLoggedIn}
          hideElement={hideElement}
          displayElement={displayElement}
          mounted={mounted}
          setShowMenu={setShowMenu}
        />
      )}

      {/* ----------- Logout button ----------- */}
      {isLoggedIn ? (
        <button
          onClick={(e) => {
            e.preventDefault(); // important
            signOut({ redirect: false });
            router.push("/auth/login?logout=true");
            if (window.innerWidth < 768) {
              setShowMenu(false)
            };
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
      ) : null}

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
                onClick={() => {
                  setIsLoading(true);

                  if (pathname !== "/") {
                    router.push("/");
                  };

                  fetchMessages(
                    conversation.id,
                    setConversationId,
                    setMessages,
                    setError,
                    setShowMenu,
                    scrollDown,
                    setIsLoading,
                  )
                }}
                className={`${conversation.id === conversationId ? "bg-[var(--hover-color)]" : "bg-[var(--bg-color)]"} px-4 py-4 rounded-xl duration-100 
              w-full text-left whitespace-nowrap overflow-hidden text-ellipsis 
              hover:cursor-pointer hover:bg-[var(--hover-color)]`}
              >
                {conversation.title}
              </button>
              {/* Conversation delete button */}
              <button
                onClick={() =>
                  deleteConversation(
                    conversation.id,
                    conversationId,
                    setMessages,
                    setConversationId,
                    setConversations,
                    setError
                  )
                }
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
