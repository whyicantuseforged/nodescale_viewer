import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <section className="card grid">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Admin Products</h1>
          <p className="muted">
            Review samples, CSV uploads, and current product status from one page.
          </p>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Title</th>
              <th align="left">Code</th>
              <th align="left">Category</th>
              <th align="left">Price</th>
              <th align="left">Access Days</th>
              <th align="left">Rows</th>
              <th align="left">Status</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.code}</td>
                <td>
                  {product.region} / {product.sector} / {product.category}
                </td>
                <td>{product.price.toLocaleString()} KRW</td>
                <td>{product.access_days} days</td>
                <td>{product.total_rows.toLocaleString()}</td>
                <td>{product.status}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/admin/products/${product.id}/samples`}>Samples</Link>
                    <Link href={`/admin/products/${product.id}/upload`}>Upload</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}