"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail } from "@/lib/auth-client";

export default function LoginPageClient() {
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
          <h1>{adminMode ? "Admin Login" : "Login"}</h1>
          <p className="muted">
            {adminMode
              ? "Sign in with an admin account to access /admin routes."
              : "Sign in with the same email you used for purchase to link your access pass."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message ? <p style={{ color: "crimson" }}>{message}</p> : null}
      </div>
    </main>
  );
}