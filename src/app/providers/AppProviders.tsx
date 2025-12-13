"use client";

import type { ReactNode } from 'react';
import { ConversationsProvider } from "../contexts/ConversationsContext";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <ConversationsProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            toastClassName="pointer-events-auto"
            className="!top-[70px] !z-10"
          />
        </ConversationsProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
