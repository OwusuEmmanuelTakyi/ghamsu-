import { Outlet } from "react-router";
import { Navigation } from "./Navigation";
import { ScrollToTop } from "./ScrollToTop";

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <ScrollToTop />
    </div>
  );
}