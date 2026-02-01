/**
 * SEO location config: cities and neighborhoods with slugs and geography.
 * Used for /bathrooms/[state]/[city] and /bathrooms/[state]/[city]/[neighborhood].
 * Add more cities here to scale; each uses real nearby data from the DB.
 */
export interface NeighborhoodConfig {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  radiusM: number;
}

export interface CityConfig {
  stateSlug: string;
  stateName: string;
  citySlug: string;
  cityName: string;
  lat: number;
  lng: number;
  radiusM: number;
  neighborhoods: NeighborhoodConfig[];
}

export const SEO_LOCATIONS: CityConfig[] = [
  {
    stateSlug: "ca",
    stateName: "California",
    citySlug: "san-francisco",
    cityName: "San Francisco",
    lat: 37.7749,
    lng: -122.4194,
    radiusM: 15000,
    neighborhoods: [
      { slug: "downtown", name: "Downtown", lat: 37.7849, lng: -122.4094, radiusM: 2000 },
      { slug: "soma", name: "SoMa", lat: 37.7786, lng: -122.4058, radiusM: 2000 },
      { slug: "mission", name: "Mission", lat: 37.7599, lng: -122.4148, radiusM: 2500 },
      { slug: "castro", name: "Castro", lat: 37.7609, lng: -122.4350, radiusM: 1500 },
      { slug: "embarcadero", name: "Embarcadero", lat: 37.7956, lng: -122.3935, radiusM: 2000 },
    ],
  },
  {
    stateSlug: "mi",
    stateName: "Michigan",
    citySlug: "ann-arbor",
    cityName: "Ann Arbor",
    lat: 42.2808,
    lng: -83.743,
    radiusM: 12000,
    neighborhoods: [
      { slug: "downtown", name: "Downtown", lat: 42.2814, lng: -83.7485, radiusM: 1500 },
      { slug: "campus", name: "Campus", lat: 42.2780, lng: -83.7382, radiusM: 2000 },
      { slug: "kerrytown", name: "Kerrytown", lat: 42.2865, lng: -83.7420, radiusM: 1200 },
    ],
  },
];

export function getCityBySlugs(stateSlug: string, citySlug: string): CityConfig | undefined {
  return SEO_LOCATIONS.find(
    (c) => c.stateSlug === stateSlug.toLowerCase() && c.citySlug === citySlug.toLowerCase()
  );
}

export function getNeighborhoodBySlug(
  stateSlug: string,
  citySlug: string,
  neighborhoodSlug: string
): { city: CityConfig; neighborhood: NeighborhoodConfig } | undefined {
  const city = getCityBySlugs(stateSlug, citySlug);
  if (!city) return undefined;
  const neighborhood = city.neighborhoods.find(
    (n) => n.slug === neighborhoodSlug.toLowerCase()
  );
  if (!neighborhood) return undefined;
  return { city, neighborhood };
}

/** All city URLs for sitemap. */
export function getAllCityPaths(): { stateSlug: string; citySlug: string }[] {
  return SEO_LOCATIONS.flatMap((c) => ({
    stateSlug: c.stateSlug,
    citySlug: c.citySlug,
  }));
}

/** All neighborhood URLs for sitemap. */
export function getAllNeighborhoodPaths(): {
  stateSlug: string;
  citySlug: string;
  neighborhoodSlug: string;
}[] {
  return SEO_LOCATIONS.flatMap((c) =>
    c.neighborhoods.map((n) => ({
      stateSlug: c.stateSlug,
      citySlug: c.citySlug,
      neighborhoodSlug: n.slug,
    }))
  );
}
