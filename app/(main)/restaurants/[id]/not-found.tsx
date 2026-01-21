import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold">Restaurant introuvable</h1>
      <p className="mt-3 text-gray-600 max-w-md">
        Ce restaurant n’existe pas ou vous n’y avez pas accès.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href="/restaurants"
          className="rounded-lg bg-black px-4 py-2 text-white text-sm"
        >
          Retour aux restaurants
        </Link>

        <Link
          href="/dashboard"
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}