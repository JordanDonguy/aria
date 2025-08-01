"use client";

import { ReactNode } from 'react';
import { ConversationsProvider } from "../contexts/ConversationsContext";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"    /* puts data-theme="light|dark" on <html> */
      defaultTheme="system"     /* follow OS by default */
      enableSystem              /* let users return to “system” */
    >
      <SessionProvider>
        <ConversationsProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
          />
        </ConversationsProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
