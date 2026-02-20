import Link from "next/link";
import Logo from "@/components/common/Logo";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="text-center space-y-6">
        <Logo size="lg" />
        <p className="text-gray-500 text-lg">오늘 뭐 먹지? 고민 끝!</p>
        <Link
          href="/login"
          className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-red-500 transition-colors text-lg"
        >
          시작하기
        </Link>
      </div>
    </main>
  );
}
