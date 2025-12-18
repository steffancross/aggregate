"use client";

import { formatSongTime } from "~/lib/utils";
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
  artists: { id: number; name: string }[];
  album: { id: number; name: string } | null;
  duration: number | null;
  source: "soundcloud" | "spotify" | "youtube" | "local";
  sourceId: string | null;
  sourceUrl: string | null;
  artworkUrl: string | null;
};

const columns: ColumnDef<LibraryTrack>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "artists",
    header: "Artists",
    cell: ({ row }) => {
      return row.original.artists.map((artist) => artist.name).join(", ");
    },
  },
  {
    accessorKey: "album",
    header: "Album",
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      if (!row.original.duration) return "";
      return formatSongTime(row.original.duration / 1000);
    },
  },
  {
    accessorKey: "source",
    header: "Source",
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
