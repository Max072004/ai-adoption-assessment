import { EmployeeForm } from "@/components/employee-form";
import { buildAssessmentOrder } from "@/lib/assessment";

// Rendered per request so every employee is served a freshly shuffled paper.
// The order is computed on the server and passed down as a prop, so the
// server HTML and the client hydration always agree.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <EmployeeForm order={buildAssessmentOrder()} />;
}
