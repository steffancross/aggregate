import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { MusicPlayer } from "~/app/_components/player/components/MusicPlayer";
import { GlobalContextMenu } from "~/app/_components/ContextMenu";
import { Toaster } from "~/components/ui/sonner";
import { AppMediaAnchor } from "~/app/_components/player/components/MediaSessionAnchor";

export const metadata: Metadata = {
  title: "Aggregate",
  description: "A music player",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} dark`}>
        <body>
          <TRPCReactProvider>
            <GlobalContextMenu>{children}</GlobalContextMenu>
            <MusicPlayer />
            <Toaster position="top-left" />
            <AppMediaAnchor />
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
