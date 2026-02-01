import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo-utils";
import { getAllCityPaths, getAllNeighborhoodPaths } from "@/lib/seo-locations";
import { getAllPlaceIds } from "@/lib/places-server";

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/bathrooms/near-me`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const cityPaths = getAllCityPaths();
  const cityEntries: MetadataRoute.Sitemap = cityPaths.map(({ stateSlug, citySlug }) => ({
    url: `${base}/bathrooms/${stateSlug}/${citySlug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const neighborhoodPaths = getAllNeighborhoodPaths();
  const neighborhoodEntries: MetadataRoute.Sitemap = neighborhoodPaths.map(
    ({ stateSlug, citySlug, neighborhoodSlug }) => ({
      url: `${base}/bathrooms/${stateSlug}/${citySlug}/${neighborhoodSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  const placeIds = await getAllPlaceIds();
  const placeEntries: MetadataRoute.Sitemap = placeIds.map((id) => ({
    url: `${base}/p/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...cityEntries,
    ...neighborhoodEntries,
    ...placeEntries,
  ];
}
