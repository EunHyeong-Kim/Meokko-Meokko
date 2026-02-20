"use client";

import { useEffect, useState } from "react";
import { Ban, MapPin, RotateCcw } from "lucide-react";
import Header from "@/components/common/Header";

interface BlockedItem {
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

export default function BlockedPage() {
  const [blocked, setBlocked] = useState<BlockedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocked = async () => {
    try {
      const res = await fetch("/api/blocked");
      const data = await res.json();
      if (data.blocked) {
        setBlocked(data.blocked);
      }
    } catch {
      console.error("차단 목록 조회 실패");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const unblock = async (item: BlockedItem) => {
    try {
      await fetch("/api/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.restaurants.name,
          category: item.restaurants.category,
          lat: item.restaurants.lat,
          lng: item.restaurants.lng,
          address: item.restaurants.address,
          description: item.restaurants.description,
          place_url: item.restaurants.image_url,
        }),
      });
      setBlocked((prev) => prev.filter((b) => b.id !== item.id));
    } catch {
      alert("차단 해제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
      <Header showBack />
      <main className="max-w-2xl mx-auto px-4 pt-10 pb-10">
        <div className="flex items-center gap-2 mb-8">
          <Ban size={24} className="text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">차단 목록</h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blocked.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Ban size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg">차단한 맛집이 없어요</p>
            <p className="text-sm mt-1">
              검색 결과에서 &quot;다시 보지 않기&quot;를 누르면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {blocked.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900">
                      {item.restaurants.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={14} />
                      {item.restaurants.address}
                    </p>
                    <p className="text-xs text-gray-300 mt-2">
                      {new Date(item.created_at).toLocaleDateString("ko-KR")}에
                      차단
                    </p>
                  </div>
                  <button
                    onClick={() => unblock(item)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors ml-3"
                  >
                    <RotateCcw size={14} />
                    해제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
