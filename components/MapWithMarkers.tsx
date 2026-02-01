"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TrustScoreBadge } from "./TrustScoreBadge";
import type { PlaceWithScore } from "@/lib/types";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [42.2808, -83.743];

interface MapWithMarkersProps {
  places: PlaceWithScore[];
  center: { lat: number; lng: number } | null;
  onMapReady?: (map: LeafletMap) => void;
}

export function MapWithMarkers({
  places,
  center,
  onMapReady,
}: MapWithMarkersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithScore | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // Fix default marker icon in bundled apps (Next.js/webpack)
      const DefaultIcon = L.default.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.default.Marker.prototype.options.icon = DefaultIcon;

      const map = L.default.map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 14,
        zoomControl: true,
      });
      L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.default.control.zoom({ position: "topright" }).addTo(map);
      mapRef.current = map;
      onMapReady?.(map);
    }).catch((err) => {
      if (!cancelled) setLoadError(String(err));
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    import("leaflet").then((L) => {
      for (const place of places) {
        const marker = L.default
          .marker([place.lat, place.lng], { title: place.name })
          .addTo(map)
          .on("click", () => setSelectedPlace(place));
        markersRef.current.push(marker);
      }
    });
  }, [places]);

  return (
    <div className="relative h-[40vh] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      <div ref={containerRef} className="h-full w-full" />
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 text-center text-sm text-slate-600">
          Map could not load.
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
