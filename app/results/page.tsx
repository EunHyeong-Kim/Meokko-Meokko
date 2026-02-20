"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { MapPin, Heart, Phone, Ban, Share2 } from "lucide-react";
import Header from "@/components/common/Header";
import { CATEGORIES } from "@/constants/categories";

interface SearchResult {
  id: string;
  name: string;
  category_detail: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance: number;
  place_url: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryCode = searchParams.get("category");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const category = CATEGORIES.find((c) => c.code === categoryCode);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [blockedSet, setBlockedSet] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 10;
  const maxPages = 5;
  const filteredResults = results.filter((r) => !blockedSet.has(r.name));
  const cappedResults = filteredResults.slice(0, perPage * maxPages);
  const totalPages = Math.ceil(cappedResults.length / perPage);
  const pagedResults = cappedResults.slice((page - 1) * perPage, page * perPage);

  const toggleBlock = async (place: SearchResult) => {
    try {
      const res = await fetch("/api/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          category: categoryCode || "bapsim",
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          description: place.category_detail,
          place_url: place.place_url,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      if (data.blocked) {
        setBlockedSet((prev) => new Set(prev).add(place.name));
      }
    } catch {
      alert("차단 처리 중 오류가 발생했습니다.");
    }
  };

  const handleShare = async (place: SearchResult) => {
    const shareData = {
      title: place.name,
      text: `${place.name} - ${place.address}`,
      url: place.place_url || "",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          place.place_url || `${place.name} - ${place.address}`
        );
        alert("링크가 복사되었습니다!");
      }
    } catch {}
  };

  const toggleFavorite = async (place: SearchResult) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          category: categoryCode || "bapsim",
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          description: place.category_detail,
          place_url: place.place_url,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setFavSet((prev) => {
        const next = new Set(prev);
        if (data.favorited) {
          next.add(place.name);
        } else {
          next.delete(place.name);
        }
        return next;
      });
    } catch {
      alert("즐겨찾기 처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (!categoryCode || !lat || !lng) {
      setError("위치 정보가 없습니다. 위치 설정 페이지로 이동해 주세요.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const searchRes = await fetch(
          `/api/search?${new URLSearchParams({ category: categoryCode, lat, lng })}`
        );
        const contentType = searchRes.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const searchData = await searchRes.json();
          if (!searchData.error) {
            setResults(searchData.results || []);
          }
        }
      } catch {}

      try {
        const favRes = await fetch("/api/favorites");
        const favContentType = favRes.headers.get("content-type") || "";
        if (favContentType.includes("application/json")) {
          const favData = await favRes.json();
          if (favData.favorites) {
            const names = new Set<string>(
              favData.favorites.map(
                (f: { restaurants: { name: string } }) => f.restaurants.name
              )
            );
            setFavSet(names);
          }
        }
      } catch {}

      try {
        const blockRes = await fetch("/api/blocked");
        const blockContentType = blockRes.headers.get("content-type") || "";
        if (blockContentType.includes("application/json")) {
          const blockData = await blockRes.json();
          if (blockData.blocked) {
            const names = new Set<string>(
              blockData.blocked.map(
                (b: { restaurants: { name: string } }) => b.restaurants.name
              )
            );
            setBlockedSet(names);
          }
        }
      } catch {}

      setLoading(false);
    };

    fetchData();
  }, [categoryCode, lat, lng]);

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (!lat || !lng) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50 flex flex-col">
        <Header showBack />
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-lg text-gray-600">
              위치 정보가 필요합니다.
            </p>
            <button
              onClick={() => router.push("/location")}
              className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-red-500 transition"
            >
              위치 설정하러 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
      <Header showBack />
      <main className="px-4 pt-4 pb-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {category
              ? `${category.icon} ${category.label}`
              : "검색 결과"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? "맛집을 찾는 중..."
              : `반경 500m 내 ${cappedResults.length}개의 맛집`}
          </p>
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-400">주변 맛집을 검색 중...</p>
            </div>
          ) : cappedResults.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">
                주변에 맛집을 찾지 못했어요
              </p>
              <p className="text-sm mt-1">
                다른 카테고리를 선택하거나 위치를 변경해 보세요.
              </p>
            </div>
          ) : (
            pagedResults.map((place) => (
              <div
                key={place.id}
                className="p-3 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-900 truncate flex-1 min-w-0">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} />
                      {formatDistance(place.distance)}
                    </span>
                    <button
                      onClick={() => toggleFavorite(place)}
                      className="p-1 rounded-full hover:bg-red-50 transition-colors"
                      aria-label="즐겨찾기"
                    >
                      <Heart
                        size={16}
                        className={
                          favSet.has(place.name)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-300"
                        }
                      />
                    </button>
                    <button
                      onClick={() => handleShare(place)}
                      className="p-1 rounded-full hover:bg-blue-50 transition-colors"
                      aria-label="공유"
                    >
                      <Share2 size={16} className="text-gray-300 hover:text-blue-500" />
                    </button>
                    <button
                      onClick={() => toggleBlock(place)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="다시 보지 않기"
                    >
                      <Ban size={16} className="text-gray-300 hover:text-gray-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {place.address}
                </p>
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-1 text-sm text-gray-500 mt-1 hover:text-primary"
                  >
                    <Phone size={13} />
                    {place.phone}
                  </a>
                )}
                {place.place_url && (
                  <a
                    href={place.place_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-primary mt-2 hover:underline"
                  >
                    상세 정보
                  </a>
                )}
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-9 h-9 rounded-full text-sm transition-colors ${
                      p === page
                        ? "bg-primary text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
