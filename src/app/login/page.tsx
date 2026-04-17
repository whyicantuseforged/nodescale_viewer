import { Suspense } from "react";
import LoginPageClient from "@/app/login/login-page-client";

function LoginFallback() {
  return (
    <main style={{ maxWidth: 420, margin: "80px auto" }}>
      <div className="card grid">
        <div>
          <h1>Login</h1>
          <p className="muted">Loading the login page.</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}