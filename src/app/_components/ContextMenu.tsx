"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "~/components/ui/context-menu";
import { AddTrack } from "~/app/_components/forms/AddTrack";
import { AddPlaylist } from "~/app/_components/forms/AddPlaylist";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const GlobalContextMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [addSongOpen, setAddSongOpen] = useState(false);
  const [addPlaylistOpen, setAddPlaylistOpen] = useState(false);

  if (!isSignedIn) {
    return <>{children}</>;
  }

  const handleAddSong = () => {
    setAddSongOpen(true);
  };

  const handleAddPlaylist = () => {
    setAddPlaylistOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="fixed inset-0">{children}</div>
        </ContextMenuTrigger>
        <ContextMenuContent className="z-100">
          <ContextMenuItem onClick={handleAddSong}>add song</ContextMenuItem>
          <ContextMenuItem onClick={handleAddPlaylist}>
            add playlist
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => router.push("/playlists")}>
            playlists
          </ContextMenuItem>
          <ContextMenuItem onClick={() => router.push("/library")}>
            library
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => router.push("/account")}>
            account
          </ContextMenuItem>
          <ContextMenuItem>
            <SignOutButton>log out</SignOutButton>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AddTrack open={addSongOpen} onOpenChange={setAddSongOpen} />
      <AddPlaylist open={addPlaylistOpen} onOpenChange={setAddPlaylistOpen} />
    </>
  );
};
