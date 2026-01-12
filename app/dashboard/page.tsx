"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  
  // On utilise le hook client de Better Auth pour récupérer la session
  const { data: session, isPending, error } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  // 1. État de chargement
  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 2. Si pas de session ou erreur, redirection client
  if (!session || error) {
    router.push("/sign-in");
    return null;
  }

  const user = session.user;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="rounded-lg border p-4 bg-card">
            <p className="font-medium">Email: <span className="text-muted-foreground">{user.email}</span></p>
            <p className="font-medium">Nom: <span className="text-muted-foreground">{user.name}</span></p>
          </div>
          
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your account overview.
          </p>

          <div className="pt-6">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}