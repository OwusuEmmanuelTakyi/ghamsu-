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
const Activities = lazy(() => import('./pages/Activities'));
const ActivityDetail = lazy(() => import('./pages/ActivityDetail'));
const ExecutiveForm = lazy(() => import('./pages/ExecutiveForm'));
const Notfound = lazy(() => import('./pages/Notfound'));
// The admin dashboard is a separate chunk with its own layout.
const AdminApp = lazy(() => import('./admin/AdminApp'));

function AdminRoot() {
  return (
    <Suspense fallback={<PageLoader show={true} />}>
      <AdminApp />
    </Suspense>
  );
}

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
  // Outside the public Layout: no site navigation or footer.
  { path: '/admin/*', Component: AdminRoot },
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

      { path: 'boards/:slug', Component: BoardDetail },
      { path: 'activities', Component: Activities },
      { path: 'activities/:slug', Component: ActivityDetail },
      { path: 'executive-form/:token', Component: ExecutiveForm },
    ],
  },
]);
