import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-500">Loading...</p>}>
      <AdminDashboard />
    </Suspense>
  );
}
