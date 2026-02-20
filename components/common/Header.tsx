"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogOut, ChevronLeft, Ban, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Logo from "./Logo";

interface HeaderProps {
  showBack?: boolean;
}

export default function Header({ showBack = false }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
          )}
          <Link href="/category">
            <Logo size="sm" />
          </Link>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/favorites"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="즐겨찾기"
          >
            <Heart size={20} className="text-gray-600" />
          </Link>
          <Link
            href="/reviews"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="내 기록"
          >
            <BookOpen size={20} className="text-gray-600" />
          </Link>
          <Link
            href="/blocked"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="차단 목록"
          >
            <Ban size={20} className="text-gray-600" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="로그아웃"
          >
            <LogOut size={20} className="text-gray-600" />
          </button>
        </nav>
      </div>
    </header>
  );
}
