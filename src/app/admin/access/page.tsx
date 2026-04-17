import { getAdminAccessData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

interface AccessPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function AdminAccessPage({ searchParams }: AccessPageProps) {
  const { q } = await searchParams;
  const { filteredPayments, filteredPasses, profileMap, productMap } =
    await getAdminAccessData(q);

  return (
    <div className="grid">
      <section className="card grid">
        <div>
          <h1>Payments and Access</h1>
          <p className="muted">
            Search payments and access passes by user, order ID, or product.
          </p>
        </div>

        <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by email, name, order ID, or product code"
            style={{ maxWidth: 360 }}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <section className="card grid">
        <h2>Recent Payments</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">User</th>
                <th align="left">Product</th>
                <th align="left">Order ID</th>
                <th align="left">Amount</th>
                <th align="left">Status</th>
                <th align="left">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const profile = profileMap.get(payment.user_id);
                const product = productMap.get(payment.product_id);

                return (
                  <tr key={payment.id}>
                    <td>{profile?.email ?? profile?.name ?? payment.user_id}</td>
                    <td>{product?.title ?? product?.code ?? payment.product_id}</td>
                    <td>{payment.order_id}</td>
                    <td>{payment.amount.toLocaleString()} KRW</td>
                    <td>{payment.status}</td>
                    <td>
                      {(payment.paid_at ?? payment.created_at) &&
                        new Date(payment.paid_at ?? payment.created_at).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card grid">
        <h2>Access Passes</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">User</th>
                <th align="left">Product</th>
                <th align="left">Start</th>
                <th align="left">End</th>
                <th align="left">Status</th>
                <th align="left">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {filteredPasses.map((pass) => {
                const profile = profileMap.get(pass.user_id);
                const product = productMap.get(pass.product_id);
                const end = new Date(pass.access_end_at);
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                );

                return (
                  <tr key={pass.id}>
                    <td>{profile?.email ?? profile?.name ?? pass.user_id}</td>
                    <td>{product?.title ?? product?.code ?? pass.product_id}</td>
                    <td>{new Date(pass.access_start_at).toLocaleString("ko-KR")}</td>
                    <td>{new Date(pass.access_end_at).toLocaleString("ko-KR")}</td>
                    <td>{pass.status}</td>
                    <td>{daysRemaining} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}