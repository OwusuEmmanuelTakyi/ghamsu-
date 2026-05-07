import { ThemeProvider } from 'next-themes';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <RouterProvider router={router} />
      <Analytics />

    </ThemeProvider>
  );
}