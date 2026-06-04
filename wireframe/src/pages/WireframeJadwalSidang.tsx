import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeCard } from '../components/WireframeCard'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeJadwalSidang() {
  return (
    <WireframeLayout role="jadwal" active="/jadwal" title="Jadwal Sidang" subtitle="Jadwal Sidang Tugas Akhir">
      <section className="card">
        <div className="toolbar">
          <p className="subtitle">Lihat jadwal sidang tugas akhir</p>
          <div className="row">
            <select className="select" style={{ width: 110 }}><option>2026</option></select>
            <select className="select" style={{ width: 140 }}><option>Gelombang I</option></select>
            <select className="select" style={{ width: 120 }}><option>Periode 1</option></select>
            <button className="button secondary">Preview</button>
            <button className="button">Download PDF</button>
          </div>
        </div>
      </section>

      <section className="section grid grid-4">
        <WireframeCard title="Total Sidang"><h2>2</h2></WireframeCard>
        <WireframeCard title="Mahasiswa"><h2>2</h2></WireframeCard>
        <WireframeCard title="Sesi Waktu"><h2>2</h2></WireframeCard>
        <WireframeCard title="Ruangan"><h2>3</h2></WireframeCard>
      </section>

      <section className="section card" style={{ padding: 0 }}>
        <div style={{ padding: 20, borderBottom: '1px solid #ccc', textAlign: 'center' }}>
          <PlaceholderBox width={72} height={48} label="Header jadwal" />
          <h2 className="section-title" style={{ marginTop: 12 }}>Jadwal Sidang Proposal Tugas Akhir</h2>
          <p className="subtitle">Sistem Informasi</p>
          <span className="status">Ganjil 2026 - 2027 / Periode 1</span>
        </div>

        <WireframeTable
          columns={['No', 'Tanggal', 'Waktu', 'Mahasiswa', 'Judul', 'Penguji', 'Ruang']}
          rows={[
            ['1', '12/06/2026', '09:00 - 10:00', 'Andhika - 2321053', 'Pengembangan Sistem Manajemen Tugas Akhir', '1. Penguji 1\n2. Penguji 2', 'B302'],
            ['2', '15/06/2026', '13:00 - 14:00', 'Dinda - 2221015', 'Analisis Sistem Informasi Akademik', '1. Penguji 1\n2. Penguji 2', 'B303'],
          ]}
        />

        <div className="toolbar" style={{ padding: 16, borderTop: '1px solid #ccc' }}>
          <p className="small muted">Menampilkan 2 jadwal sidang</p>
          <p className="small muted">* Jadwal dapat berubah sewaktu-waktu. Harap konfirmasi dengan prodi.</p>
        </div>
      </section>
    </WireframeLayout>
  )
}
