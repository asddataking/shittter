import Link from "next/link";
import { notFound } from "next/navigation";
import { getNeighborhoodBySlug } from "@/lib/seo-locations";
import { getPlacesNearbyForSEO } from "@/lib/places-server";
import { MapWithMarkers } from "@/components/MapWithMarkers";
import { PlaceCard } from "@/components/PlaceCard";

const SITE_NAME = "Shittter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; city: string; neighborhood: string }>;
}) {
  const { state, city, neighborhood } = await params;
  const result = getNeighborhoodBySlug(state, city, neighborhood);
  if (!result) return { title: `Public Bathrooms | ${SITE_NAME}` };
  const { city: cityConfig, neighborhood: n } = result;
  const title = `Bathrooms in ${n.name} ${cityConfig.cityName} | ${SITE_NAME}`;
  const description = `Find public bathrooms in ${n.name}, ${cityConfig.cityName}, ${cityConfig.stateName}. Community-reported trust scores and access info.`;
  return { title, description };
}

export default async function NeighborhoodBathroomsPage({
  params,
}: {
  params: Promise<{ state: string; city: string; neighborhood: string }>;
}) {
  const { state, city, neighborhood } = await params;
  const result = getNeighborhoodBySlug(state, city, neighborhood);
  if (!result) notFound();

  const { city: cityConfig, neighborhood: n } = result;
  const places = await getPlacesNearbyForSEO(
    n.lat,
    n.lng,
    n.radiusM,
    null
  );
  const center = { lat: n.lat, lng: n.lng };
  const hasData = places.length > 0;
  const displayPlaces = places.slice(0, 15);

  // Data-driven summary (no AI; real stats only)
  const avgScore =
    places.length > 0
      ? Math.round(
          places.reduce((s, p) => s + p.trust_score, 0) / places.length
        )
      : null;
  const withLock = places.filter((p) => p.has_lock_majority).length;
  const withTp = places.filter((p) => p.has_tp_majority).length;

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
          <Link
            href={`/bathrooms/${cityConfig.stateSlug}/${cityConfig.citySlug}`}
            className="text-sky-600 hover:text-sky-700"
          >
            {cityConfig.cityName}, {cityConfig.stateName}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-slate-800 font-medium">{n.name}</span>
        </nav>
        <h1 className="mt-4 text-2xl font-bold text-slate-800 md:text-3xl">
          Bathrooms in {n.name}, {cityConfig.cityName}
        </h1>
        <p className="mt-2 text-slate-600">
          Public bathroom options in {n.name}. Community-reported cleanliness
          and access.
        </p>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <section className="mb-8">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <MapWithMarkers places={displayPlaces} center={center} />
          </div>
        </section>

        {hasData ? (
          <>
            {/* Neighborhood summary - real data only */}
            <section className="mb-8 rounded-xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                About bathroom access in {n.name}
              </h2>
              <ul className="text-sm text-slate-600 space-y-1">
                {avgScore !== null && (
                  <li>Average trust score: {avgScore} (from {places.length} locations)</li>
                )}
                {withLock > 0 && (
                  <li>Most reports mention lock availability at {withLock} of {places.length} places.</li>
                )}
                {withTp > 0 && (
                  <li>TP availability reported at {withTp} of {places.length} places.</li>
                )}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Nearby restrooms
              </h2>
              <ul className="space-y-3">
                {displayPlaces.map((place) => (
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

            {/* Sibling neighborhoods */}
            {cityConfig.neighborhoods.length > 1 && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  Other neighborhoods in {cityConfig.cityName}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {cityConfig.neighborhoods
                    .filter((nb) => nb.slug !== n.slug)
                    .map((nb) => (
                      <li key={nb.slug}>
                        <Link
                          href={`/bathrooms/${cityConfig.stateSlug}/${cityConfig.citySlug}/${nb.slug}`}
                          className="inline-block rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                        >
                          {nb.name}
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
              No bathrooms mapped in {n.name} yet.
            </p>
            <p className="mt-2 text-slate-500 text-sm">
              Help map this area by adding a report.
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
          <Link
            href={`/bathrooms/${cityConfig.stateSlug}/${cityConfig.citySlug}`}
            className="text-sky-600 hover:underline"
          >
            ← All bathrooms in {cityConfig.cityName}
          </Link>
        </footer>
      </div>
    </main>
  );
}
