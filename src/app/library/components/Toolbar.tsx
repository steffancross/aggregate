import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DataTableFacetedFilter } from "./FacetedFilter";
import type { Table } from "@tanstack/react-table";
import type { LibraryTrack } from "../DataTable";

export const DataTableToolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
}: {
  table: Table<LibraryTrack>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}) => {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    table.getState().globalFilter !== "";

  return (
    <div className="flex flex-col gap-2 p-2 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full md:w-sm"
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
      </div>
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
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
