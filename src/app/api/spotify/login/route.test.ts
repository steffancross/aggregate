import { describe, it, expect, vi } from "vitest";
import { testDb } from "@/vitest.setup";

import { mockClerkUnauthenticated, mockClerkAuth } from "~/test-utils/mocks";
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("spotify login route", () => {
  it("should redirect to account page with error if no user", async () => {
    await mockClerkUnauthenticated();

    const response = await GET(new NextRequest("http://localhost:3000/"));

    expect(response.status).toBe(307);
    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=unauthorized");
  });
  it("should redirect to account page with error if env variables are not set", async () => {
    // reset clerk here otherwise unauth from above carries over
    await mockClerkAuth();
    vi.stubEnv("SPOTIFY_CLIENT_ID", undefined);
    const response = await GET(new NextRequest("http://localhost:3000/"));

    expect(response.status).toBe(307);
    const location = response.headers.get("Location");
    expect(location).toContain("/account?error=config_error");

    vi.unstubAllEnvs();
  });
  it("should redirect to spotify and store state in db", async () => {
    const response = await GET(new NextRequest("http://localhost:3000/"));

    expect(response.status).toBe(307);
    const location = response.headers.get("Location");
    expect(location).toContain("https://accounts.spotify.com/authorize?");

    const url = new URL(location!);
    const params = new URLSearchParams(url.search);

    expect(params.get("client_id")).toBe(process.env.SPOTIFY_CLIENT_ID);
    expect(params.get("response_type")).toBe("code");
    expect(params.get("redirect_uri")).toBe(process.env.SPOTIFY_REDIRECT_URI);
    expect(params.get("scope")).toBe(
      "user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state user-read-currently-playing",
    );

    const state = params.get("state");
    expect(state).toBeDefined();

    const storedState = await testDb.spotifyAuthState.findUnique({
      where: { state: state! },
    });
    expect(storedState).toBeDefined();
    expect(storedState?.userId).toBe("test-user-id");
  });
});
