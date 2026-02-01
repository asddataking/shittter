"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { MapWithMarkers } from "@/components/MapWithMarkers";
import { PlaceCard } from "@/components/PlaceCard";
import type { PlaceWithScore } from "@/lib/types";

const DEFAULT_CENTER = { lat: 42.2808, lng: -83.743 };

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 shrink-0">
      <Image
        src="/logo.png"
        alt="Shittter"
        width={48}
        height={48}
        className="object-contain w-12 h-12"
        priority
      />
      <h1 className="text-4xl font-bold text-slate-700 tracking-tight">Shittter</h1>
    </div>
  );
}

// Filter pill component
function FilterPill({ 
  children, 
  active, 
  onClick,
  icon,
}: { 
  children: React.ReactNode; 
  active?: boolean; 
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`filter-pill flex items-center gap-1.5 ${active ? "filter-pill-active" : ""}`}
    >
      {icon}
      {children}
    </button>
  );
}

export default function Home() {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<PlaceWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    hasLock: false,
    hasTp: false,
    openNow: false,
    fiveStarOnly: false,
  });

  const fetchNearby = useCallback(async () => {
    const c = center ?? DEFAULT_CENTER;
    const params = new URLSearchParams({
      lat: String(c.lat),
      lng: String(c.lng),
      radius: "3000",
    });
    if (filters.minScore > 0) params.set("minScore", String(filters.minScore));
    if (filters.hasLock) params.set("hasLock", "true");
    if (filters.hasTp) params.set("hasTp", "true");
    if (filters.fiveStarOnly) params.set("minScore", "80");
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/places/nearby?${params}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPlaces(data);
        if (data.length === 0) setApiError("No restrooms in this area yet. Be the first to report one.");
      } else {
        setPlaces([]);
        let msg = "Could not load places.";
        if (res.status === 503 && data?.error) {
          msg = data.detail
            ? `Database error: ${data.detail}`
            : "Database not connected. Add DATABASE_URL and run migrations.";
        } else if (data?.error && typeof data.error === "string") {
          msg = `${res.status ? `Error ${res.status}: ` : ""}${data.error}`;
        } else if (!res.ok) {
          msg = `Error ${res.status}: Could not load places.`;
        }
        setApiError(msg);
      }
    } catch (err) {
      setPlaces([]);
      setApiError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [center, filters]);

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

  // Fetch on mount (with DEFAULT_CENTER) and when center/filters change
  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  const totalRatings = 265000 + places.length * 100;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100">
      {/* Hero Section */}
      <header className="pt-8 pb-6 px-4 text-center">
        <Logo />
        <h2 className="mt-4 text-2xl font-semibold text-slate-700">
          Find a bathroom you can trust.
        </h2>
        <p className="mt-1 text-slate-500">
          Crowdsourced, anonymous, brutally honest.
        </p>
        {geoError && (
          <p className="mt-2 text-sm text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full">
            {geoError}
          </p>
        )}
        {apiError && (
          <p className="mt-2 text-sm text-sky-700 bg-sky-50 inline-block px-3 py-1 rounded-full max-w-md">
            {apiError}
          </p>
        )}
      </header>

      {/* Search Section */}
      <section className="px-4 pb-6">
        <div className="max-w-lg mx-auto">
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search near..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 rounded-l-xl border border-r-0 border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
            <button className="px-4 bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="px-4 bg-sky-600 text-white rounded-r-xl flex items-center justify-center hover:bg-sky-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <FilterPill 
              active={filters.openNow}
              onClick={() => setFilters(f => ({ ...f, openNow: !f.openNow }))}
              icon={<span className="text-green-500">◉</span>}
            >
              OPEN
            </FilterPill>
            <FilterPill 
              active={filters.fiveStarOnly}
              onClick={() => setFilters(f => ({ ...f, fiveStarOnly: !f.fiveStarOnly }))}
              icon={<span className="text-amber-500">★</span>}
            >
              5★ Only
            </FilterPill>
            <FilterPill icon={<span>🚹</span>}>Men</FilterPill>
            <FilterPill icon={<span>🚺</span>}>Women</FilterPill>
            <FilterPill icon={<span>♿</span>}>🚹🚺</FilterPill>
          </div>

          {/* CTA Button */}
          <button 
            onClick={() => setShowMap(!showMap)}
            className="w-full py-3 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-semibold rounded-full shadow-md hover:from-sky-500 hover:to-sky-600 transition-all flex items-center justify-center gap-2"
          >
            {showMap ? "Hide map" : "Find a bathroom"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Map (collapsible) */}
      {showMap && (
        <section className="px-4 pb-6">
          <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <MapWithMarkers places={places} center={center} />
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="px-4 pb-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-slate-700 mb-4">
            Top Restrooms Nearby
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <div className="text-4xl mb-3">🚽</div>
              <p className="text-slate-600 font-medium">No restrooms found nearby</p>
              <p className="text-slate-400 text-sm mt-1">Be the first to report one!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {places.map((place, index) => (
                <li key={place.id}>
                  <PlaceCard 
                    place={place}
                    reportCount={place.report_count}
                    isVerified={index === 0 && place.trust_score >= 70}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Report CTA Footer */}
      <footer className="px-4 py-8 bg-white border-t border-slate-200">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-slate-700 font-medium mb-4">
            See a shittter we should know about?
          </p>
          
          {/* Quick Report Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
              <span>😣</span> Dirty
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
              <span>⚠️</span> Unsafe
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
              <span>🧻</span> No TP
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
              <span>🔓</span> No Lock
            </button>
          </div>

          {/* Main Report Button */}
          <a
            href="/report"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-full shadow-md hover:from-sky-600 hover:to-sky-700 transition-all"
          >
            Report a shitter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          {/* Stats */}
          <p className="mt-6 text-sm text-slate-400">
            {totalRatings.toLocaleString()} ratings and counting.
          </p>

          {/* Optional sign up CTA */}
          <p className="mt-4 text-sm text-slate-500">
            Want to save preferences?{" "}
            <a href="/auth/sign-up" className="text-sky-600 hover:underline font-medium">
              Sign up
            </a>{" "}
            ·{" "}
            <a href="/auth/sign-in" className="text-sky-600 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
