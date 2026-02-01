import Link from "next/link";
import { NearMeContent } from "./NearMeContent";

const SITE_NAME = "Shittter";

export const metadata = {
  title: `Public Bathrooms Near Me | ${SITE_NAME}`,
  description:
    "Find public bathrooms near you. Community-reported cleanliness, privacy, and trust scores. Use your location to see restrooms nearby.",
};

export default function NearMePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="text-sky-600 hover:text-sky-700">
            {SITE_NAME}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-slate-800 font-medium">Bathrooms near me</span>
        </nav>
        <h1 className="mt-4 text-2xl font-bold text-slate-800 md:text-3xl">
          Public bathrooms near you
        </h1>
        {/* Crawler-visible fallback text */}
        <p className="mt-2 text-slate-600">
          Find public bathrooms near your location. Community-reported
          cleanliness, privacy, and access. Enable location to see restrooms
          nearby, or browse by city.
        </p>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <NearMeContent />
      </div>
    </main>
  );
}
