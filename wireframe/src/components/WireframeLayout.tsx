import type { ReactNode } from 'react'
import { PlaceholderBox } from './PlaceholderBox'
import { WireframeSidebar, type SidebarRole } from './WireframeSidebar'

type WireframeLayoutProps = {
  role: SidebarRole
  active?: string
  title: string
  subtitle?: string
  children: ReactNode
}

export function WireframeLayout({ role, active, title, subtitle, children }: WireframeLayoutProps) {
  return (
    <div className="wireframe-shell">
      <WireframeSidebar role={role} active={active} />
      <main className="wireframe-main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
          <div className="row">
            <span className="small muted">User Aktif</span>
            <PlaceholderBox width={42} height={42} circle label="U" />
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
