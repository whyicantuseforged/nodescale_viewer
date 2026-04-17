import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <section className="card grid">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>愿由ъ옄 ?곹뭹 紐⑸줉</h1>
          <p className="muted">?섑뵆 愿由? CSV ?낅줈?? ?곹뭹 ?곹깭 ?먭?????怨녹뿉??吏꾪뻾?⑸땲??</p>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">?곹뭹紐?/th>
              <th align="left">肄붾뱶</th>
              <th align="left">遺꾨쪟</th>
              <th align="left">媛寃?/th>
              <th align="left">?댁슜 湲곌컙</th>
              <th align="left">?꾩껜 ??/th>
              <th align="left">?곹깭</th>
              <th align="left">?묒뾽</th>
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
                <td>{product.price.toLocaleString()}??/td>
                <td>{product.access_days}??/td>
                <td>{product.total_rows.toLocaleString()}</td>
                <td>{product.status}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/admin/products/${product.id}/samples`}>
                      ?섑뵆 愿由?                    </Link>
                    <Link href={`/admin/products/${product.id}/upload`}>
                      ?낅줈??                    </Link>
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
