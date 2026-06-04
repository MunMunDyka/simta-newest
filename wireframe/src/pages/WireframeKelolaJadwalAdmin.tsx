import { WireframeCard } from '../components/WireframeCard'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeKelolaJadwalAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/kelola-jadwal"
      title="Kelola Jadwal Sidang"
      subtitle="Atur jadwal sidang tugas akhir"
    >
      <section className="grid grid-4">
        <WireframeCard title="Total Jadwal"><h2>2</h2></WireframeCard>
        <WireframeCard title="Terjadwal"><h2>2</h2></WireframeCard>
        <WireframeCard title="Selesai"><h2>0</h2></WireframeCard>
        <WireframeCard title="Dibatalkan"><h2>0</h2></WireframeCard>
      </section>

      <section className="section card" style={{ padding: 0 }}>
        <div className="toolbar" style={{ padding: 18, borderBottom: '1px solid #ccc' }}>
          <div className="row">
            <select className="select" style={{ width: 170 }}>
              <option>Semua Status</option>
              <option>Terjadwal</option>
              <option>Selesai</option>
              <option>Batal</option>
            </select>
            <input className="input" style={{ width: 260 }} placeholder="Cari mahasiswa..." />
          </div>
          <button className="button">Buat Jadwal</button>
        </div>

        <WireframeTable
          columns={['Mahasiswa', 'Jenis', 'Tanggal & Waktu', 'Ruangan', 'Penguji', 'Status', 'Aksi']}
          rows={[
            ['Andhika - 2321053', 'Proposal', '12/06/2026 - 09:00', 'B302', 'Penguji 1, Penguji 2', <span className="status">Terjadwal</span>, 'Edit / Selesai / Batalkan'],
            ['Dinda - 2221015', 'Skripsi', '15/06/2026 - 13:00', 'B303', 'Penguji 1, Penguji 2', <span className="status">Terjadwal</span>, 'Edit / Selesai / Batalkan'],
          ]}
        />

        <div className="toolbar" style={{ padding: 18 }}>
          <p className="small muted">Menampilkan 2 dari 2 jadwal</p>
          <div className="row">
            <button className="button secondary">Previous</button>
            <span className="status">1</span>
            <button className="button secondary">Next</button>
          </div>
        </div>
      </section>

      <section className="section modal-wire">
        <h2 className="section-title">Modal Buat Jadwal Sidang Baru</h2>
        <div className="grid grid-3">
          <label>
            <span className="label">Mahasiswa</span>
            <select className="select"><option>Andhika Laksmana Putra Alka</option></select>
          </label>
          <label>
            <span className="label">Jenis Jadwal</span>
            <select className="select"><option>Sidang Proposal</option><option>Sidang Skripsi</option></select>
          </label>
          <label>
            <span className="label">Ruangan</span>
            <input className="input" value="B302" readOnly />
          </label>
          <label>
            <span className="label">Tanggal</span>
            <input className="input" value="2026-06-12" readOnly />
          </label>
          <label>
            <span className="label">Waktu Mulai</span>
            <input className="input" value="09:00" readOnly />
          </label>
          <label>
            <span className="label">Waktu Selesai</span>
            <input className="input" value="10:00" readOnly />
          </label>
          <label>
            <span className="label">Penguji 1</span>
            <select className="select"><option>Dosen Penguji 1</option></select>
          </label>
          <label>
            <span className="label">Penguji 2</span>
            <select className="select"><option>Dosen Penguji 2</option></select>
          </label>
          <div style={{ alignSelf: 'end' }}>
            <button className="button full">Buat Jadwal</button>
          </div>
        </div>
      </section>
    </WireframeLayout>
  )
}
