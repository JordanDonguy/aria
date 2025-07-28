
"use client";

import TitleLogo from "./TitleLogo";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

function Menu() {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header
      className={`fixed z-20 top-0 left-0 p-2 min-h-screen
        h-full shrink-0 bg-[var(--menu-color)] flex flex-col 
        items-start gap-3 header-transition ease-in-out
        ${showMenu ? "w-64 shadow-sm" : "[width:calc(40px+2rem)]"}`}
    >
      {/* ----------- Menu button ----------- */}
      <button
        className="flex items-center text-[var(--text-color)] relative hover:cursor-pointer group"
        onClick={() => setShowMenu(!showMenu)}
      >
        <img
          src="/menu.svg"
          alt="menu-button"
          className={`ml-2 duration-150 w-[45px] group-hover:scale-115 active:scale-90 ${resolvedTheme === "dark" ? "invert-100" : ""}`} />
        <div className={`duration-500 ${showMenu ? "opacity-100" : "opacity-0"}`}><TitleLogo /></div>
      </button>

      {/* ----------- Theme button ----------- */}
      <button
        className="flex items-center text-[var(--text-color)] relative hover:cursor-pointer group"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun
          size={40}
          className={`ml-2 duration-150 group-hover:scale-115 active:scale-90`}
        />
        <p className={`duration-500 text-start w-36 mx-4 text-xl ${showMenu ? "opacity-100" : "opacity-0"}`}>
          {resolvedTheme === "dark" ? "Theme (dark)" : "Theme (light)"}
        </p>
      </button>

    </header>
  )
}

export default Menu