"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MapWithMarkers } from "@/components/MapWithMarkers";
import { PlaceCard } from "@/components/PlaceCard";
import type { PlaceWithScore } from "@/lib/types";

const SITE_NAME = "Shittter";
const DEFAULT_CENTER = { lat: 42.2808, lng: -83.743 };

export function NearMeContent() {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<PlaceWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: "5000",
      });
      const res = await fetch(`/api/places/nearby?${params}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPlaces(data);
      } else {
        setPlaces([]);
      }
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCenter(DEFAULT_CENTER);
      setGeoError("Location not available.");
      fetchNearby(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(c);
        fetchNearby(c.lat, c.lng);
      },
      () => {
        setGeoError("Location denied. Showing default area.");
        setCenter(DEFAULT_CENTER);
        fetchNearby(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [fetchNearby]);

  const c = center ?? DEFAULT_CENTER;

  return (
    <>
      {geoError && (
        <p className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {geoError}
        </p>
      )}

      <section className="mb-8">
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <MapWithMarkers places={places} center={c} />
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : places.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Restrooms nearby
          </h2>
          <ul className="space-y-3">
            {places.slice(0, 15).map((place) => (
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
      ) : (
        <section className="rounded-xl bg-white border border-slate-200 p-8 text-center">
          <p className="text-slate-600">No bathrooms found nearby.</p>
          <Link
            href="/report"
            className="mt-4 inline-block rounded-full bg-sky-500 px-6 py-3 text-white font-semibold hover:bg-sky-600"
          >
            Report a bathroom
          </Link>
        </section>
      )}

      <section className="mt-10 rounded-xl bg-white border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Browse by city
        </h2>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/bathrooms/ca/san-francisco"
              className="text-sky-600 hover:underline font-medium"
            >
              San Francisco, CA
            </Link>
          </li>
          <li>
            <Link
              href="/bathrooms/mi/ann-arbor"
              className="text-sky-600 hover:underline font-medium"
            >
              Ann Arbor, MI
            </Link>
          </li>
        </ul>
      </section>

      <footer className="mt-10 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
        <Link href="/" className="text-sky-600 hover:underline">
          Back to {SITE_NAME} home
        </Link>
      </footer>
    </>
  );
}
