import { api } from "~/trpc/server";
import { ArtistDetail } from "../ArtistDetail";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await api.artists.getArtistSongs({
    artistId: parseInt(id),
  });

  if (!data) return <div>Artist not found</div>;

  return <ArtistDetail artistName={data.artistName} albums={data.albums} />;
}
