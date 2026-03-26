import { ArtistList } from "./ArtistList";

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full md:grid md:grid-cols-[minmax(0,1fr)_2fr] md:gap-4">
      <aside className="hidden min-h-0 md:block">
        <ArtistList />
      </aside>
      <main className="min-h-0 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
