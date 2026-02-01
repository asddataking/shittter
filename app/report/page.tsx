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
      <main className="min-h-screen bg-slate-50 p-4">
        <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Thanks</h1>
          <p className="mt-2 text-slate-600">
            Your report helps the next person.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link href="/" className="text-sm text-teal-600 hover:underline">
          Back to home
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Report a restroom
        </h1>
        <p className="text-sm text-slate-500">
          Add a new place and your report. We&apos;ll use your location.
        </p>
        {geoError && (
          <p className="mt-1 text-sm text-amber-700">{geoError}</p>
        )}
      </header>
      <div className="p-4">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Place name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Urban Grind Coffee"
              maxLength={500}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
          <ReportForm
            placeName={name.trim() || undefined}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
