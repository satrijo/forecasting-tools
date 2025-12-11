import { createFileRoute } from "@tanstack/react-router";
import { PublicWeatherPage } from "@/features/public-weather";

export const Route = createFileRoute("/_dashboard/dashboard/public")({
  component: PublicWeatherPage,
});
