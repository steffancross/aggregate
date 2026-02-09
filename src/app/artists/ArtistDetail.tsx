import { DataTable, type LibraryTrack } from "~/app/library/DataTable";

type ArtistDetailProps = {
  artistName: string;
  tracks: LibraryTrack[];
};

export const ArtistDetail = ({ artistName, tracks }: ArtistDetailProps) => {
  return (
    <>
      <h1 className="mt-7">{artistName}</h1>
      <p className="opacity-70">{tracks.length} songs</p>
      <div className="mx-auto mt-4 w-full max-w-4xl">
        <DataTable data={tracks} />
      </div>
    </>
  );
};
