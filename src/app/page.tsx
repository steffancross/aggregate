import { HydrateClient } from "~/trpc/server";
import Link from "next/link";

export default async function Home() {
  return (
    <HydrateClient>
      <Link href="/playlists">Playlists</Link>
    </HydrateClient>
  );
}
