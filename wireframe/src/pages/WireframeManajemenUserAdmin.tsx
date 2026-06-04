import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeManajemenUserAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/manajemen-user"
      title="Manajemen User"
      subtitle="Kelola data mahasiswa, dosen, dan admin"
    >
      <section className="grid grid-3">
        <div className="card">
          <h2 style={{ margin: 0 }}>3</h2>
          <p className="small muted">Total User</p>
        </div>
        <div className="card">
          <h2 style={{ margin: 0 }}>2</h2>
          <p className="small muted">Dosen Pembimbing</p>
        </div>
        <div className="card">
          <h2 style={{ margin: 0 }}>3</h2>
          <p className="small muted">User Aktif</p>
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <div className="row">
            <input className="input" style={{ width: 260 }} placeholder="Search user..." />
            <select className="select" style={{ width: 160 }}>
              <option>Semua Role</option>
              <option>Mahasiswa</option>
              <option>Dosen</option>
              <option>Admin</option>
            </select>
          </div>
          <button className="button">Tambah User</button>
        </div>

        <WireframeTable
          columns={['Nama', 'NIM/NIP', 'Role', 'Prodi', 'Status', 'Aksi']}
          rows={[
            ['Andhika Laksmana Putra Alka', '2321053', 'Mahasiswa', 'Sistem Informasi', <span className="status">Aktif</span>, 'Edit / Nonaktifkan'],
            ['Alvendo Wahyu Aranski M.Kom', '197001', 'Dosen', '-', <span className="status">Aktif</span>, 'Edit / Nonaktifkan'],
            ['Admin SIMTA', 'admin', 'Admin', '-', <span className="status">Aktif</span>, 'Edit'],
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

      <section className="section grid grid-2">
        <div className="modal-wire">
          <h2 className="section-title">Modal Tambah User Baru</h2>
          <div className="grid grid-2">
            <input className="input" placeholder="Role" />
            <input className="input" placeholder="NIM/NIP" />
            <input className="input" placeholder="Nama Lengkap" />
            <input className="input" placeholder="Email" />
          </div>
        </div>
        <div className="modal-wire">
          <h2 className="section-title">Modal Edit Dosen Pembimbing</h2>
          <div className="form-grid">
            <select className="select"><option>Dosen Pembimbing 1</option></select>
            <select className="select"><option>Dosen Pembimbing 2</option></select>
            <button className="button">Simpan</button>
          </div>
        </div>
      </section>
    </WireframeLayout>
  )
}
