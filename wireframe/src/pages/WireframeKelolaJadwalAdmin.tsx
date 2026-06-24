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
        <WireframeCard title="Total Jadwal"><h2>3</h2></WireframeCard>
        <WireframeCard title="Terjadwal"><h2>1</h2></WireframeCard>
        <WireframeCard title="Selesai"><h2>1</h2></WireframeCard>
        <WireframeCard title="Dibatalkan"><h2>1</h2></WireframeCard>
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
          <div className="row">
            <button className="button danger">Hapus Seluruh Jadwal</button>
            <button className="button">Buat Jadwal</button>
          </div>
        </div>

        <WireframeTable
          columns={['Mahasiswa', 'Jenis', 'Tanggal & Waktu', 'Ruangan', 'Penguji', 'Status', 'Aksi']}
          rows={[
            ['Andhika - 2321053', 'Sidang Proposal', '12/06/2026\n09:00 - 10:00', 'B302', 'Penguji 1, Penguji 2', <span className="status">Terjadwal</span>, 'Edit / Selesai / Batalkan'],
            ['Dinda - 2221015', 'Sidang Skripsi', '15/06/2026\n13:00 - selesai', 'B303', 'Penguji 1, Penguji 2', <span className="status">Dibatalkan</span>, 'Jadwal Ulang / Hapus Permanen'],
            ['Pincen - 22012139', 'Sidang Proposal', '20/05/2026\n10:00 - 11:00', 'B304', 'Penguji 1, Penguji 2', <span className="status">Selesai</span>, 'Sudah Selesai / Hapus Permanen'],
          ]}
        />

        <div className="toolbar" style={{ padding: 18 }}>
          <p className="small muted">Menampilkan 3 dari 3 jadwal</p>
          <div className="row">
            <button className="button secondary">Previous</button>
            <span className="status">1</span>
            <button className="button secondary">Next</button>
          </div>
        </div>
      </section>

      <section className="section modal-wire">
        <h2 className="section-title">Modal Buat Jadwal Sidang Baru</h2>
        <div className="form-grid">
          <label>
            <span className="label">Mahasiswa *</span>
            <input className="input" placeholder="Ketik nama atau NIM mahasiswa..." />
          </label>
          <div className="grid grid-2 note-box">
            <p className="small"><strong>Dosen Pembimbing 1:</strong> Alvendo Wahyu Aranski</p>
            <p className="small"><strong>Dosen Pembimbing 2:</strong> Rifa'atul Mahmudah</p>
          </div>
          <div className="grid grid-4">
            <label>
              <span className="label">Jenis Sidang *</span>
              <select className="select"><option>Sidang Proposal</option><option>Sidang Skripsi</option></select>
            </label>
            <label>
              <span className="label">Tanggal *</span>
              <input className="input" value="2026-06-12" readOnly />
              <span className="small muted">Sabtu/Minggu ditolak</span>
            </label>
            <label>
              <span className="label">Mulai *</span>
              <input className="input" value="09:00 WIB" readOnly />
            </label>
            <label>
              <span className="label">Selesai</span>
              <input className="input" value="10:00 WIB" readOnly />
            </label>
          </div>
          <label>
            <span className="label">Ruangan *</span>
            <select className="select"><option>B302</option><option>B303</option><option>B304</option></select>
          </label>
          <div className="grid grid-2">
            <label>
              <span className="label">Penguji 1</span>
              <select className="select"><option>Dosen Penguji 1 (2 mhs) - Rekomendasi</option></select>
            </label>
            <label>
              <span className="label">Penguji 2</span>
              <select className="select"><option>Dosen Penguji 2 (1 mhs) - Rekomendasi</option></select>
            </label>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="button secondary">Batal</button>
            <button className="button">Buat Jadwal</button>
          </div>
        </div>
      </section>

      <section className="section grid grid-3">
        <div className="modal-wire">
          <h2 className="section-title">Modal Selesaikan Sidang</h2>
          <p className="small">Admin mengonfirmasi sidang selesai dan dapat mengubah waktu selesai aktual.</p>
          <input className="input" value="10:00" readOnly />
          <button className="button section">Selesaikan Sidang</button>
        </div>
        <div className="modal-wire">
          <h2 className="section-title">Modal Batalkan Jadwal</h2>
          <textarea className="textarea" placeholder="Alasan pembatalan jadwal..." />
          <button className="button danger section">Ya, Batalkan</button>
        </div>
        <div className="modal-wire">
          <h2 className="section-title">Modal Hapus Permanen</h2>
          <p className="small">Dipakai untuk jadwal yang sudah selesai atau dibatalkan.</p>
          <button className="button danger">Hapus Permanen</button>
        </div>
      </section>
    </WireframeLayout>
  )
}
