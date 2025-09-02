"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "~/components/ui/context-menu";

import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export const GlobalContextMenu = () => {
  const router = useRouter();

  const handlePlaylists = () => {
    router.push("/playlists");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="fixed inset-0 -z-10" />
      </ContextMenuTrigger>
      <ContextMenuContent className="z-100">
        <ContextMenuItem>add song</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handlePlaylists}>playlists</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <SignOutButton>log out</SignOutButton>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
