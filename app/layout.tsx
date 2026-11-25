import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "../components/footer";
import { Nav } from "../components/nav";
import { clerkAppearance } from "../lib/clerk-appearance";
import "./globals.css";


export const metadata: Metadata = {
  title: { default: "RepoPlay · Live demos from any GitHub repo", template: "%s · RepoPlay" },
  description: "Turn a public GitHub repository into a quick, interactive demo. No cloning, no setup.",
};

// Applies the saved theme before first paint to avoid a flash.
const themeScript = `try{var t=localStorage.getItem("repoplay-theme");if(!t)t="light";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning>
        <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400..700&amp;display=swap" /><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
        <body>
          <Nav />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
