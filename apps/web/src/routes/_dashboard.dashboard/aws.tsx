import { createFileRoute } from "@tanstack/react-router";
import { AWSPage } from "@/features/aws";

export const Route = createFileRoute("/_dashboard/dashboard/aws")({
  component: AWSPage,
});
