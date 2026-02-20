"use client";

import { useEffect, useState } from "react";
import { BookOpen, Star, Trash2, Plus, MapPin } from "lucide-react";
import Header from "@/components/common/Header";

interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  menu: string;
  created_at: string;
  restaurants: {
    id: number;
    name: string;
    category: string;
    address: string;
    image_url: string;
  };
}

interface FavoriteItem {
  restaurants: {
    id: number;
    name: string;
    address: string;
    category: string;
    lat: number;
    lng: number;
    image_url: string;
  };
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          disabled={!onChange}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={20}
            className={
              s <= value
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [menu, setMenu] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch {}
    setLoading(false);
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.favorites) setFavorites(data.favorites);
    } catch {}
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openForm = () => {
    fetchFavorites();
    setSelectedRestaurantId(null);
    setRating(0);
    setComment("");
    setMenu("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantId || rating === 0) {
      alert("매장과 별점을 선택해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: selectedRestaurantId,
          rating,
          comment,
          menu,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setShowForm(false);
        fetchReviews();
      }
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    }
    setSaving(false);
  };

  const deleteReview = async (id: number) => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    try {
      await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
      <Header showBack />
      <main className="max-w-2xl mx-auto px-4 pt-10 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">내 기록</h2>
          </div>
          <button
            onClick={openForm}
            className="flex items-center gap-1 text-sm text-white bg-primary px-4 py-2 rounded-xl hover:bg-red-500 transition-colors"
          >
            <Plus size={16} />
            새 기록
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                매장 선택
              </label>
              {favorites.length === 0 ? (
                <p className="text-sm text-gray-400">
                  즐겨찾기에 저장된 매장이 없습니다. 먼저 맛집을 즐겨찾기에 추가해 주세요.
                </p>
              ) : (
                <select
                  value={selectedRestaurantId || ""}
                  onChange={(e) =>
                    setSelectedRestaurantId(Number(e.target.value) || null)
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                >
                  <option value="">매장을 선택하세요</option>
                  {favorites.map((f) => (
                    <option key={f.restaurants.id} value={f.restaurants.id}>
                      {f.restaurants.name} - {f.restaurants.address}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                별점
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                먹은 메뉴
              </label>
              <input
                type="text"
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                placeholder="예: 김치찌개, 제육볶음"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                한마디
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="맛은 어땠나요?"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg">아직 기록이 없어요</p>
            <p className="text-sm mt-1">
              방문한 맛집의 별점, 메뉴, 한마디를 기록해 보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900">
                      {review.restaurants.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={13} />
                      {review.restaurants.address}
                    </p>
                    <div className="mt-2">
                      <StarRating value={review.rating} />
                    </div>
                    {review.menu && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="text-gray-700">메뉴:</span>{" "}
                        {review.menu}
                      </p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-gray-700">한마디:</span>{" "}
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 mt-2">
                      {new Date(review.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors ml-3"
                    aria-label="기록 삭제"
                  >
                    <Trash2
                      size={18}
                      className="text-gray-400 hover:text-red-500"
                    />
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
