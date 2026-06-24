import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeJadwalPenguji() {
  return (
    <WireframeLayout
      role="dosen"
      active="/dosen/jadwal-penguji"
      title="Jadwal Sidang Penguji"
      subtitle="Daftar seluruh jadwal ujian mahasiswa yang Anda uji, diurutkan berdasarkan urgensi waktu"
    >
      <section className="section card">
        <div className="toolbar">
          <p className="subtitle" style={{ margin: 0 }}>Petunjuk status jadwal penguji</p>
          <div className="row">
            <span className="status">Hari ini</span>
            <span className="status">Mendekati &lt;= 7 hari</span>
            <span className="status">Selesai</span>
          </div>
        </div>
      </section>

      <section className="section card" style={{ padding: 0 }}>
        <WireframeTable
          columns={['Tanggal & Waktu', 'Mahasiswa', 'Judul TA', 'Jenis Sidang', 'Ruangan', 'Status']}
          rows={[
            ['Jum, 12 Jun 2026\n09:00 - 10:00', 'Andhika Laksmana\n2321053', 'Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web', 'Seminar Proposal', 'B302', <span className="status">Hari ini</span>],
            ['Sen, 15 Jun 2026\n13:00 - selesai', 'Dinda Putri\n2221015', 'Analisis Sistem Informasi Akademik', 'Sidang Akhir', 'B303', <span className="status">Mendekati</span>],
            ['Rab, 20 Mei 2026\n10:00 - 11:00', 'Pincen\n22012139', 'Perancangan Aplikasi Bimbingan', 'Seminar Hasil', 'B304', <span className="status">Selesai</span>],
          ]}
        />
      </section>
    </WireframeLayout>
  )
}
