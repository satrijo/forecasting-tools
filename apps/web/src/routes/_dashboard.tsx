import { createFileRoute } from "@tanstack/react-router";
import DashboardLayout from "@/layouts/dashboard";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});
