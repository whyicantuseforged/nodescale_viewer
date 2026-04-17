import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { metrics, recentUploads, recentPayments } = await getAdminDashboardData();

  return (
    <div className="grid">
      <section className="card grid">
        <div>
          <h1>愿由ъ옄 ??쒕낫??/h1>
          <p className="muted">
            ?곹뭹 ?곹깭, CSV ?낅줈??寃곌낵, 理쒓렐 寃곗젣 ?먮쫫?????붾㈃?먯꽌 ?뺤씤?⑸땲??
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
            <h2>理쒓렐 ?낅줈??/h2>
            <Link href="/admin/products">?곹뭹 愿由?/Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">?뚯씪紐?/th>
                  <th align="left">?곹깭</th>
                  <th align="left">?꾩껜 ??/th>
                  <th align="left">?깃났</th>
                  <th align="left">?ㅽ뙣</th>
                  <th align="left">?낅줈???쒓컖</th>
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
            <h2>理쒓렐 寃곗젣</h2>
            <Link href="/admin/access">援щℓ/沅뚰븳 蹂닿린</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">二쇰Ц踰덊샇</th>
                  <th align="left">湲덉븸</th>
                  <th align="left">?곹깭</th>
                  <th align="left">?쒓컖</th>
                </tr>
              </thead>
              <tbody>
                {(recentPayments ?? []).map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.order_id}</td>
                    <td>{payment.amount.toLocaleString()}??/td>
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
