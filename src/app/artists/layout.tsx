import { ArtistList } from "./ArtistList";

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:grid md:grid-cols-[minmax(0,1fr)_2fr] md:gap-4">
      <aside className="hidden md:block">
        <ArtistList />
      </aside>
      <main>{children}</main>
    </div>
  );
}
