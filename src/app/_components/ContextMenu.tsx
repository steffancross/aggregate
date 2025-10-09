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

export const GlobalContextMenu = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [addSongOpen, setAddSongOpen] = useState(false);
  const [addPlaylistOpen, setAddPlaylistOpen] = useState(false);

  if (!isSignedIn) {
    return null;
  }

  const handlePlaylists = () => {
    router.push("/playlists");
  };

  const handleLibrary = () => {
    router.push("/library");
  };

  const handleAddSong = () => {
    setAddSongOpen(true);
  };

  const handleAddPlaylist = () => {
    setAddPlaylistOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="fixed inset-0 -z-10" />
        </ContextMenuTrigger>
        <ContextMenuContent className="z-100">
          <ContextMenuItem onClick={handleAddSong}>add song</ContextMenuItem>
          <ContextMenuItem onClick={handleAddPlaylist}>
            add playlist
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handlePlaylists}>playlists</ContextMenuItem>
          <ContextMenuItem onClick={handleLibrary}>library</ContextMenuItem>
          <ContextMenuSeparator />
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
