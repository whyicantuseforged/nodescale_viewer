"use client";

import { useMemo, useState } from "react";

interface SampleRow {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  job_title: string | null;
  country: string | null;
  city: string | null;
  email_masked: string | null;
  phone_masked: string | null;
  website: string | null;
  row_order: number;
}

interface SampleFormState {
  company_name: string;
  contact_name: string;
  job_title: string;
  country: string;
  city: string;
  email_masked: string;
  phone_masked: string;
  website: string;
  row_order: string;
}

const EMPTY_FORM: SampleFormState = {
  company_name: "",
  contact_name: "",
  job_title: "",
  country: "",
  city: "",
  email_masked: "",
  phone_masked: "",
  website: "",
  row_order: "1",
};

function toFormState(sample?: SampleRow): SampleFormState {
  if (!sample) return EMPTY_FORM;
  return {
    company_name: sample.company_name ?? "",
    contact_name: sample.contact_name ?? "",
    job_title: sample.job_title ?? "",
    country: sample.country ?? "",
    city: sample.city ?? "",
    email_masked: sample.email_masked ?? "",
    phone_masked: sample.phone_masked ?? "",
    website: sample.website ?? "",
    row_order: String(sample.row_order ?? 1),
  };
}

export function AdminSamplesManager({
  productId,
  initialSamples,
}: {
  productId: string;
  initialSamples: SampleRow[];
}) {
  const [samples, setSamples] = useState<SampleRow[]>(initialSamples);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SampleFormState>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  function updateField(name: keyof SampleFormState, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      row_order: String(samples.length + 1),
    });
    setMessage("");
  }

  function startEdit(sample: SampleRow) {
    setEditingId(sample.id);
    setForm(toFormState(sample));
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      company_name: form.company_name,
      contact_name: form.contact_name,
      job_title: form.job_title,
      country: form.country,
      city: form.city,
      email_masked: form.email_masked,
      phone_masked: form.phone_masked,
      website: form.website,
      row_order: Number(form.row_order),
    };

    const response = await fetch(
      editingId
        ? `/api/admin/samples/${editingId}`
        : `/api/admin/products/${productId}/samples`,
      {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingId ? payload : { ...payload, productId }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message ?? "샘플 저장에 실패했습니다.");
      setLoading(false);
      return;
    }

    if (editingId) {
      setSamples((prev) =>
        prev
          .map((sample) => (sample.id === editingId ? data.item : sample))
          .sort((a, b) => a.row_order - b.row_order),
      );
      setMessage("샘플을 수정했습니다.");
    } else {
      setSamples((prev) =>
        [...prev, data.item].sort((a, b) => a.row_order - b.row_order),
      );
      setMessage("샘플을 등록했습니다.");
    }

    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoading(false);
  }

  async function handleDelete(sampleId: string) {
    if (!confirm("이 샘플을 삭제할까요?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/admin/samples/${sampleId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message ?? "샘플 삭제에 실패했습니다.");
      setLoading(false);
      return;
    }

    setSamples((prev) => prev.filter((sample) => sample.id !== sampleId));
    setMessage("샘플을 삭제했습니다.");
    setLoading(false);
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
      <section className="card grid">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h2>샘플 목록</h2>
            <p className="muted">
              상품 상세 페이지에 노출할 샘플을 등록하거나 수정합니다.
            </p>
          </div>
          <button type="button" onClick={startCreate}>
            새 샘플
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">순서</th>
                <th align="left">회사명</th>
                <th align="left">국가</th>
                <th align="left">이메일</th>
                <th align="left">전화</th>
                <th align="left">작업</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample) => (
                <tr key={sample.id}>
                  <td>{sample.row_order}</td>
                  <td>{sample.company_name}</td>
                  <td>{sample.country}</td>
                  <td>{sample.email_masked}</td>
                  <td>{sample.phone_masked}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => startEdit(sample)}>
                        수정
                      </button>
                      <button type="button" onClick={() => handleDelete(sample.id)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {samples.length === 0 ? (
                <tr>
                  <td colSpan={6}>등록된 샘플이 없습니다.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card grid">
        <div>
          <h2>{isEditing ? "샘플 수정" : "샘플 등록"}</h2>
          <p className="muted">
            샘플은 실제 데이터를 마스킹한 형태로 구성하는 것을 권장합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid">
          <input
            value={form.company_name}
            onChange={(e) => updateField("company_name", e.target.value)}
            placeholder="회사명"
            required
          />
          <input
            value={form.contact_name}
            onChange={(e) => updateField("contact_name", e.target.value)}
            placeholder="담당자"
          />
          <input
            value={form.job_title}
            onChange={(e) => updateField("job_title", e.target.value)}
            placeholder="직무"
          />
          <input
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="국가"
            required
          />
          <input
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="도시"
          />
          <input
            value={form.email_masked}
            onChange={(e) => updateField("email_masked", e.target.value)}
            placeholder="마스킹 이메일"
          />
          <input
            value={form.phone_masked}
            onChange={(e) => updateField("phone_masked", e.target.value)}
            placeholder="마스킹 전화번호"
          />
          <input
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="웹사이트"
          />
          <input
            type="number"
            value={form.row_order}
            onChange={(e) => updateField("row_order", e.target.value)}
            placeholder="노출 순서"
            required
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" disabled={loading}>
              {loading ? "저장 중..." : isEditing ? "수정 저장" : "샘플 등록"}
            </button>
            {isEditing ? (
              <button type="button" onClick={startCreate}>
                새 등록으로 전환
              </button>
            ) : null}
          </div>
        </form>

        {message ? <p>{message}</p> : null}
      </section>
    </div>
  );
}
