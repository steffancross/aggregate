"use client";

import { useUser } from "@clerk/nextjs";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { play } from "~/app/_components/player/musicPlayerActions";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import type { LibraryTrack } from "~/app/library/DataTable";
import { Button } from "~/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { LIBRARY_PLAYLIST_ID } from "~/lib/constants";
import { api } from "~/trpc/react";

function isEditableElement(node: EventTarget | null): boolean {
  if (!node || !(node instanceof HTMLElement)) return false;
  if (node.isContentEditable) return true;
  return node.closest("input, textarea, select") != null;
}

async function playLibraryTrack(song: LibraryTrack) {
  const {
    currentPlaylistId,
    setCurrentPlaylist,
    setCurrentTrackIndex,
    currentTrack,
  } = useMusicPlayerStore.getState();

  if (
    currentPlaylistId !== LIBRARY_PLAYLIST_ID ||
    currentTrack?.trackId !== song.trackId
  ) {
    setCurrentPlaylist([song], LIBRARY_PLAYLIST_ID);
  }
  setCurrentTrackIndex(0);
  await play();
}

export function LibrarySearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { isSignedIn } = useUser();

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(id);
  }, [search]);

  const trimmedDebounced = debouncedSearch.trim();
  const { data, isPending } = api.library.search.useQuery(
    { query: debouncedSearch },
    { enabled: open && trimmedDebounced.length > 0 },
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() !== "k") return;
      if (!open && isEditableElement(e.target)) return;
      e.preventDefault();
      setOpen((prev) => {
        if (prev) {
          setSearch("");
          setDebouncedSearch("");
          return false;
        }
        setSearch("");
        setDebouncedSearch("");
        return true;
      });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const artists = data?.artists ?? [];
  const songs = data?.songs ?? [];
  const hasQuery = trimmedDebounced.length > 0;
  const showEmpty =
    hasQuery && !isPending && artists.length === 0 && songs.length === 0;

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="size-4" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search library"
        description="Search artists and songs in your library"
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Search artists and songs…"
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {!hasQuery && (
            <div className="text-muted-foreground py-6 text-center text-sm">
              Type to search your library. Press ⌘K or Ctrl+K to toggle.
            </div>
          )}
          {hasQuery && isPending && (
            <div className="text-muted-foreground py-6 text-center text-sm">
              Searching…
            </div>
          )}
          {showEmpty && <CommandEmpty>No results found.</CommandEmpty>}
          {!isPending && artists.length > 0 && (
            <CommandGroup heading="Artists">
              {artists.map((artist) => (
                <CommandItem
                  key={artist.id}
                  value={`artist-${artist.id}`}
                  onSelect={() => {
                    router.push(`/artists/${artist.id}`);
                    handleOpenChange(false);
                  }}
                >
                  {artist.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!isPending && artists.length > 0 && songs.length > 0 && (
            <CommandSeparator />
          )}
          {!isPending && songs.length > 0 && (
            <CommandGroup heading="Songs">
              {songs.map((song) => (
                <CommandItem
                  key={song.trackId}
                  value={`song-${song.trackId}`}
                  className="flex items-center gap-2 pr-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{song.title}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {song.artists.map((a) => a.artistName).join(", ")}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground pointer-events-auto size-8 shrink-0"
                        aria-label={`Options for ${song.title}`}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <DropdownMenuItem
                        onClick={async () => {
                          await playLibraryTrack(song);
                          handleOpenChange(false);
                        }}
                      >
                        Play
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          useMusicPlayerStore.getState().enqueueTrack(song);
                          handleOpenChange(false);
                        }}
                      >
                        Add to queue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
