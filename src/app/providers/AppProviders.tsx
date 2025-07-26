"use client";

import { ReactNode } from 'react';
import { ThemeProvider } from "../contexts/ThemeContext";
import { ConversationsProvider } from "../contexts/ConversationsContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConversationsProvider>
        {children}
      </ConversationsProvider>
    </ThemeProvider>
  )
}
