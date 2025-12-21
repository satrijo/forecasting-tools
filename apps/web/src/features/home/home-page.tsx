// import { Link } from "@tanstack/react-router";
import { useTitle } from "@/hooks";
import { Hero } from "@/features/home/hero";
import { Warnings } from "@/features/home/warnings";
import News from "./news";
import Services from "./services";
import MapSection from "./Map";
import Analysis from "./analysis";
import Stats from "./stats";

export function HomePage() {
  useTitle("Beranda");

  return (
    <>
      <Hero />
      <Warnings />
      <News />
      <Services />
      <MapSection />
      <Analysis />
      <Stats />
    </>
  );
}
