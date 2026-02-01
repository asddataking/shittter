"use client";

import { useEffect, useState, useCallback } from "react";
import { MapWithMarkers } from "@/components/MapWithMarkers";
import { PlaceCard } from "@/components/PlaceCard";
import type { PlaceWithScore } from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

export default function Home() {
  const [center, setCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [places, setPlaces] = useState<PlaceWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minScore: 0,
    hasLock: false,
    hasTp: false,
  });

  const fetchNearby = useCallback(async () => {
    const c = center ?? DEFAULT_CENTER;
    const params = new URLSearchParams({
      lat: String(c.lat),
      lng: String(c.lng),
      radius: "1200",
    });
    if (filters.minScore > 0) params.set("minScore", String(filters.minScore));
    if (filters.hasLock) params.set("hasLock", "true");
    if (filters.hasTp) params.set("hasTp", "true");
    setLoading(true);
    try {
      const res = await fetch(`/api/places/nearby?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlaces(data);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [center, filters.minScore, filters.hasLock, filters.hasTp]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCenter(DEFAULT_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {
        setGeoError("Location not available. Using default area.");
        setCenter(DEFAULT_CENTER);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    if (center === null) return;
    fetchNearby();
  }, [center, fetchNearby]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-6 text-center">
        <h1 className="text-2xl font-semibold text-teal-800">Shittter</h1>
        <p className="mt-1 text-slate-600">
          Find a bathroom you can trust.
        </p>
        <p className="text-sm text-slate-500">
          Crowdsourced, anonymous, honest.
        </p>
        {geoError && (
          <p className="mt-2 text-sm text-amber-700">{geoError}</p>
        )}
      </header>

      <section className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span>Min score</span>
            <select
              value={filters.minScore}
              onChange={(e) =>
                setFilters((f) => ({ ...f, minScore: Number(e.target.value) }))
              }
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value={0}>Any</option>
              <option value={40}>40+</option>
              <option value={60}>60+</option>
              <option value={70}>70+</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.hasLock}
              onChange={(e) =>
                setFilters((f) => ({ ...f, hasLock: e.target.checked }))
              }
              className="rounded border-slate-300"
            />
            Has Lock
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.hasTp}
              onChange={(e) =>
                setFilters((f) => ({ ...f, hasTp: e.target.checked }))
              }
              className="rounded border-slate-300"
            />
            Has TP
          </label>
        </div>

        <div className="mb-4">
          <MapWithMarkers places={places} center={center} />
        </div>

        <h2 className="mb-2 text-lg font-medium text-slate-800">
          Top restrooms nearby
        </h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : places.length === 0 ? (
          <p className="text-slate-500">No places in this area yet.</p>
        ) : (
          <ul className="space-y-3">
            {places.map((place) => (
              <li key={place.id}>
                <PlaceCard place={place} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center">
        <p className="text-sm text-slate-500">
          See a restroom we should know about?
        </p>
        <a
          href="/report"
          className="mt-2 inline-block rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Report a restroom
        </a>
      </footer>
    </main>
  );
}
