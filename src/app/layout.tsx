import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import AppProviders from "./providers/AppProviders";

const OpenSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aria",
  description: "Chat with an intelligent AI chatbot that remembers your conversations and helps you get answers, ideas, and explanations in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${OpenSans.variable} antialiased`}
      >
          <AppProviders>
            {children}
          </AppProviders>
      </body>
    </html>
  );
}
