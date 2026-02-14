import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: [],
});

const seed = async () => {
  const user = await db.user.create({
    data: {
      clerkId: process.env.CLERK_ID!,
    },
  });

  console.log("user created");

  const track1 = await db.track.create({
    data: {
      source: "soundcloud",
      sourceId: "158712483",
      sourceUrl: "https://soundcloud.com/diversa/ego-death",
      duration: 192121,
    },
  });
  console.log("eog death added");

  const track2 = await db.track.create({
    data: {
      source: "youtube",
      sourceId: "hQ5x8pHoIPA",
      sourceUrl: "https://www.youtube.com/watch?v=hQ5x8pHoIPA",
      duration: 175000,
    },
  });
  console.log("dont want u added");

  const artist1 = await db.artist.create({
    data: {
      name: "Diversa",
    },
  });
  console.log("diversa added");

  const artist2 = await db.artist.create({
    data: {
      name: "Nujabes",
    },
  });
  console.log("nujabes added");

  const libraryTrack1 = await db.libraryTrack.create({
    data: {
      title: "Year Walk",
      user: { connect: { id: user.id } },
      track: { connect: { id: track1.id } },
      artists: { create: [{ artist: { connect: { id: artist1.id } } }] },
    },
  });
  console.log("library track 1 created");

  const libraryTrack2 = await db.libraryTrack.create({
    data: {
      title: "Dont Want U",
      user: { connect: { id: user.id } },
      track: { connect: { id: track2.id } },
      artists: { create: [{ artist: { connect: { id: artist2.id } } }] },
    },
  });
  console.log("library track 2 created");

  const playlist = await db.playlist.create({
    data: {
      name: "playlist1",
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  console.log("playlist created");

  await db.playlistEntry.createMany({
    data: [
      {
        position: 1,
        playlistId: playlist.id,
        libraryTrackId: libraryTrack1.id,
      },
      {
        position: 3,
        playlistId: playlist.id,
        libraryTrackId: libraryTrack2.id,
      },
    ],
  });
  console.log("playlist entries added");
};

seed()
  .then(async () => {
    console.log("seeding complete");
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
