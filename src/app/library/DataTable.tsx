// see https://tanstack.com/table/v8/docs/introduction
"use client";

import { formatSongTime } from "~/lib/utils";
import { TrackOptions } from "~/app/_components/TrackOptions";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type FilterFn,
} from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { SortableColumnHeader } from "./components/SortableColumnHeader";
import { DataTableToolbar } from "./components/Toolbar";
import { DataTablePlay } from "./components/DataTablePlay";

export type LibraryTrack = {
  id: number;
  title: string;
  artists: { artistId: number; artistName: string }[];
  album: string | null;
  duration: number | null;
  source: "soundcloud" | "spotify" | "youtube" | "local";
  sourceId: string | null;
  sourceUrl: string | null;
  artworkUrl: string | null;
  trackId: number;
  playlistId: number;
  playlistName: string;
  position: number;
  albumId: number | null;
  isPlayable: boolean;
  isInAnyPlaylist: boolean;
};

const columns: ColumnDef<LibraryTrack>[] = [
  {
    id: "play",
    cell: ({ row }) => {
      return <DataTablePlay song={row.original} />;
    },
    enableHiding: false,
  },
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <SortableColumnHeader column={column} header="Title" />
    ),
    cell: ({ row }) => row.original.title,
    accessorFn: (row) => row.title?.toLowerCase(),
  },
  {
    id: "artists",
    header: "Artists",
    cell: ({ row }) => {
      return row.original.artists.map((artist, index) => (
        <Link
          href={`/artists/${artist.artistId}`}
          key={artist.artistId}
          className="hover:underline"
        >
          {artist.artistName}
          {index < row.original.artists.length - 1 && ", "}
        </Link>
      ));
    },
  },
  {
    id: "album",
    accessorKey: "album",
    header: "Album",
  },
  {
    id: "time",
    header: ({ column }) => (
      <SortableColumnHeader column={column} header="Time" />
    ),
    cell: ({ row }) =>
      row.original.duration ? formatSongTime(row.original.duration / 1000) : "",
    accessorFn: (row) => row.duration,
  },
  {
    id: "source",
    accessorKey: "source",
    header: "Source",
    filterFn: "arrIncludesSome",
  },
  {
    id: "in a playlist",
    accessorKey: "isInAnyPlaylist",
    header: ({ column }) => (
      <SortableColumnHeader column={column} header="In a Playlist" />
    ),
    cell: ({ row }) => (row.original.isInAnyPlaylist ? "TRUE" : "FALSE"),
  },
  {
    id: "playable",
    accessorKey: "isPlayable",
    header: ({ column }) => (
      <SortableColumnHeader column={column} header="Playable" />
    ),
    cell: ({ row }) => (row.original.isPlayable ? "TRUE" : "FALSE"),
  },
  {
    id: "options",
    cell: ({ row }) => {
      return <TrackOptions song={row.original} />;
    },
    enableHiding: false,
  },
];

export const DataTable = ({ data }: { data: LibraryTrack[] }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "title", desc: false },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    source: false,
    album: false,
    "in a playlist": false,
    playable: false,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const trackGlobalFilter: FilterFn<LibraryTrack> = (
    row,
    _columnId,
    filterValue,
  ) => {
    const search = (filterValue as string).toLowerCase();

    const title = row.original.title?.toLowerCase() ?? "";
    const album = row.original.album?.toLowerCase() ?? "";
    const artists = row.original.artists
      .map((a) => a.artistName.toLowerCase())
      .join(" ");

    return (
      title.includes(search) ||
      album.includes(search) ||
      artists.includes(search)
    );
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: trackGlobalFilter,
    state: {
      sorting,
      columnVisibility,
      globalFilter,
    },
  });

  return (
    <div className="flex h-screen flex-col">
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <Table className="flex-1 overflow-auto rounded-md border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="bg-chart-2/15 sticky top-0 z-20"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="[&>tr:nth-child(odd)]:bg-muted/20">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={
                  !row.original.isPlayable
                    ? "bg-destructive/5 hover:bg-destructive/5 text-red-800"
                    : "group hover:bg-transparent"
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.id === "play" ? "w-8" : undefined}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
