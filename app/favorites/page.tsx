"use client";

import { useEffect, useState } from "react";
import { Heart, MapPin, Trash2, ExternalLink, Share2 } from "lucide-react";
import Header from "@/components/common/Header";

interface FavoriteItem {
  id: number;
  created_at: string;
  restaurants: {
    id: number;
    name: string;
    category: string;
    lat: number;
    lng: number;
    address: string;
    description: string;
    image_url: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.favorites) {
        setFavorites(data.favorites);
      }
    } catch {
      console.error("즐겨찾기 조회 실패");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (fav: FavoriteItem) => {
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fav.restaurants.name,
          category: fav.restaurants.category,
          lat: fav.restaurants.lat,
          lng: fav.restaurants.lng,
          address: fav.restaurants.address,
          description: fav.restaurants.description,
        }),
      });
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
      <Header showBack />
      <main className="max-w-2xl mx-auto px-4 pt-10 pb-10">
        <div className="flex items-center gap-2 mb-8">
          <Heart size={24} className="text-red-500 fill-red-500" />
          <h2 className="text-lg font-bold text-gray-900">내 즐겨찾기</h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Heart size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg">아직 즐겨찾기가 없어요</p>
            <p className="text-sm mt-1">
              맛집 검색 결과에서 하트를 눌러 저장해 보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900">
                      {fav.restaurants.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={14} />
                      {fav.restaurants.address}
                    </p>
                    {fav.restaurants.description && (
                      <p className="text-xs text-gray-400 mt-1">
                        {fav.restaurants.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {fav.restaurants.image_url && (
                        <a
                          href={fav.restaurants.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          상세보기
                          <ExternalLink size={12} />
                        </a>
                      )}
                      <p className="text-xs text-gray-300">
                        {new Date(fav.created_at).toLocaleDateString("ko-KR")}에
                        저장
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-3">
                    <button
                      onClick={async () => {
                        const text = `${fav.restaurants.name} - ${fav.restaurants.address}`;
                        const url = fav.restaurants.image_url || "";
                        try {
                          if (navigator.share) {
                            await navigator.share({ title: fav.restaurants.name, text, url });
                          } else {
                            await navigator.clipboard.writeText(url || text);
                            alert("링크가 복사되었습니다!");
                          }
                        } catch {}
                      }}
                      className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                      aria-label="공유"
                    >
                      <Share2 size={16} className="text-gray-400 hover:text-blue-500" />
                    </button>
                    <button
                      onClick={() => removeFavorite(fav)}
                      className="p-2 rounded-full hover:bg-red-50 transition-colors"
                      aria-label="즐겨찾기 삭제"
                    >
                      <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
