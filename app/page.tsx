"use client"
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

 async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message || "Something went wrong");
    } else {
      toast.success("Signed out successfully");
      router.push("/sign-in");
    }
  }
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="mx-auto max-w-3xl text-center">
       
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Menu AR
        </h1>
        <p className="text-muted-foreground mt-3 text-base text-balance sm:text-lg">
          Menu AR est une plateforme de gestion des menus pour les restaurants.
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">

          <Button asChild>
            <Link href="/sign-in">Connexion</Link>
          </Button>

          {/* logout */}
          <Button onClick={handleSignOut}>
            Deconnexion
          </Button>
        </div>
      </div>
    </main>
  )
}