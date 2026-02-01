import Link from "next/link";
import { notFound } from "next/navigation";
import { getCityBySlugs } from "@/lib/seo-locations";
import { getPlacesNearbyForSEO } from "@/lib/places-server";
import { MapWithMarkers } from "@/components/MapWithMarkers";
import { PlaceCard } from "@/components/PlaceCard";
import type { PlaceWithScore } from "@/lib/types";

const SITE_NAME = "Shittter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const config = getCityBySlugs(state, city);
  if (!config) return { title: `Public Bathrooms | ${SITE_NAME}` };
  const title = `Public Bathrooms in ${config.cityName}, ${config.stateName} | ${SITE_NAME}`;
  const description = `Find trusted public bathrooms in ${config.cityName}, ${config.stateName}. Community-reported cleanliness, privacy, and access info.`;
  return { title, description };
}

export default async function CityBathroomsPage({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const config = getCityBySlugs(state, city);
  if (!config) notFound();

  const places = await getPlacesNearbyForSEO(
    config.lat,
    config.lng,
    config.radiusM,
    60
  );
  const center = { lat: config.lat, lng: config.lng };
  const hasData = places.length > 0;
  const topPlaces = places.slice(0, 15);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="text-sky-600 hover:text-sky-700">
            {SITE_NAME}
          </Link>
          <span aria-hidden>/</span>
          <Link href="/bathrooms/near-me" className="text-sky-600 hover:text-sky-700">
            Bathrooms
          </Link>
          <span aria-hidden>/</span>
          <span className="text-slate-800 font-medium">
            {config.cityName}, {config.stateName}
          </span>
        </nav>
        <h1 className="mt-4 text-2xl font-bold text-slate-800 md:text-3xl">
          Public Bathrooms in {config.cityName}, {config.stateName}
        </h1>
        <p className="mt-2 text-slate-600">
          Find bathrooms you can trust in {config.cityName}. Community-reported
          cleanliness, privacy, and access.
        </p>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Map */}
        <section className="mb-8">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <MapWithMarkers
              places={topPlaces}
              center={center}
            />
          </div>
        </section>

        {hasData ? (
          <>
            {/* Best Public Bathrooms */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Best Public Bathrooms in {config.cityName}
              </h2>
              <p className="text-slate-600 mb-4 text-sm">
                Top-rated options by trust score. Based on real reports from the
                community.
              </p>
              <ul className="space-y-3">
                {topPlaces.map((place) => (
                  <li key={place.id}>
                    <PlaceCard
                      place={place}
                      reportCount={place.report_count}
                      isVerified={place.trust_score >= 80}
                    />
                  </li>
                ))}
              </ul>
            </section>

            {/* Emergency / quick options */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Emergency bathroom options
              </h2>
              <p className="text-slate-600 text-sm">
                When you need a bathroom fast, check the list above and look for
                high trust scores and &quot;Has lock&quot; / &quot;Has TP&quot; so you know
                what to expect.
              </p>
            </section>

            {/* What locals say - data-driven */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                What the data shows about bathroom access in {config.cityName}
              </h2>
              <p className="text-slate-600 text-sm">
                {places.length} bathroom{places.length !== 1 ? "s" : ""} listed in
                this area with an average trust score of{" "}
                {Math.round(
                  places.reduce((s, p) => s + p.trust_score, 0) / places.length
                )}
                . Reports cover cleanliness, privacy, lock and TP availability.
              </p>
            </section>

            {/* Neighborhoods */}
            {config.neighborhoods.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Bathrooms by neighborhood
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {config.neighborhoods.map((n) => (
                    <li key={n.slug}>
                      <Link
                        href={`/bathrooms/${config.stateSlug}/${config.citySlug}/${n.slug}`}
                        className="inline-block rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                      >
                        {n.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <section className="rounded-xl bg-white border border-slate-200 p-8 text-center">
            <p className="text-slate-600 font-medium">
              No bathrooms mapped in this area yet.
            </p>
            <p className="mt-2 text-slate-500 text-sm">
              Help others by adding the first report.
            </p>
            <Link
              href="/report"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-white font-semibold hover:bg-sky-600"
            >
              Report a bathroom
            </Link>
          </section>
        )}

        <footer className="mt-10 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          <Link href="/" className="text-sky-600 hover:underline">
            Back to {SITE_NAME} home
          </Link>
        </footer>
      </div>
    </main>
  );
}
