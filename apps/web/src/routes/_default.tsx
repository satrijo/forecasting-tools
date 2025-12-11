import { createFileRoute } from "@tanstack/react-router";
import DefaultLayout from "@/layouts/default";

export const Route = createFileRoute("/_default")({
  component: DefaultLayout,
});
