"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ReportForm, type ReportFormData } from "@/components/ReportForm";

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

export default function NewPlaceReportPage() {
  const [name, setName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords(DEFAULT_CENTER);
      setGeoError("Location not available. Using default.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {
        setGeoError("Location denied. Using default.");
        setCoords(DEFAULT_CENTER);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  const handleSubmit = async (data: ReportFormData) => {
    const c = coords ?? DEFAULT_CENTER;
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || "Unnamed place",
        lat: c.lat,
        lng: c.lng,
        cleanliness: data.cleanliness,
        privacy: data.privacy,
        safety: data.safety,
        has_lock: data.has_lock,
        has_tp: data.has_tp,
        access: data.access,
        notes: data.notes || null,
        photo_urls: data.photo_urls ?? [],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to submit");
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100 flex items-center justify-center p-4">
        <div className="mx-auto max-w-md rounded-2xl bg-white shadow-lg border border-slate-200 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-800">Thanks!</h1>
          <p className="mt-2 text-slate-600">
            Your report helps the next person find a throne.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-full shadow-md hover:from-sky-600 hover:to-sky-700 transition-all"
          >
            Back to search
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-800">
          Report a shitter 💩
        </h1>
        <p className="text-slate-500 mt-1">
          Add a new place and your honest review. We&apos;ll use your location.
        </p>
        {geoError && (
          <p className="mt-2 text-sm text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full">
            {geoError}
          </p>
        )}
      </header>

      <div className="p-4">
        <div className="mx-auto max-w-md space-y-4">
          {/* Place Name Input */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              📍 Place name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Urban Grind Coffee"
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Report Form */}
          <ReportForm
            placeName={name.trim() || undefined}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
