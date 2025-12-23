"use client";

import { formatSongTime } from "~/lib/utils";
import { TrackOptions } from "~/app/_components/TrackOptions";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

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
};

const columns: ColumnDef<LibraryTrack>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
  },
  {
    id: "artists",
    header: "Artists",
    accessorFn: (row) =>
      row.artists.map((artist) => artist.artistName).join(", "),
  },
  {
    id: "album",
    accessorKey: "album",
    header: "Album",
  },
  {
    id: "time",
    header: "Time",
    accessorFn: (row) =>
      row.duration ? formatSongTime(row.duration / 1000) : "",
  },
  {
    id: "source",
    accessorKey: "source",
    header: "Source",
  },
  {
    id: "options",
    cell: ({ row }) => {
      return <TrackOptions song={row.original} />;
    },
  },
];

export const DataTable = ({ data }: { data: LibraryTrack[] }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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
