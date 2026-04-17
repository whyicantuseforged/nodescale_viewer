import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 960, margin: "40px auto" }}>
      <div className="card grid">
        <div>
          <h1>Nodescale Viewer</h1>
          <p className="muted">
            카페24 주문과 외부 열람앱을 연결하는 관리자/뷰어 스캐폴드입니다.
            관리자 페이지에서는 상품, 샘플, CSV 업로드, Cafe24 연동 상태를 확인할 수 있습니다.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/login">로그인</Link>
          <Link href="/admin">관리자 대시보드</Link>
        </div>
      </div>
    </main>
  );
}
