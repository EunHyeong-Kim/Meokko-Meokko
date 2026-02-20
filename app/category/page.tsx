"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/common/Header";
import CategoryCard from "@/components/category/CategoryCard";
import { CATEGORIES } from "@/constants/categories";

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const location = searchParams.get("location");

  if (!lat || !lng) {
    router.replace("/location");
    return null;
  }

  const handleCategoryClick = (code: string) => {
    const params = new URLSearchParams();
    params.set("category", code);
    if (lat) params.set("lat", lat);
    if (lng) params.set("lng", lng);
    if (location) params.set("location", location);
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-10 pb-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">오늘 뭐 땡겨?</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.code}
              category={cat}
              onClick={handleCategoryClick}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/location")}
            className="text-sm text-gray-400 hover:text-primary transition-colors"
          >
            위치 다시 설정하기
          </button>
        </div>
      </main>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
