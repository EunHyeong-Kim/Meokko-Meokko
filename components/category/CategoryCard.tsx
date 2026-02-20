import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  onClick: (code: string) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={() => onClick(category.code)}
      className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 bg-white hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <span className="text-4xl">{category.icon}</span>
      <span className="text-gray-900">{category.label}</span>
    </button>
  );
}
