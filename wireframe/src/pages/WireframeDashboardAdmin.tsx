import { WireframeCard } from '../components/WireframeCard'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeDashboardAdmin() {
  return (
    <WireframeLayout role="admin" active="/admin/dashboard" title="Dashboard Admin" subtitle="Ringkasan data utama SIMTA">
      <section className="grid grid-4">
        <WireframeCard title="Total Mahasiswa">
          <h2>120</h2>
          <p className="small">Mahasiswa aktif</p>
        </WireframeCard>
        <WireframeCard title="Total Dosen">
          <h2>18</h2>
          <p className="small">Dosen pembimbing</p>
        </WireframeCard>
        <WireframeCard title="Data Bimbingan">
          <h2>245</h2>
          <p className="small">Riwayat bimbingan</p>
        </WireframeCard>
        <WireframeCard title="Jadwal Sidang">
          <h2>8</h2>
          <p className="small">Jadwal aktif</p>
        </WireframeCard>
      </section>

      <section className="section grid grid-2">
        <WireframeCard title="Aksi Cepat">
          <div className="stack">
            <a className="button secondary" href="/admin/manajemen-user">Kelola User</a>
            <a className="button secondary" href="/admin/assign-dospem">Assign Dospem</a>
            <a className="button secondary" href="/admin/kelola-jadwal">Kelola Jadwal</a>
          </div>
        </WireframeCard>
        <WireframeCard title="Ringkasan Aktivitas">
          <WireframeTable
            columns={['Aktivitas', 'User', 'Waktu']}
            rows={[
              ['Mahasiswa upload bimbingan', 'Andhika', 'Hari ini'],
              ['Dosen memberikan feedback', 'Alvendo', 'Kemarin'],
              ['Admin membuat jadwal sidang', 'Admin', '2 hari lalu'],
            ]}
          />
        </WireframeCard>
      </section>
    </WireframeLayout>
  )
}
