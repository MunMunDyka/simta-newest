import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeManajemenUserAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/manajemen-user"
      title="Manajemen User"
      subtitle="Kelola data mahasiswa dan dosen"
    >
      <section className="grid grid-3">
        <div className="card">
          <h2 style={{ margin: 0 }}>2</h2>
          <p className="small muted">Total Mahasiswa</p>
        </div>
        <div className="card">
          <h2 style={{ margin: 0 }}>2</h2>
          <p className="small muted">Total Dosen</p>
        </div>
        <div className="card">
          <h2 style={{ margin: 0 }}>4</h2>
          <p className="small muted">User Aktif</p>
        </div>
      </section>

      <section className="section card">
        <div className="toolbar">
          <div className="row">
            <span className="small">Show</span>
            <select className="select" style={{ width: 82 }}>
              <option>5</option>
              <option>10</option>
              <option>25</option>
            </select>
            <select className="select" style={{ width: 140 }}>
              <option>Semua</option>
              <option>Mahasiswa</option>
              <option>Dosen</option>
            </select>
            <input className="input" style={{ width: 260 }} placeholder="Cari nama, NIM, email..." />
          </div>
          <button className="button">Tambah User</button>
        </div>

        <WireframeTable
          columns={['Nama', 'NIM/NIDN', 'Email', 'Role', 'Status', 'Aksi']}
          rows={[
            [
              'Andhika Laksmana Putra Alka\nSistem Informasi',
              '2321053',
              'andhika@iteba.ac.id',
              <span className="status">Mahasiswa</span>,
              <span className="status">Aktif</span>,
              'Detail / Atur Plotting Dosen / Hapus',
            ],
            [
              'Alvendo Wahyu Aranski M.Kom',
              '197001',
              'alvendo@iteba.ac.id',
              <span className="status">Dosen</span>,
              <span className="status">Aktif</span>,
              'Detail / Hapus',
            ],
            [
              'Admin SIMTA',
              'admin',
              'admin@iteba.ac.id',
              <span className="status">Admin + Dosen</span>,
              <span className="status">Aktif</span>,
              'Detail / Hapus',
            ],
          ]}
        />

        <div className="toolbar section">
          <p className="small muted">Menampilkan 1-3 dari 3 data</p>
          <div className="row">
            <button className="button secondary">Previous</button>
            <span className="status">1</span>
            <button className="button secondary">Next</button>
          </div>
        </div>
      </section>

      <section className="section grid grid-3">
        <div className="modal-wire">
          <h2 className="section-title">Modal Tambah User Baru</h2>
          <div className="form-grid">
            <select className="select"><option>Role: Mahasiswa</option><option>Dosen</option></select>
            <input className="input" placeholder="NIM/NIP" />
            <input className="input" placeholder="Nama Lengkap" />
            <input className="input" placeholder="Email" />
            <input className="input" placeholder="Password minimal 6 karakter" />
            <select className="select"><option>Program Studi</option></select>
            <input className="input" placeholder="Judul Tugas Akhir (opsional)" />
            <button className="button">Simpan</button>
          </div>
        </div>
        <div className="modal-wire">
          <h2 className="section-title">Modal Atur Plotting Dosen</h2>
          <div className="form-grid">
            <strong>Dosen Pembimbing</strong>
            <select className="select"><option>Dosen Pembimbing 1</option></select>
            <select className="select"><option>Dosen Pembimbing 2</option></select>
            <strong>Dosen Penguji</strong>
            <select className="select"><option>Dosen Penguji 1</option></select>
            <select className="select"><option>Dosen Penguji 2</option></select>
            <button className="button">Simpan Plotting</button>
          </div>
        </div>
        <div className="modal-wire">
          <h2 className="section-title">Modal Hapus User</h2>
          <div className="stack">
            <div className="warning-box">
              <strong>Nonaktifkan</strong>
              <p className="small">User tidak bisa login, tetapi data tetap tersimpan.</p>
            </div>
            <div className="warning-box">
              <strong>Hapus Permanen</strong>
              <p className="small">Data user dihapus dari database dan tidak bisa dikembalikan.</p>
            </div>
            <div className="grid grid-2">
              <button className="button secondary full">Nonaktifkan</button>
              <button className="button danger full">Hapus Permanen</button>
            </div>
          </div>
        </div>
      </section>
    </WireframeLayout>
  )
}
