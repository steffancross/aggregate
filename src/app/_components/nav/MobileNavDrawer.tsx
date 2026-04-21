"use client";

import { SignOutButton } from "@clerk/nextjs";
import { CubeIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { AddPlaylist } from "~/app/_components/forms/AddPlaylist";
import { AddTrack } from "~/app/_components/forms/AddTrack";
import {
  globalAccountActions,
  globalPrimaryActions,
  globalRouteActions,
} from "~/app/_components/nav/globalNavConfig";
import { useGlobalNavMenu } from "~/app/_components/nav/useGlobalNavMenu";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

export const GlobalMobileNavDrawer = () => {
  const [open, setOpen] = useState(false);
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

  if (!isSignedIn) {
    return null;
  }

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen} direction="top">
        <DrawerTrigger asChild className="md:hidden">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <CubeIcon className="size-5" fill="#fff" />
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="md:hidden">
          <div className="hidden">
            <DrawerTitle>Menu</DrawerTitle>
          </div>

          <div className="space-y-1 p-4">
            {globalPrimaryActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() =>
                  handleSelect(
                    action.id === "add-song" ? openAddSong : openAddPlaylist,
                  )
                }
              >
                {action.label}
              </Button>
            ))}

            <div className="bg-border my-1 h-px w-full" />

            {globalRouteActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(() => navigate(action.path))}
              >
                {action.label}
              </Button>
            ))}

            <div className="bg-border my-1 h-px w-full" />

            {globalAccountActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(() => navigate(action.path))}
              >
                {action.label}
              </Button>
            ))}

            <SignOutButton>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setOpen(false)}
              >
                log out
              </Button>
            </SignOutButton>
          </div>
        </DrawerContent>
      </Drawer>

      {addSongOpen && (
        <AddTrack open={addSongOpen} onOpenChange={setAddSongOpen} />
      )}
      {addPlaylistOpen && (
        <AddPlaylist open={addPlaylistOpen} onOpenChange={setAddPlaylistOpen} />
      )}
    </>
  );
};
