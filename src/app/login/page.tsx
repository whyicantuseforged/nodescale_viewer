"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const adminMode = next.startsWith("/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto" }}>
      <div className="card grid">
        <div>
          <h1>{adminMode ? "관리자 로그인" : "로그인"}</h1>
          <p className="muted">
            {adminMode
              ? "관리자 권한이 있는 계정으로 로그인해야 /admin 경로에 접근할 수 있습니다."
              : "Cafe24에서 구매한 이메일과 같은 계정으로 로그인하면 이용권 연결이 자동으로 처리됩니다."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {message ? <p style={{ color: "crimson" }}>{message}</p> : null}
      </div>
    </main>
  );
}
