"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Restaurant, Review } from "@/types";
import { CATEGORIES } from "@/constants/categories";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = Number(params.id);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: restData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (restData) setRestaurant(restData);

      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (reviewData) setReviews(reviewData);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("restaurant_id", restaurantId)
          .maybeSingle();

        setIsFavorite(!!favData);
      }

      setLoading(false);
    };

    fetchData();
  }, [restaurantId]);

  const toggleFavorite = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("restaurant_id", restaurantId);
      setIsFavorite(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, restaurant_id: restaurantId });
      setIsFavorite(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("링크가 클립보드에 복사되었습니다.");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인이 필요합니다.");
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        restaurant_id: restaurantId,
        user_id: user.id,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) {
      alert("리뷰 작성에 실패했습니다: " + error.message);
    } else if (data) {
      setReviews([data, ...reviews]);
      setComment("");
      setRating(5);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        식당 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.code === restaurant.category);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "--";

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="즐겨찾기"
            >
              <Heart
                size={20}
                className={
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                }
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="공유하기"
            >
              <Share2 size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* 식당 기본 정보 */}
        <div className="space-y-4">
          <div
            className="w-full h-48 rounded-2xl flex items-center justify-center text-5xl"
            style={{ backgroundColor: category?.bgColor || "#f3f4f6" }}
          >
            {category?.icon || "🍽️"}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: category?.color,
                  backgroundColor: category?.bgColor,
                }}
              >
                {category?.label}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {restaurant.name}
            </h1>
            <p className="text-gray-500 mt-1">{restaurant.address}</p>
            <p className="text-sm text-gray-600 mt-2">
              {restaurant.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500" fill="currentColor" />
              {avgRating} / 5.0
            </span>
            <span>리뷰 {reviews.length}개</span>
          </div>
        </div>

        <hr className="my-6 border-gray-100" />

        {/* 리뷰 작성 */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">리뷰 작성</h2>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                별점
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      size={24}
                      className={
                        star <= rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="맛, 분위기, 서비스 등 솔직한 리뷰를 남겨주세요."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-red-500 transition disabled:opacity-50 text-sm min-h-[48px]"
            >
              {submitting ? "등록 중..." : "리뷰 등록"}
            </button>
          </form>
        </section>

        <hr className="my-6 border-gray-100" />

        {/* 리뷰 목록 */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            리뷰 ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">
              아직 작성된 리뷰가 없습니다. 첫 리뷰를 남겨보세요!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl bg-gray-50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
