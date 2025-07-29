"use client";

import { ReactNode } from 'react';
import { ConversationsProvider } from "../contexts/ConversationsContext";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

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
        </ConversationsProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
