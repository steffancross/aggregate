"use client";

import { SignInButton } from "@clerk/nextjs";

const Login = () => {
  return (
    <main className="bg-green flex min-h-screen flex-col items-center justify-center text-black">
      <h1 className="text-4xl font-bold">Aggregate</h1>
      <SignInButton mode="modal" />
    </main>
  );
};

export default Login;
