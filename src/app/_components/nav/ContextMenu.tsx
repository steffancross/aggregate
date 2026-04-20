"use client";

import { AddPlaylist } from "~/app/_components/forms/AddPlaylist";
import { AddTrack } from "~/app/_components/forms/AddTrack";
import {
  globalAccountActions,
  globalPrimaryActions,
  globalRouteActions,
} from "~/app/_components/nav/globalNavConfig";
import { useGlobalNavMenu } from "~/app/_components/nav/useGlobalNavMenu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";

import { SignOutButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export const GlobalContextMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const {
    isSignedIn,
    addSongOpen,
    setAddSongOpen,
    addPlaylistOpen,
    setAddPlaylistOpen,
    openAddSong,
    openAddPlaylist,
    navigate,
  } = useGlobalNavMenu();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  if (!isSignedIn || !isDesktop) {
    return <>{children}</>;
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          asChild
          className="user-select-none -webkit-user-select-none -webkit-touch-callout-none"
        >
          <div>{children}</div>
        </ContextMenuTrigger>
        <ContextMenuContent className="z-100">
          {globalPrimaryActions.map((action) => (
            <ContextMenuItem
              key={action.id}
              onClick={action.id === "add-song" ? openAddSong : openAddPlaylist}
            >
              {action.label}
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          {globalRouteActions.map((action) => (
            <ContextMenuItem
              key={action.id}
              onClick={() => navigate(action.path)}
            >
              {action.label}
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          {globalAccountActions.map((action) => (
            <ContextMenuItem
              key={action.id}
              onClick={() => navigate(action.path)}
            >
              {action.label}
            </ContextMenuItem>
          ))}
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
