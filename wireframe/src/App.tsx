import { WireframeAssignDospemAdmin } from './pages/WireframeAssignDospemAdmin'
import { WireframeBimbinganMahasiswa } from './pages/WireframeBimbinganMahasiswa'
import { WireframeDashboard } from './pages/WireframeDashboard'
import { WireframeDashboardAdmin } from './pages/WireframeDashboardAdmin'
import { WireframeDashboardDosen } from './pages/WireframeDashboardDosen'
import { WireframeDashboardMahasiswa } from './pages/WireframeDashboardMahasiswa'
import { WireframeJadwalSidang } from './pages/WireframeJadwalSidang'
import { WireframeKelolaJadwalAdmin } from './pages/WireframeKelolaJadwalAdmin'
import { WireframeListMahasiswaBimbingan } from './pages/WireframeListMahasiswaBimbingan'
import { WireframeLogin } from './pages/WireframeLogin'
import { WireframeManajemenUserAdmin } from './pages/WireframeManajemenUserAdmin'
import { WireframeReviewBimbinganDosen } from './pages/WireframeReviewBimbinganDosen'

const routes: Record<string, JSX.Element> = {
  '/': <WireframeDashboard />,
  '/login': <WireframeLogin />,
  '/mahasiswa/dashboard': <WireframeDashboardMahasiswa />,
  '/mahasiswa/bimbingan': <WireframeBimbinganMahasiswa />,
  '/dosen/dashboard': <WireframeDashboardDosen />,
  '/dosen/list-mahasiswa': <WireframeListMahasiswaBimbingan />,
  '/dosen/review': <WireframeReviewBimbinganDosen />,
  '/admin/dashboard': <WireframeDashboardAdmin />,
  '/admin/manajemen-user': <WireframeManajemenUserAdmin />,
  '/admin/assign-dospem': <WireframeAssignDospemAdmin />,
  '/admin/kelola-jadwal': <WireframeKelolaJadwalAdmin />,
  '/jadwal': <WireframeJadwalSidang />,
}

export default function App() {
  const pathname = window.location.pathname
  return routes[pathname] ?? <WireframeDashboard />
}
