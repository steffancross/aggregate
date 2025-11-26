import { describe, it, expect, vi } from "vitest";
import { testDb } from "@/vitest.setup";
import { refreshSpotifyToken } from "./refreshSpotifyToken";
import type { User } from "@prisma/client";

describe("refreshSpotifyToken", () => {
  it("should error if no credentials", async () => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", undefined);

    await expect(
      refreshSpotifyToken({ user: { id: 1 } as User }),
    ).rejects.toThrow("Spotify client ID or secret not found");

    vi.unstubAllEnvs();
  });
  it("should error if user doesn't have a refresh token", async () => {
    await expect(
      refreshSpotifyToken({ user: { id: 1 } as User }),
    ).rejects.toThrow("User has no Spotify refresh token, reauthorize");
  });
  it("should error if token refresh fails", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      text: async () => "not good",
    } as Response);

    await expect(
      refreshSpotifyToken({
        user: { id: 1, spotifyRefreshToken: "test" } as User,
      }),
    ).rejects.toThrow("Token response not ok: not good");

    fetchSpy.mockRestore();
  });
  it("should return the new token and update old refresh token when received", async () => {
    const user = await testDb.user.create({
      data: {
        clerkId: "test",
        spotifyRefreshToken: "old refresh",
        spotifyAccessToken: "old access",
      },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "all good",
      json: async () => ({
        access_token: "new access",
        refresh_token: "new refresh",
        expires_in: 3600,
      }),
    } as Response);

    const token = await refreshSpotifyToken({ user });
    expect(token).toBe("new access");

    const updatedUser = await testDb.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser?.spotifyAccessToken).toBe("new access");
    expect(updatedUser?.spotifyRefreshToken).toBe("new refresh");
    expect(updatedUser?.spotifyTokenExpiresAt).toBeDefined();

    fetchSpy.mockRestore();
  });
  it("should return the new token and work if refresh token is not included", async () => {
    const user = await testDb.user.create({
      data: {
        clerkId: "test",
        spotifyRefreshToken: "old refresh",
        spotifyAccessToken: "old access",
      },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "all good",
      json: async () => ({
        access_token: "new access",
        expires_in: 3600,
      }),
    } as Response);

    const token = await refreshSpotifyToken({ user });
    expect(token).toBe("new access");

    const updatedUser = await testDb.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser?.spotifyAccessToken).toBe("new access");
    expect(updatedUser?.spotifyRefreshToken).toBe("old refresh");
    expect(updatedUser?.spotifyTokenExpiresAt).toBeDefined();

    fetchSpy.mockRestore();
  });
  it("should error if something goes wrong in try block", async () => {
    const user = await testDb.user.create({
      data: {
        clerkId: "test",
        spotifyRefreshToken: "old refresh",
        spotifyAccessToken: "old access",
      },
    });

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("Network error"));

    await expect(refreshSpotifyToken({ user })).rejects.toThrow(
      "Failed to refresh Spotify token: Network error",
    );

    fetchSpy.mockRestore();
  });
});
