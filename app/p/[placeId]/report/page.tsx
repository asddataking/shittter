"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ReportForm, type ReportFormData } from "@/components/ReportForm";

interface PlaceInfo {
  id: string;
  name: string;
}

export default function PlaceReportPage() {
  const router = useRouter();
  const params = useParams();
  const placeId = params.placeId as string;
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/place/${placeId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.place) setPlace({ id: data.place.id, name: data.place.name });
      })
      .finally(() => setLoading(false));
  }, [placeId]);

  const handleSubmit = async (data: ReportFormData) => {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId: place!.id,
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4">
        <p className="text-slate-500">Loading...</p>
      </main>
    );
  }
  if (!place) {
    return (
      <main className="min-h-screen bg-slate-50 p-4">
        <p className="text-slate-600">Place not found.</p>
        <Link href="/" className="mt-2 inline-block text-teal-600 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }
  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 p-4">
        <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Thanks</h1>
          <p className="mt-2 text-slate-600">
            Your report helps the next person.
          </p>
          <Link
            href={`/p/${placeId}`}
            className="mt-4 inline-block rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Back to place
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link
          href={`/p/${placeId}`}
          className="text-sm text-teal-600 hover:underline"
        >
          Back to place
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Add a report — {place.name}
        </h1>
      </header>
      <div className="p-4">
        <div className="mx-auto max-w-md">
          <ReportForm placeId={place.id} onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
}
