import { describe, it, expect, vi } from "vitest";
import { db } from "@/vitest.setup";

import { GET } from "./route";
import { NextRequest } from "next/server";

describe("spotify callback route", () => {
  it("should redirect if error in url params", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/spotify/callback?error=test"),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=test");
  });
  it("should redirect if missing code or state in url params", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=missing_params");
  });
  it("should redirect if there is no stored state", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode&state=teststate",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=state_mismatch");
  });
  it("should redirect if there is a state mismatch", async () => {
    await db.spotifyAuthState.create({
      data: {
        state: "wrongstate",
        userId: "test-user-id",
      },
    });

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode&state=teststate",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=state_mismatch");
  });
  it("should redirect if env variables are not set", async () => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", undefined);

    await db.spotifyAuthState.create({
      data: {
        state: "teststate",
        userId: "test-user-id",
      },
    });

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode&state=teststate",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=config_error");

    await expect(db.spotifyAuthState.findFirst()).resolves.toBeNull();

    vi.unstubAllEnvs();
  });
  it("should redirect if token exchange fails", async () => {
    await db.spotifyAuthState.create({
      data: {
        state: "teststate",
        userId: "test-user-id",
      },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      text: async () => "Error message",
    } as Response);

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode&state=teststate",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=token_exchange");

    fetchSpy.mockRestore();
  });
  it("should redirect if invalid token data", async () => {
    await db.spotifyAuthState.create({
      data: {
        state: "teststate",
        userId: "test-user-id",
      },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "all good",
      json: async () => ({
        access_token: "test-access-token",
        refresh_token: undefined,
        expires_in: 3600,
      }),
    } as Response);

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode&state=teststate",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=invalid_token");

    fetchSpy.mockRestore();
  });
  it("should redirect to account page with success", async () => {
    const fixedDate = new Date("2025-01-01T12:00:00.000Z");
    vi.useFakeTimers({ now: fixedDate });
    await db.spotifyAuthState.create({
      data: {
        state: "teststate",
        userId: "test-user-id",
      },
    });

    await db.user.create({
      data: {
        clerkId: "test-user-id",
      },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "all good",
      json: async () => ({
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
      }),
    } as Response);

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode&state=teststate",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?success=true");

    const user = await db.user.findUnique({
      where: { clerkId: "test-user-id" },
    });
    expect(user).toBeDefined();
    expect(user?.spotifyAccessToken).toBe("test-access-token");
    expect(user?.spotifyRefreshToken).toBe("test-refresh-token");
    const expectedExpiration = new Date(fixedDate.getTime() + 3600 * 1000);
    expect(user?.spotifyTokenExpiresAt).toEqual(expectedExpiration);

    fetchSpy.mockRestore();
    vi.useRealTimers();
  });
  it("should redirect to account page with error", async () => {
    await db.spotifyAuthState.create({
      data: {
        state: "teststate",
        userId: "test-user-id",
      },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "all good",
      json: async () => ({
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
      }),
    } as Response);

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/spotify/callback?code=testcode&state=teststate",
      ),
    );

    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=server_error");

    fetchSpy.mockRestore();
  });
});
