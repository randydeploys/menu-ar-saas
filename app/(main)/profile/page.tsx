import type { Metadata } from "next";
import { EmailForm } from "./email-form";
import { LogoutEverywhereButton } from "./logout-everywhere-button";
import { PasswordForm } from "./password-form";
import { ProfileDetailsForm } from "./profile-details-form";
import { getServerSession } from "@/lib/get-session";
import { redirect, unauthorized } from "next/navigation";
  import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {

 const sessionData = await getServerSession();

  if (!sessionData) return redirect("/login");

  const userId = sessionData.user.id;

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      providerId: true, // ou provider selon ton schema
    },
  });

   const hasOAuthAccount = accounts.some(
    (a) => a.providerId === "google" || a.providerId === "github"
  );

  console.log(hasOAuthAccount);


  if (!sessionData) {
    return redirect("/login");
  }

  const user = sessionData.user;

  if (!user) unauthorized();


return (
  <main className="mx-auto w-full max-w-6xl px-4 py-12">
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">
          Update your account details, email, and password.
        </p>
      </div>

      {hasOAuthAccount ? (
        <div className="space-y-6">
          <ProfileDetailsForm user={user} />

          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            You signed in with Google/GitHub. Your email and password are managed by the provider.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <ProfileDetailsForm user={user} />
          </div>

          <div className="flex-1 space-y-6">
            <EmailForm currentEmail={user.email} />
            <PasswordForm />
          </div>
        </div>
      )}

      <div className="pt-4">
        <LogoutEverywhereButton />
      </div>
    </div>
  </main>
);


}