import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { AboutPage } from "./pages/AboutPage";
import { BlogsPage } from "./pages/BlogsPage";
import { EventsPage } from "./pages/EventsPage";
import { SermonsPage } from "./pages/SermonsPage";
import { MinistriesPage } from "./pages/MinistriesPage";
import { GalleryPage } from "./pages/GalleryPage";
import { TestimonialsPage } from "./pages/TestimonialsPage";
import { ContactPage } from "./pages/ContactPage";
import { BlogListPage } from "./components/blog/BlogListPage";
import { BlogDetailPage } from "./components/blog/BlogDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: AboutPage },
      { path: "blogs", Component: BlogsPage },
      { path: "events", Component: EventsPage },
      { path: "sermons", Component: SermonsPage },
      { path: "ministries", Component: MinistriesPage },
      { path: "departments", Component: MinistriesPage }, // Redirect old URL
      { path: "gallery", Component: GalleryPage },
      { path: "testimonials", Component: TestimonialsPage },
      { path: "contact", Component: ContactPage },
      { path: "blog", Component: BlogListPage },
      { path: "blog/:slug", Component: BlogDetailPage },
    ],
  },
]);
