import { Button } from "~/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import type { LibraryTrack } from "../DataTable";

export const SortableColumnHeader = ({
  column,
  header,
}: {
  column: Column<LibraryTrack>;
  header: string;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="pl-0! dark:hover:bg-transparent"
    >
      {header}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="ml-2" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="ml-2" />
      ) : (
        <ChevronUp className="ml-2 opacity-0" />
      )}
    </Button>
  );
};
