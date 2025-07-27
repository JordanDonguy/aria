"use client";

import { ReactNode } from 'react';
import { ConversationsProvider } from "../contexts/ConversationsContext";
import { ThemeProvider } from "next-themes";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"    /* puts data-theme="light|dark" on <html> */
      defaultTheme="system"     /* follow OS by default */
      enableSystem              /* let users return to “system” */
    >
      <ConversationsProvider>
        {children}
      </ConversationsProvider>
    </ThemeProvider>
  )
}
