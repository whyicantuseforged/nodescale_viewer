import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { metrics, recentUploads, recentPayments } = await getAdminDashboardData();

  return (
    <div className="grid">
      <section className="card grid">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Review product status, CSV upload results, and recent payments in one place.
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
            <h2>Recent Uploads</h2>
            <Link href="/admin/products">Manage Products</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">File</th>
                  <th align="left">Status</th>
                  <th align="left">Rows</th>
                  <th align="left">Success</th>
                  <th align="left">Failed</th>
                  <th align="left">Created</th>
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
            <h2>Recent Payments</h2>
            <Link href="/admin/access">View Access</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Order ID</th>
                  <th align="left">Amount</th>
                  <th align="left">Status</th>
                  <th align="left">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {(recentPayments ?? []).map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.order_id}</td>
                    <td>{payment.amount.toLocaleString()} KRW</td>
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