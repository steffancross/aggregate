export const globalPrimaryActions = [
  { id: "add-song", label: "add song" },
  { id: "add-playlist", label: "add playlist" },
] as const;

export const globalRouteActions = [
  { id: "playlists", label: "playlists", path: "/playlists" },
  { id: "library", label: "library", path: "/library" },
  { id: "artists", label: "artists", path: "/artists" },
] as const;

export const globalAccountActions = [
  { id: "account", label: "account", path: "/account" },
] as const;
