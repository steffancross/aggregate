import { describe, it, expect, vi } from "vitest";
import { testDb } from "@/vitest.setup";
import * as refreshSpotifyTokenModule from "./refreshSpotifyToken";
import { getOrRefreshSpotifyToken } from "./getOrRefreshSpotifyToken";

describe("getOrRefreshSpotifyToken", () => {
  it("should error if user not found", async () => {
    await expect(
      getOrRefreshSpotifyToken({
        clerkId: "test",
      }),
    ).rejects.toThrow("User not found");
  });
  it("should error if user has no Spotify token", async () => {
    await testDb.user.create({
      data: {
        clerkId: "test",
        spotifyAccessToken: "meh",
        spotifyRefreshToken: "blahblah",
        spotifyTokenExpiresAt: null,
      },
    });
    await expect(
      getOrRefreshSpotifyToken({
        clerkId: "test",
      }),
    ).rejects.toThrow("User is missing Spotify credentials, reauthorize");
  });
  it("should return the user's existing token if not expired", async () => {
    await testDb.user.create({
      data: {
        clerkId: "test",
        spotifyAccessToken: "meh",
        spotifyRefreshToken: "blahblah",
        spotifyTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
      },
    });

    const token = await getOrRefreshSpotifyToken({
      clerkId: "test",
    });
    expect(token).toBe("meh");
  });
  it("should refresh the token if it is expired", async () => {
    await testDb.user.create({
      data: {
        clerkId: "test",
        spotifyAccessToken: "meh",
        spotifyRefreshToken: "blahblah",
        spotifyTokenExpiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      },
    });

    const refreshSpotifyTokenSpy = vi.spyOn(
      refreshSpotifyTokenModule,
      "refreshSpotifyToken",
    );
    refreshSpotifyTokenSpy.mockResolvedValue("new-token");

    const token = await getOrRefreshSpotifyToken({
      clerkId: "test",
    });
    expect(token).toBe("new-token");
    expect(refreshSpotifyTokenSpy).toHaveBeenCalledWith({
      user: expect.objectContaining({
        clerkId: "test",
        spotifyAccessToken: "meh",
        spotifyRefreshToken: "blahblah",
        spotifyTokenExpiresAt: expect.any(Date),
      }),
    });

    refreshSpotifyTokenSpy.mockRestore();
  });
});
