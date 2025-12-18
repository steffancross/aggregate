import { redirect } from "next/navigation";

import { SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

const Login = async () => {
  const user = await currentUser();

  if (user) {
    redirect("/playlists");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Aggregate</h1>
      <SignInButton mode="modal" />
    </main>
  );
};

export default Login;
