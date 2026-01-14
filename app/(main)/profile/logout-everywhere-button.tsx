"use client";

import { LoadingButton } from "@/components/loading-button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutEverywhereButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogoutEverywhere() {
    setLoading(true);
    try {
      await authClient.revokeSessions();
      setLoading(false);
      router.push("/sign-in");
      toast.success("Logged out successfully from all devices");
    } catch (error) {
      console.error("Failed to logout everywhere", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoadingButton
      variant="destructive"
      onClick={handleLogoutEverywhere}
      loading={loading}
      className="w-full"
    >
      Log out everywhere
    </LoadingButton>
  );
}