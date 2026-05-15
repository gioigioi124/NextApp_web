import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="text-center font-heading text-2xl font-bold text-primary">
          Lumina
        </Link>
        {children}
      </div>
    </main>
  );
}
