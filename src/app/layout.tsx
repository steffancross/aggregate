import { ClerkProvider } from "@clerk/nextjs";
import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { GlobalContextMenu } from "~/app/_components/ContextMenu";
import { MusicPlayer } from "~/app/_components/player/components/desktop/MusicPlayer";
import { AppMediaAnchor } from "~/app/_components/player/components/MediaSessionAnchor";
import { PlayerCard } from "~/app/_components/player/components/mobile/PlayerCard";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";

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
            <GlobalContextMenu>
              <div className="md:flex md:h-dvh md:flex-col md:overflow-hidden">
                <div className="hidden shrink-0 md:block">
                  <MusicPlayer />
                </div>
                <div className="min-h-0 flex-1">{children}</div>
              </div>

              <div className="md:hidden">
                <PlayerCard />
              </div>
            </GlobalContextMenu>

            <Toaster position="top-left" />

            {/* needed for iframe insert and media session control */}
            <AppMediaAnchor />

            <div id="player-container"></div>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
