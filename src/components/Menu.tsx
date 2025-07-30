
"use client";

import { useConversations } from "@/app/contexts/ConversationsContext";
import TitleLogo from "./TitleLogo";
import { useState, useEffect } from "react";
import { Sun, Moon, User, MessageCircle, LogOut, CircleX } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

function Menu() {
  const [mounted, setMounted] = useState<boolean>(false);               // To wait for component to be mounted to display some elements
  const [showMenu, setShowMenu] = useState<boolean>(false);             // To display full menu
  const [hideElement, setHideElement] = useState<boolean>(false);       // To hide elements (display: none)
  const [displayElement, setDisplayElement] = useState<boolean>(false)  // To display or not element (opacity, scale, etc...)

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setMessages, conversations, setConversations } = useConversations();

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const router = useRouter();

  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  // If user clicks on new chat, reset messages and document.title
  function newChat() {
    setMessages([]);
    document.title = "Aria";
    router.push("/");
    if (window.innerWidth < 768) {
      setShowMenu(false)
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
      console.log(conversations)
      if (res.ok) {
        setConversations(data);
      } else {
        console.error("Error:", data.error);
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
        href={isAuthPage ? "/" : "/auth/login"}
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
          {isAuthPage ? "Back to chat" : "Login"}
        </p>
      </Link>

      {/* ----------- Logout button ----------- */}
      {isLoggedIn && (
        <button
          onClick={(e) => {
            e.preventDefault(); // important
            signOut({ redirect: false });
            router.push("/auth/login");
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
      )}

      {/* Conversations section */}

      <h2 className={`duration-400 ease text-start w-36 text-2xl my-4 md:origin-left
          ${hideElement ? "hidden " : ""} 
          ${displayElement ? "opacity-100" : "opacity-0 md:scale-x-0"}`}
      >
        Conversations:
      </h2>

      {conversations.map(conversation => (
        <div className={`w-full relative duration-400 ease 
          ${hideElement ? "hidden " : ""} 
          ${displayElement ? "opacity-100" : "opacity-0"}`}
        >

          {/* Conversation select buttons */}
          <button
            className="bg-[var(--bg-color)] px-4 py-4 rounded-xl duration-100 w-full mb-2 
            text-left whitespace-nowrap overflow-hidden text-ellipsis hover:cursor-pointer hover:bg-[var(--hover-color)]"
          >
            {conversation.title}
          </button>

          {/* Conversation delete button */}
          <button
            className="text-[var(--text-color)] rounded-full absolute right-[6px] top-[6px] duration-150 hover:cursor-pointer hover:scale-115 active:scale-90"
          >
            <CircleX />
          </button>

        </div>
      ))}
    </header>
  )
}

export default Menu
