import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeAssignDospemAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/assign-dospem"
      title="Edit Mahasiswa"
      subtitle="Ringkasan wireframe bagian assign dospem pada form Edit User"
    >
      <div className="stack" style={{ maxWidth: 980, margin: '0 auto' }}>
        <section className="card">
          <div className="row">
            <PlaceholderBox width={72} height={72} label="Avatar mahasiswa" />
            <div>
              <h2 className="card-title">Andhika Laksmana Putra Alka</h2>
              <p className="card-caption">2321053 - Mahasiswa - Sistem Informasi</p>
              <span className="status">Aktif</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Informasi Umum</h2>
          <div className="grid grid-2">
            <label>
              <span className="label">Nama Lengkap</span>
              <input className="input" value="Andhika Laksmana Putra Alka" readOnly />
            </label>
            <label>
              <span className="label">Email</span>
              <input className="input" value="mahasiswa@email.com" readOnly />
            </label>
            <label>
              <span className="label">NIM</span>
              <input className="input" value="2321053" readOnly />
            </label>
            <label>
              <span className="label">Status</span>
              <select className="select"><option>Aktif</option></select>
            </label>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Informasi Akademik</h2>
          <div className="grid grid-2">
            <label>
              <span className="label">Program Studi</span>
              <select className="select"><option>Sistem Informasi</option></select>
            </label>
            <label>
              <span className="label">Semester</span>
              <input className="input" value="7" readOnly />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span className="label">Judul Tugas Akhir</span>
              <textarea className="textarea" value="Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web" readOnly />
            </label>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Dosen Pembimbing</h2>
          <div className="grid grid-2">
            <label>
              <span className="label">Dosen Pembimbing 1</span>
              <select className="select"><option>Alvendo Wahyu Aranski M.Kom</option></select>
            </label>
            <label>
              <span className="label">Dosen Pembimbing 2</span>
              <select className="select"><option>Rifa'atul Mahmudah Burhan, S.Kom.</option></select>
            </label>
          </div>
          <div className="note-box section small">Validasi: Dospem 1 dan Dospem 2 tidak boleh sama.</div>
          <button className="button section">Simpan Perubahan</button>
        </section>

        <section className="card">
          <h2 className="section-title">Daftar Mahasiswa dan Dospem</h2>
          <WireframeTable
            columns={['Mahasiswa', 'Dospem 1', 'Dospem 2', 'Aksi']}
            rows={[
              ['Andhika Laksmana Putra Alka', 'Alvendo Wahyu Aranski', "Rifa'atul Mahmudah", 'Edit'],
              ['Dinda Putri', 'Belum ada', 'Belum ada', 'Edit'],
              ['Pincen', 'Alvendo Wahyu Aranski', 'Belum ada', 'Edit'],
            ]}
          />
        </section>
      </div>
    </WireframeLayout>
  )
}
