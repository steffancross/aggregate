"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "~/components/ui/context-menu";
import { AddSong } from "~/app/_components/AddSong";

import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const GlobalContextMenu = () => {
  const router = useRouter();
  const [addSongOpen, setAddSongOpen] = useState(false);

  const handlePlaylists = () => {
    router.push("/playlists");
  };

  const handleLibrary = () => {
    router.push("/library");
  };

  const handleAddSong = () => {
    setAddSongOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="fixed inset-0 -z-10" />
        </ContextMenuTrigger>
        <ContextMenuContent className="z-100">
          <ContextMenuItem onClick={handleAddSong}>add song</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handlePlaylists}>playlists</ContextMenuItem>
          <ContextMenuItem onClick={handleLibrary}>library</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <SignOutButton>log out</SignOutButton>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AddSong open={addSongOpen} onOpenChange={setAddSongOpen} />
    </>
  );
};
