// import { Link } from "@tanstack/react-router";
import { useTitle } from "@/hooks";
import { Hero } from "@/features/home/hero";
import { Warnings } from "@/features/home/warnings";

export function HomePage() {
  useTitle("Beranda");

  return (
    <>
      <Hero />
      <Warnings />
    </>
  );
}
