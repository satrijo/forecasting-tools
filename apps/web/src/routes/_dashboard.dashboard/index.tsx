import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/features/dashboard";

export const Route = createFileRoute("/_dashboard/dashboard/")({
  component: OverviewPage,
});
