
"use client";

import { useConversations } from "@/app/contexts/ConversationsContext";
import TitleLogo from "./TitleLogo";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

function Menu() {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setMessages } = useConversations();

  function newChat() {
    setMessages([]);
    document.title = "Aria";
  }

  return (
    <header
      className={`fixed z-20 top-0 left-0 md:p-4 px-2 md:min-h-screen
        shrink-0 bg-[var(--menu-color)] flex flex-col 
        items-start gap-3 header-transition
        ${showMenu ? "md:w-64 w-full h-screen md:shadow-sm" : "md:[width:calc(40px+2rem)] w-full md:h-full  h-[70px]"}`}
    >
      <div className="w-full md:w-auto flex md:flex-col justify-between md:justify-start gap-3 min-h-[70px] md:min-h-fit">

        {/* ----------- Menu button ----------- */}
        <button
          className="flex items-center text-[var(--text-color)] relative hover:cursor-pointer group"
          onClick={() => setShowMenu(!showMenu)}
        >
          <img
            src="/menu.svg"
            alt="menu-button"
            className={`duration-150 w-[45px] group-hover:scale-115 active:scale-90 ${resolvedTheme === "dark" ? "invert-100" : ""}`} />
          <div className={`duration-400 hidden md:block ${showMenu ? "opacity-100" : "opacity-0"}`}><TitleLogo /></div>
        </button>

        {/* ----------- New chat button ----------- */}
        <button
          className="flex items-center text-[var(--text-color)] relative hover:cursor-pointer group"
          onClick={newChat}
        >
          <img
            src="/edit.svg"
            alt="menu-button"
            className={`duration-150 w-[40px] group-hover:scale-115 active:scale-90 ${resolvedTheme === "dark" ? "invert-100" : ""}`} />
          <p className={`duration-400 text-start w-36 mx-4 text-xl hidden md:inline ${showMenu ? "opacity-100" : "opacity-0"}`}>New chat</p>
        </button>

      </div>

      {/* ----------- Theme button ----------- */}
      <button
        className={`flex items-center text-[var(--text-color)] relative hover:cursor-pointer group duration-300 ease ${showMenu ? "opacity-100" : "opacity-0 md:opacity-100"}`}
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
        <p className={`md:duration-400 text-start w-36 mx-4 text-xl ${showMenu ? "md:opacity-100" : "md:opacity-0"}`}>
          {resolvedTheme === "dark" ? "Theme (dark)" : "Theme (light)"}
        </p>
      </button>

    </header>
  )
}

export default Menu