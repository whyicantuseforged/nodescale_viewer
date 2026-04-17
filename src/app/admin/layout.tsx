import { requireAdminPage } from "@/lib/admin";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminPage("/admin");

  return (
    <main style={{ maxWidth: 1280, margin: "32px auto" }} className="grid">
      <AdminNav />
      {children}
    </main>
  );
}
