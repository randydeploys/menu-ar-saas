import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center text-center">
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-gray-600">Page introuvable</p>
        <Link href="/" className="mt-4 inline-block underline">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}