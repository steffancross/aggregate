import { ArtistList } from "./ArtistList";

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col md:grid md:grid-cols-[minmax(0,1fr)_2fr] md:gap-4">
      <aside className="hidden min-h-0 min-w-0 overflow-y-auto md:block">
        <ArtistList />
      </aside>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
