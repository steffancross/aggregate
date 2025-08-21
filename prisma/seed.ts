/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { db } from "../src/server/db";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: [],
});

const seed = async () => {
  const user = await db.user.create({
    data: {},
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
        position: 2,
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
