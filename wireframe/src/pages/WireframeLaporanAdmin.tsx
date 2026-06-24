import { WireframeCard } from '../components/WireframeCard'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeLaporanAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/laporan"
      title="Laporan Progress Bimbingan"
      subtitle="Monitor progress bimbingan semua mahasiswa"
    >
      <section className="grid grid-4">
        <WireframeCard title="Total Mahasiswa"><h2>120</h2><p className="small">Semua peserta TA</p></WireframeCard>
        <WireframeCard title="Syarat Terpenuhi"><h2>32</h2><p className="small">Siap sidang</p></WireframeCard>
        <WireframeCard title="Sebagian Terpenuhi"><h2>18</h2><p className="small">Satu dospem cukup</p></WireframeCard>
        <WireframeCard title="Belum Cukup"><h2>70</h2><p className="small">Syarat belum lengkap</p></WireframeCard>
      </section>

      <section className="section card" style={{ padding: 0 }}>
        <div className="toolbar" style={{ padding: 18, borderBottom: '1px solid #ccc' }}>
          <div className="row">
            <select className="select" style={{ width: 220 }}>
              <option>Semua Mahasiswa</option>
              <option>Syarat Terpenuhi</option>
              <option>Sebagian Terpenuhi</option>
              <option>Belum Cukup</option>
            </select>
            <input className="input" style={{ width: 260 }} placeholder="Cari nama / NIM..." />
          </div>
          <p className="small muted">Syarat sempro: 5x bimbingan + ACC Sempro per dospem</p>
        </div>

        <WireframeTable
          columns={['No', 'Mahasiswa', 'Progress', 'Dospem 1', 'Dospem 2', 'Total', 'Status', 'Aksi']}
          rows={[
            [
              '1',
              'Andhika Laksmana\n2321053',
              <span className="status">BAB IV</span>,
              'Alvendo\n5/5 - ACC Sempro',
              "Rifa'atul\n5/5 - ACC Sempro",
              '10',
              <span className="status">Cukup</span>,
              'Download Surat',
            ],
            [
              '2',
              'Dinda Putri\n2221015',
              <span className="status">BAB III</span>,
              'Alvendo\n5/5 - ACC Sempro',
              'Rifa\n2/5 - Belum ACC',
              '7',
              <span className="status">Sebagian</span>,
              '-',
            ],
            [
              '3',
              'Pincen\n22012139',
              <span className="status">BAB I</span>,
              'Belum ada\n0/5',
              'Belum ada\n0/5',
              '0',
              <span className="status">Belum</span>,
              '-',
            ],
          ]}
        />

        <div className="toolbar" style={{ padding: 18 }}>
          <p className="small muted">Menampilkan 3 dari 120 mahasiswa</p>
        </div>
      </section>
    </WireframeLayout>
  )
}
