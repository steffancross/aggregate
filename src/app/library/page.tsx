"use client";

import { api } from "~/trpc/react";

const Library = () => {
  const { data: libraryTracks } = api.library.getAll.useQuery();
  console.log(libraryTracks);

  return <div>test</div>;
};

export default Library;
