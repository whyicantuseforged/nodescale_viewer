import Link from "next/link";

export function AdminNav() {
  const items = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/products", label: "상품" },
    { href: "/admin/access", label: "구매/권한" },
    { href: "/admin/integrations", label: "Cafe24 연동" },
  ];

  return (
    <nav
      className="card"
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
