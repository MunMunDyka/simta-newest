import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeAssignDospemAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/manajemen-user"
      title="Edit Mahasiswa & Plotting Dosen"
      subtitle="Pengaturan profil, status akademik, dosen pembimbing, dan dosen penguji"
    >
      <div className="stack" style={{ maxWidth: 980, margin: '0 auto' }}>
        <section className="card">
          <div className="row">
            <PlaceholderBox width={80} height={80} label="Avatar" />
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
              <input className="input" value="andhika@iteba.ac.id" readOnly />
            </label>
            <label>
              <span className="label">Nomor WhatsApp</span>
              <input className="input" value="081234567890" readOnly />
              <span className="small muted">Untuk notifikasi WhatsApp</span>
            </label>
            <label>
              <span className="label">Status</span>
              <select className="select"><option>Aktif</option><option>Nonaktif</option></select>
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
              <select className="select"><option>Semester 7</option></select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span className="label">Judul Tugas Akhir</span>
              <input className="input" value="Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web" readOnly />
            </label>
            <label>
              <span className="label">Progress Saat Ini</span>
              <select className="select"><option>BAB IV</option><option>BAB V</option><option>Selesai</option></select>
            </label>
            <label>
              <span className="label">Status Akademik</span>
              <select className="select">
                <option>Pra-Sempro</option>
                <option>Menunggu Sempro</option>
                <option>Revisi Sempro</option>
                <option>Bimbingan Lanjut</option>
                <option>Menunggu Semhas</option>
                <option>Revisi Semhas</option>
                <option>Menunggu Sidang Akhir</option>
                <option>Revisi Sidang Akhir</option>
                <option>Selesai</option>
              </select>
            </label>
          </div>
        </section>

        <section className="grid grid-2">
          <div className="card">
            <h2 className="section-title">Dosen Pembimbing</h2>
            <div className="form-grid">
              <label>
                <span className="label">Pembimbing 1</span>
                <select className="select"><option>Alvendo Wahyu Aranski M.Kom (197001)</option></select>
              </label>
              <label>
                <span className="label">Pembimbing 2</span>
                <select className="select"><option>Rifa'atul Mahmudah Burhan, S.Kom. (197002)</option></select>
              </label>
            </div>
          </div>
          <div className="card">
            <h2 className="section-title">Dosen Penguji</h2>
            <div className="form-grid">
              <label>
                <span className="label">Penguji 1</span>
                <select className="select"><option>Dosen Penguji 1 (beban 2 mhs)</option></select>
              </label>
              <label>
                <span className="label">Penguji 2</span>
                <select className="select"><option>Dosen Penguji 2 (beban 1 mhs)</option></select>
              </label>
            </div>
          </div>
        </section>

        <section className="warning-box">
          <strong>Aturan Validasi Penentuan Dosen:</strong>
          <ul className="compact-list small">
            <li>Pembimbing 1 dan Pembimbing 2 tidak boleh orang yang sama.</li>
            <li>Pembimbing tidak boleh merangkap sebagai Penguji untuk mahasiswa yang sama.</li>
            <li>Dropdown penguji menampilkan informasi beban mahasiswa sebagai bahan pertimbangan.</li>
          </ul>
        </section>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="button secondary">Batal</button>
          <button className="button">Simpan Perubahan</button>
        </div>

        <section className="card">
          <h2 className="section-title">Daftar Mahasiswa & Relasi Dosen</h2>
          <WireframeTable
            columns={['Mahasiswa', 'Dospem 1', 'Dospem 2', 'Penguji 1', 'Penguji 2', 'Status Akademik', 'Aksi']}
            rows={[
              ['Andhika Laksmana Putra Alka', 'Alvendo Wahyu Aranski', "Rifa'atul Mahmudah", 'Dosen Penguji 1', 'Dosen Penguji 2', 'Revisi Sempro', 'Edit'],
              ['Dinda Putri', 'Belum ditentukan', 'Belum ditentukan', 'Belum ditentukan', 'Belum ditentukan', 'Pra-Sempro', 'Edit'],
              ['Pincen', 'Alvendo Wahyu Aranski', 'Belum ditentukan', 'Belum ditentukan', 'Belum ditentukan', 'Bimbingan Lanjut', 'Edit'],
            ]}
          />
        </section>
      </div>
    </WireframeLayout>
  )
}
