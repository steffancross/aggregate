"use client";

import { useAuth, SignOutButton } from "@clerk/nextjs";

import MusicPlayer from "~/app/_components/MusicPlayer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <main>{children}</main>
      <SignOutButton />
      <div className="border-green fixed right-0 bottom-0 left-0 z-50 border-1">
        <MusicPlayer />
      </div>
    </>
  );
};

export default MainLayout;
