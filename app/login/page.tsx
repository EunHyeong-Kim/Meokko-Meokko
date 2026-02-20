"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/common/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname: nickname || email.split("@")[0] },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/location");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/location");
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-rose-50 px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <Logo size="lg" />
        </div>

        {/* 카카오 로그인 */}
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-normal py-3 rounded-xl hover:brightness-95 transition min-h-[48px]"
        >
          카카오로 시작하기
        </button>

        {/* 구분선 */}
        <div className="relative flex items-center">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-4 text-xs text-gray-400">또는 이메일로</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* 이메일 로그인/회원가입 */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isSignUp && (
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="머꼬머꼬에서 사용할 이름"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-normal text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-normal text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-normal py-3 rounded-xl hover:bg-red-500 transition disabled:opacity-50 min-h-[48px]"
          >
            {loading
              ? "처리 중..."
              : isSignUp
                ? "회원가입"
                : "로그인"}
          </button>
        </form>

        <div className="text-sm text-gray-500">
          {isSignUp ? (
            <p>
              이미 계정이 있으신가요?{" "}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className="text-primary font-normal hover:underline"
              >
                로그인
              </button>
            </p>
          ) : (
            <p>
              아직 계정이 없으신가요?{" "}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setError("");
                }}
                className="text-primary font-normal hover:underline"
              >
                회원가입
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
