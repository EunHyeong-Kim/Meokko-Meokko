"use client";

import RestaurantCard from "./RestaurantCard";
import { Restaurant } from "@/types";

interface RestaurantListProps {
  restaurants: Restaurant[];
  onSelect: (id: number) => void;
}

export default function RestaurantList({
  restaurants,
  onSelect,
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">검색 결과가 없어요</p>
        <p className="text-sm mt-1">다른 카테고리를 선택해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
