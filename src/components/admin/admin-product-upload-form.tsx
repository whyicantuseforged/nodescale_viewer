"use client";

import { useState } from "react";

export function AdminProductUploadForm({ productId }: { productId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"REPLACE" | "APPEND">("REPLACE");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setMessage("CSV 파일을 선택해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    const response = await fetch(`/api/admin/products/${productId}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message ?? "업로드에 실패했습니다.");
      setLoading(false);
      return;
    }

    setMessage(
      `업로드 완료: 전체 ${data.totalRows}건, 성공 ${data.successRows}건, 실패 ${data.failedRows}건`,
    );
    setLoading(false);
  }

  return (
    <section className="card grid">
      <div>
        <h2>CSV 업로드</h2>
        <p className="muted">
          업로드가 완료되면 상품 상태를 READY로 바꾸고, 검수 후 PUBLISHED로 전환해서 사용하면 됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as "REPLACE" | "APPEND")}
        >
          <option value="REPLACE">REPLACE - 기존 데이터를 전부 교체</option>
          <option value="APPEND">APPEND - 기존 데이터 뒤에 추가</option>
        </select>

        <div className="grid" style={{ gap: 8 }}>
          <p style={{ margin: 0 }}>
            CSV 헤더 예시: row_no는 서버가 자동으로 부여합니다.
          </p>
          <code style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            country,company_name,website_url,phone,email,facebook,instagram,other_social,linkedin,
            website_present,phone_present,email_present,has_any_contact_channel,sellable_status,
            review_reason,product_grade,duplicate_group_id,duplicate_group_size
          </code>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "업로드 중..." : "업로드 실행"}
        </button>
      </form>

      {message ? <p>{message}</p> : null}
    </section>
  );
}
