"use client";

import { useEffect, useRef } from "react";

export interface MapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface KakaoMapProps {
  centerLat: number;
  centerLng: number;
  places: MapPlace[];
  onMarkerClick?: (placeId: string) => void;
  categoryColor?: string;
}

export default function KakaoMap({
  centerLat,
  centerLng,
  places,
  onMarkerClick,
  categoryColor = "#FF6B6B",
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      const center = new kakao.maps.LatLng(centerLat, centerLng);
      const map = new kakao.maps.Map(mapRef.current!, {
        center,
        level: 5,
      });
      mapInstanceRef.current = map;

      new kakao.maps.Circle({
        center,
        radius: 1000,
        strokeWeight: 2,
        strokeColor: categoryColor,
        strokeOpacity: 0.8,
        strokeStyle: "dashed",
        fillColor: categoryColor,
        fillOpacity: 0.08,
        map,
      });
    };

    const tryInit = () => {
      if (typeof kakao !== "undefined" && kakao.maps) {
        kakao.maps.load(initMap);
      } else {
        setTimeout(tryInit, 300);
      }
    };
    tryInit();
  }, [centerLat, centerLng, categoryColor]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = () => {
      const map = mapInstanceRef.current!;

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      places.forEach((place) => {
        const position = new kakao.maps.LatLng(place.lat, place.lng);
        const marker = new kakao.maps.Marker({ position, map });

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:4px 8px;font-size:12px;white-space:nowrap;">${place.name}</div>`,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
          if (onMarkerClick) onMarkerClick(place.id);
        });

        markersRef.current.push(marker);
      });
    };

    const tryUpdate = () => {
      if (typeof kakao !== "undefined" && kakao.maps && kakao.maps.LatLng) {
        updateMarkers();
      } else {
        setTimeout(tryUpdate, 300);
      }
    };
    tryUpdate();
  }, [places, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-full" />;
}
