import { vi } from "vitest";

// auth state should be set globally in vitest.setup
// use this for overrides
export const mockClerkAuth = async (userId: string | null = "test-user-id") => {
  const { auth } = await import("@clerk/nextjs/server");

  vi.mocked(auth).mockResolvedValue({
    userId,
  } as unknown as never);
};

export const mockClerkUnauthenticated = async () => {
  await mockClerkAuth(null);
};
