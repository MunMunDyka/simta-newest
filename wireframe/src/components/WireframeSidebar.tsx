import { PlaceholderBox } from './PlaceholderBox'

export type SidebarRole = 'mahasiswa' | 'dosen' | 'admin' | 'jadwal'

const menuByRole: Record<SidebarRole, Array<{ label: string; href: string }>> = {
  mahasiswa: [
    { label: 'Dashboard', href: '/mahasiswa/dashboard' },
    { label: 'Bimbingan', href: '/mahasiswa/bimbingan' },
    { label: 'Jadwal Sidang', href: '/jadwal' },
  ],
  dosen: [
    { label: 'Dashboard', href: '/dosen/dashboard' },
    { label: 'Mahasiswa Bimbingan', href: '/dosen/list-mahasiswa' },
    { label: 'Jadwal Penguji', href: '/dosen/jadwal-penguji' },
    { label: 'Jadwal Sidang', href: '/jadwal' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Manajemen User', href: '/admin/manajemen-user' },
    { label: 'Manajemen Dosen', href: '/admin/manajemen-dosen' },
    { label: 'Kelola Bimbingan', href: '/admin/kelola-bimbingan' },
    { label: 'Kelola Jadwal', href: '/admin/kelola-jadwal' },
    { label: 'Laporan', href: '/admin/laporan' },
  ],
  jadwal: [
    { label: 'Dashboard Mahasiswa', href: '/mahasiswa/dashboard' },
    { label: 'Dashboard Dosen', href: '/dosen/dashboard' },
    { label: 'Jadwal Sidang', href: '/jadwal' },
  ],
}

type WireframeSidebarProps = {
  role: SidebarRole
  active?: string
}

export function WireframeSidebar({ role, active }: WireframeSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <PlaceholderBox width={44} height={44} />
        <div>
          <p className="sidebar-title">SIMTA</p>
          <p className="sidebar-caption">Wireframe Bab 4</p>
        </div>
      </div>

      <p className="sidebar-section">Menu</p>
      {menuByRole[role].map((item) => (
        <a key={item.href} className={`sidebar-link${active === item.href ? ' active' : ''}`} href={item.href}>
          {item.label}
        </a>
      ))}

      <p className="sidebar-section">Navigasi Wireframe</p>
      <a className="sidebar-link" href="/">
        Dashboard Wireframe
      </a>
    </aside>
  )
}
