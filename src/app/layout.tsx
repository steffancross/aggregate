import { ClerkProvider } from "@clerk/nextjs";
import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { GlobalContextMenu } from "~/app/_components/nav/ContextMenu";
import { GlobalMobileNavDrawer } from "~/app/_components/nav/MobileNavDrawer";
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
              <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
                <div className="shrink-0">
                  <GlobalMobileNavDrawer />
                </div>
                <div className="hidden shrink-0 md:block">
                  <MusicPlayer />
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
                <div className="shrink-0 md:hidden">
                  <PlayerCard />
                </div>
              </div>
            </GlobalContextMenu>

            <Toaster position="bottom-right" />

            {/* needed for iframe insert and media session control */}
            <AppMediaAnchor />

            <div id="player-container"></div>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
