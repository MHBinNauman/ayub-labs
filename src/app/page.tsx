import { brand } from "@/data/site-data";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">{brand.displayName}</h1>
    </main>
  );
}
