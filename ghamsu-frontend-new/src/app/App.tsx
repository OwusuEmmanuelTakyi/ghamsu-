import { ThemeProvider } from 'next-themes';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Analytics } from "@vercel/analytics/react";
import { isSupabaseConfigured } from '../lib/supabase';
import { SiteUnavailable } from './components/SiteUnavailable';

export default function App() {
  if (!isSupabaseConfigured) {
    console.error('[config] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing, so the site cannot load its content.');
    return <SiteUnavailable />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <RouterProvider router={router} />
      <Analytics />

    </ThemeProvider>
  );
}
