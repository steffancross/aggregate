"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export const useGlobalNavMenu = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [addSongOpen, setAddSongOpen] = useState(false);
  const [addPlaylistOpen, setAddPlaylistOpen] = useState(false);

  const openAddSong = useCallback(() => {
    setAddSongOpen(true);
  }, []);

  const openAddPlaylist = useCallback(() => {
    setAddPlaylistOpen(true);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  return {
    isSignedIn,
    addSongOpen,
    setAddSongOpen,
    addPlaylistOpen,
    setAddPlaylistOpen,
    openAddSong,
    openAddPlaylist,
    navigate,
  };
};
