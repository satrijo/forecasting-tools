import { Outlet } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/shell";
import { Devtools } from "@/components/dev";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Devtools />
    </div>
  );
}
