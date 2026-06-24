import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeManajemenDosenAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/manajemen-dosen"
      title="Manajemen Dosen"
      subtitle="Kelola detail dosen, monitoring beban kerja, dan plotting pembimbing/penguji"
    >
      <section className="card">
        <div className="toolbar">
          <input className="input" style={{ width: 340 }} placeholder="Cari NIP atau nama dosen..." />
          <span className="small muted">Data diurutkan berdasarkan total beban</span>
        </div>

        <WireframeTable
          columns={[
            'Dosen',
            'Pembimbing 1',
            'Pembimbing 2',
            'Penguji 1',
            'Penguji 2',
            'Total Bimbingan',
            'Total Pengujian',
            'Total Beban',
            'Aksi',
          ]}
          rows={[
            ['Alvendo Wahyu Aranski M.Kom\nNIP: 197001', '2', '1', '1', '0', '3', '1', <span className="status">4 Mahasiswa</span>, 'Detail'],
            ["Rifa'atul Mahmudah Burhan, S.Kom.\nNIP: 197002", '0', '2', '1', '1', '2', '2', <span className="status">4 Mahasiswa</span>, 'Detail'],
            ['Dosen Penguji 1\nNIP: 197003', '0', '0', '2', '1', '0', '3', <span className="status">3 Mahasiswa</span>, 'Detail'],
          ]}
        />
      </section>

      <section className="section modal-wire">
        <h2 className="section-title">Panel Detail Dosen</h2>
        <div className="grid grid-3">
          <div className="note-box">
            <strong>Data Dosen</strong>
            <p className="small">Nama, NIP, email, status aktif.</p>
          </div>
          <div className="note-box">
            <strong>Mahasiswa Bimbingan</strong>
            <p className="small">Daftar mahasiswa sebagai pembimbing 1 dan pembimbing 2.</p>
          </div>
          <div className="note-box">
            <strong>Mahasiswa Pengujian</strong>
            <p className="small">Daftar mahasiswa sebagai penguji 1 dan penguji 2.</p>
          </div>
        </div>
      </section>
    </WireframeLayout>
  )
}
