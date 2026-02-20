"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Navigation } from "lucide-react";
import Header from "@/components/common/Header";

interface SearchResult {
  name: string;
  address: string;
  lat: string;
  lng: string;
}

export default function LocationPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(false);
        router.push(`/category?lat=${latitude}&lng=${longitude}`);
      },
      () => {
        alert(
          "위치를 가져올 수 없습니다.\n브라우저 설정에서 위치 권한을 허용하거나, 장소를 직접 검색해 주세요."
        );
        setLoading(false);
      }
    );
  };

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/geocode?query=${encodeURIComponent(address)}`
      );
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch {
      alert("검색 중 오류가 발생했습니다.");
      setResults([]);
    }

    setLoading(false);
  };

  const handleSelectResult = (result: SearchResult) => {
    router.push(
      `/category?lat=${result.lat}&lng=${result.lng}&location=${encodeURIComponent(result.name)}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
      <Header showBack />
      <main className="max-w-lg mx-auto px-4 pt-20 pb-10">
        <div className="space-y-4 mt-10">
          <button
            onClick={handleCurrentLocation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 min-h-[48px]"
          >
            <Navigation size={20} />
            {loading ? "위치를 찾는 중..." : "현재 위치 찾기"}
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-400">또는</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={handleAddressSearch} className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="장소나 주소를 검색하세요 (예: 강남역)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-4 rounded-xl hover:bg-gray-800 transition-colors min-h-[48px] disabled:opacity-50"
              aria-label="검색"
            >
              <Search size={20} />
            </button>
          </form>

          {searched && (
            <div className="space-y-2">
              {results.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
                </p>
              ) : (
                results.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 bg-white hover:border-primary hover:shadow-md transition-all"
                  >
                    <p className="text-gray-900 text-sm">
                      {result.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={12} />
                      {result.address}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
