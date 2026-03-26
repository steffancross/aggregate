"use client";

import { AddPlaylist } from "~/app/_components/forms/AddPlaylist";
import { AddTrack } from "~/app/_components/forms/AddTrack";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";

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
          <div>{children}</div>
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
          <ContextMenuItem onClick={() => router.push("/artists")}>
            artists
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

      {addSongOpen && (
        <AddTrack open={addSongOpen} onOpenChange={setAddSongOpen} />
      )}
      {addPlaylistOpen && (
        <AddPlaylist open={addPlaylistOpen} onOpenChange={setAddPlaylistOpen} />
      )}
    </>
  );
};
