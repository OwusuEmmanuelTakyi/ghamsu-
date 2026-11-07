// The admin dashboard. Loaded as its own chunk (see routes.tsx), so none of this
// code, nor the editor libraries, reaches people visiting the public site.
import { useEffect } from 'react'
import { Link, Route, Routes } from 'react-router'
import { Toaster } from '../components/ui/sonner'
import { AuthProvider } from './auth'
import { AdminLayout } from './AdminLayout'
import { ForgotPasswordPage, LoginPage, RequireAdmin, RequireStaff, ResetPasswordPage } from './pages/AuthPages'
import { Dashboard } from './pages/Dashboard'
import { PostForm } from './pages/PostForm'
import { Registrations } from './pages/Registrations'
import { ResourceForm } from './pages/ResourceForm'
import { ResourceList } from './pages/ResourceList'
import { SiteSettings } from './pages/SiteSettings'
import { Users } from './pages/Users'
import { ALL_RESOURCES, type ResourceConfig } from './resources'

/**
 * Keeps search engines away from every admin page. index.html already has a
 * robots tag ("index, follow"), so that tag is switched rather than a second
 * one added, which would contradict it. It is restored on leaving the admin.
 */
function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const created = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    const previousContent = meta.content
    meta.content = 'noindex, nofollow'
    const previousTitle = document.title
    document.title = 'Admin · GHAMSU'
    return () => {
      if (created) meta!.remove()
      else meta!.content = previousContent
      document.title = previousTitle
    }
  }, [])
}

const relative = (config: ResourceConfig) => config.path.replace(/^\/admin\//, '')

function guard(config: ResourceConfig, element: JSX.Element) {
  return config.adminOnly ? <RequireAdmin>{element}</RequireAdmin> : element
}

export default function AdminApp() {
  useNoIndex()

  return (
    <AuthProvider>
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route element={<RequireStaff><AdminLayout /></RequireStaff>}>
          <Route index element={<Dashboard />} />
          {ALL_RESOURCES.map((config) => [
            <Route key={`${config.key}-list`} path={relative(config)} element={guard(config, <ResourceList config={config} />)} />,
            <Route
              key={`${config.key}-form`}
              path={`${relative(config)}/:id`}
              element={guard(config, config.customForm ? <PostForm /> : <ResourceForm config={config} />)}
            />,
          ])}
          <Route path="activities/:id/registrations" element={<Registrations />} />
          <Route path="settings" element={<RequireAdmin><SiteSettings /></RequireAdmin>} />
          <Route path="users" element={<RequireAdmin><Users /></RequireAdmin>} />
          <Route path="*" element={
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Page not found. <Link to="/admin" className="text-primary underline">Back to the dashboard</Link>
            </div>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
