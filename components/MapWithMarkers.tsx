"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import Link from "next/link";
import { TrustScoreBadge } from "./TrustScoreBadge";
import type { PlaceWithScore } from "@/lib/types";

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

interface MapWithMarkersProps {
  places: PlaceWithScore[];
  center: { lat: number; lng: number } | null;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapWithMarkers({
  places,
  center,
  onMapReady,
}: MapWithMarkersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithScore | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || !containerRef.current) return;

    const loader = new Loader({
      apiKey: key,
      version: "weekly",
    });

    loader
      .load()
      .then(() => {
        const map = new google.maps.Map(containerRef.current!, {
          center: center ?? DEFAULT_CENTER,
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
        });
        mapRef.current = map;
        onMapReady?.(map);
      })
      .catch((err) => setLoadError(String(err)));
  }, [onMapReady]);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setCenter(center);
  }, [center]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = mapRef.current;
    for (const place of places) {
      const marker = new google.maps.Marker({
        map,
        position: { lat: place.lat, lng: place.lng },
        title: place.name,
      });
      marker.addListener("click", () => setSelectedPlace(place));
      markersRef.current.push(marker);
    }
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [places]);

  return (
    <div className="relative h-[40vh] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      <div ref={containerRef} className="h-full w-full" />
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 text-center text-sm text-slate-600">
          Map could not load. Check your API key.
        </div>
      )}
      {selectedPlace && (
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{selectedPlace.name}</p>
              <TrustScoreBadge score={selectedPlace.trust_score} size="sm" />
            </div>
            <Link
              href={`/p/${selectedPlace.id}`}
              className="shrink-0 rounded bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
            >
              Open details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
