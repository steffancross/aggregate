"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const AccountContent = () => {
  // react strict mode fix
  const firedRef = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data, isLoading } = api.user.userConnectedToSpotify.useQuery();

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (!error && !success) return;

    if (error) toast.error("Something went wrong, please try again later.");
    if (success) toast.success("Spotify connected successfully");

    router.replace("/account");
  }, [router, searchParams]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h1>Account</h1>
      <Button
        onClick={() => (window.location.href = "/api/spotify/login")}
        disabled={data ?? isLoading}
      >
        {isLoading ? "Loading..." : data ? "Connected" : "Connect Spotify"}
      </Button>
    </main>
  );
};

const Account = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <AccountContent />
    </Suspense>
  );
};

export default Account;
