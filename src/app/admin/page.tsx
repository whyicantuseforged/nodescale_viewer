import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const { metrics, recentUploads, recentPayments } = await getAdminDashboardData();

  return (
    <div className="grid">
      <section className="card grid">
        <div>
          <h1>관리자 대시보드</h1>
          <p className="muted">
            상품 상태, CSV 업로드 결과, 최근 결제 흐름을 한 화면에서 확인합니다.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="card">
              <div className="muted">{metric.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{metric.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "1.1fr 0.9fr",
        }}
      >
        <div className="card grid">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>최근 업로드</h2>
            <Link href="/admin/products">상품 관리</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">파일명</th>
                  <th align="left">상태</th>
                  <th align="left">전체 행</th>
                  <th align="left">성공</th>
                  <th align="left">실패</th>
                  <th align="left">업로드 시각</th>
                </tr>
              </thead>
              <tbody>
                {(recentUploads ?? []).map((job) => (
                  <tr key={job.id}>
                    <td>{job.file_name}</td>
                    <td>{job.status}</td>
                    <td>{job.total_rows}</td>
                    <td>{job.success_rows}</td>
                    <td>{job.failed_rows}</td>
                    <td>{new Date(job.created_at).toLocaleString("ko-KR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card grid">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>최근 결제</h2>
            <Link href="/admin/access">구매/권한 보기</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">주문번호</th>
                  <th align="left">금액</th>
                  <th align="left">상태</th>
                  <th align="left">시각</th>
                </tr>
              </thead>
              <tbody>
                {(recentPayments ?? []).map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.order_id}</td>
                    <td>{payment.amount.toLocaleString()}원</td>
                    <td>{payment.status}</td>
                    <td>
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleString("ko-KR")
                        : new Date(payment.created_at).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
