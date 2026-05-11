import { createBrowserRouter, Outlet } from 'react-router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { BackToTop } from './components/BackToTop';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Blogs from './pages/Blogs';
import Sermons from './pages/Sermons';
import Boards from './pages/Boards';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Partner from './pages/Partner';
import BlogDetail from './pages/BlogDetail';
import BoardDetail from './pages/BoardDetail';
import Notfound from './pages/Notfound';

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'events', Component: Events },
      { path: 'blogs', Component: Blogs },
      { path: 'sermons', Component: Sermons },
      { path: 'boards', Component: Boards },
      { path: 'gallery', Component: Gallery },
      { path: 'contact', Component: Contact },
      { path: 'partner', Component: Partner },
      {path: '*', Component: Notfound },
      { path: 'blogs/:slug', Component: BlogDetail },

      {path: 'boards/:slug', Component: BoardDetail }
    ],
  },
]);
