import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import AppProviders from "./providers/AppProviders";
import Menu from "@/components/Menu";
import TitleLogo from "@/components/TitleLogo";

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
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body
        className={`${OpenSans.variable} antialiased`}
      >

        <AppProviders>

          <Menu />

          <div className="fixed left-20 top-0 py-[22px] z-10 w-full lg:w-fit md:bg-[var(--bg-color)] lg:bg-transparent hidden md:block">
            <TitleLogo />
          </div>

          {children}

        </AppProviders>

      </body>
    </html>
  );
}
