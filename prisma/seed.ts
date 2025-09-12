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
      sourceIdentifier:
        "https://soundcloud.com/evens/evens-year-walk-free-download",
    },
  });
  console.log("year walk added");

  const track2 = await db.track.create({
    data: {
      source: "soundcloud",
      sourceIdentifier: "https://soundcloud.com/janu4ryss/dont-want-u-prod-me",
    },
  });
  console.log("dont want u added");

  const track3 = await db.track.create({
    data: {
      source: "youtube",
      sourceIdentifier: "-bORJzjLGSU",
    },
  });
  console.log("transcendence added");

  const track4 = await db.track.create({
    data: {
      source: "youtube",
      sourceIdentifier: "3K6POJzvZlI",
    },
  });
  console.log("xtayalive added");

  const artist1 = await db.artist.create({
    data: {
      name: "evenS",
    },
  });
  console.log("evenS added");

  const artist2 = await db.artist.create({
    data: {
      name: "Janu4ryss",
    },
  });
  console.log("janu4ryss added");

  const artist3 = await db.artist.create({
    data: {
      name: "Nujabes",
    },
  });
  console.log("nujabes added");

  const artist4 = await db.artist.create({
    data: {
      name: "9lives",
    },
  });
  console.log("9lives added");

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

  const libraryTrack3 = await db.libraryTrack.create({
    data: {
      title: "Transcendence",
      user: { connect: { id: user.id } },
      track: { connect: { id: track3.id } },
      artists: { create: [{ artist: { connect: { id: artist3.id } } }] },
    },
  });
  console.log("library track 3 created");

  const libraryTrack4 = await db.libraryTrack.create({
    data: {
      title: "xtayalive",
      user: { connect: { id: user.id } },
      track: { connect: { id: track4.id } },
      artists: { create: [{ artist: { connect: { id: artist4.id } } }] },
    },
  });
  console.log("library track 4 created");

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
      {
        position: 2,
        playlistId: playlist.id,
        libraryTrackId: libraryTrack3.id,
      },
      {
        position: 4,
        playlistId: playlist.id,
        libraryTrackId: libraryTrack4.id,
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
