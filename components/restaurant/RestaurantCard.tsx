import { Star, MapPin } from "lucide-react";
import { Restaurant } from "@/types";
import { CATEGORIES } from "@/constants/categories";

interface RestaurantCardProps {
  restaurant: Restaurant;
  distance?: string;
  onClick: (id: number) => void;
}

export default function RestaurantCard({
  restaurant,
  distance,
  onClick,
}: RestaurantCardProps) {
  const category = CATEGORIES.find((c) => c.code === restaurant.category);

  return (
    <button
      onClick={() => onClick(restaurant.id)}
      className="w-full text-left p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex gap-4">
        <div
          className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl"
          style={{ backgroundColor: category?.bgColor || "#f3f4f6" }}
        >
          {category?.icon || "🍽️"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 truncate">
            {restaurant.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 truncate">
            {restaurant.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span
              className="font-medium px-2 py-0.5 rounded-full text-xs"
              style={{
                color: category?.color,
                backgroundColor: category?.bgColor,
              }}
            >
              {category?.label}
            </span>
            {distance && (
              <span className="flex items-center gap-1 text-gray-400">
                <MapPin size={12} />
                {distance}
              </span>
            )}
            <span className="flex items-center gap-1 text-yellow-500">
              <Star size={12} fill="currentColor" />
              --
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
