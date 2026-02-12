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
import { ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { DataTableFacetedFilter } from "./FacetedFilter";

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
    id: "title",
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0! dark:hover:bg-transparent"
        >
          Title
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2" />
          ) : (
            <ChevronsUpDown className="ml-2 opacity-0" />
          )}
        </Button>
      );
    },
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0! dark:hover:bg-transparent"
        >
          Time
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-0" />
          )}
        </Button>
      );
    },
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
    //TODO: rework id names to be readable. appear in the column selector
    id: "isInAnyPlaylist",
    accessorKey: "isInAnyPlaylist",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0! dark:hover:bg-transparent"
        >
          In a Playlist
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2" />
          ) : (
            <ChevronsUpDown className="ml-2 opacity-0" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (row.original.isInAnyPlaylist ? "TRUE" : "FALSE"),
  },
  {
    id: "playable",
    accessorKey: "isPlayable",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0! dark:hover:bg-transparent"
        >
          Playable
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2" />
          ) : (
            <ChevronsUpDown className="ml-2 opacity-0" />
          )}
        </Button>
      );
    },
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
    isInAnyPlaylist: false,
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
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    table.getState().globalFilter !== "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        {table.getColumn("source") && (
          <DataTableFacetedFilter
            column={table.getColumn("source")}
            title="Source"
            options={[
              { label: "Soundcloud", value: "soundcloud" },
              { label: "Spotify", value: "spotify" },
              { label: "Youtube", value: "youtube" },
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="outline"
            onClick={() => {
              table.resetColumnFilters();
              table.resetGlobalFilter();
              setGlobalFilter("");
            }}
          >
            Reset
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
          <TableBody className="[&>tr:nth-child(odd)]:bg-muted/20">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    !row.original.isPlayable
                      ? "bg-destructive/5 hover:bg-destructive/5 text-red-800"
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
