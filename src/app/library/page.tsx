import { api } from "~/trpc/server";
import { DataTable, type LibraryTrack } from "./DataTable";

const Library = async () => {
  const libraryTracks: LibraryTrack[] = await api.library.getAll();

  return <DataTable data={libraryTracks} />;
};

export default Library;
