import { createBrowserRouter, Outlet, useNavigation } from 'react-router';
import { lazy, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { BackToTop } from './components/BackToTop';
import { PageLoader } from './components/PageLoader';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Events = lazy(() => import('./pages/Events'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Sermons = lazy(() => import('./pages/Sermons'));
const Boards = lazy(() => import('./pages/Boards'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Partner = lazy(() => import('./pages/Partner'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const BoardDetail = lazy(() => import('./pages/BoardDetail'));
const Notfound = lazy(() => import('./pages/Notfound'));

function Layout() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';

  return (
    <div className="min-h-screen bg-background">
      <PageLoader show={isLoading} />
      <ScrollToTop />
      <Navigation />
      <main>
        <Suspense fallback={<PageLoader show={true} />}>
          <Outlet />
        </Suspense>
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
      { path: '*', Component: Notfound },
      { path: 'blogs/:slug', Component: BlogDetail },

      { path: 'boards/:slug', Component: BoardDetail }
    ],
  },
]);
