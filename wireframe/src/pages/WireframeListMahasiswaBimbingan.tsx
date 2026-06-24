import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeLayout } from '../components/WireframeLayout'

const students = [
  {
    name: 'Andhika Laksmana Putra Alka',
    nim: '2321053',
    progress: 'BAB IV',
    update: '26/05/2026',
    status: '2 Menunggu Review',
    relation: 'Pembimbing',
    semproReady: true,
    title: 'Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web',
  },
  {
    name: 'Dinda Putri',
    nim: '2221015',
    progress: 'BAB I',
    update: '21/12/2025',
    status: 'Belum Ada Bimbingan',
    relation: 'Penguji',
    semproReady: false,
    title: 'Analisis Sistem Informasi Akademik',
  },
  {
    name: 'Pincen',
    nim: '22012139',
    progress: 'BAB I',
    update: '30/12/2025',
    status: 'Belum Ada Bimbingan',
    relation: 'Pembimbing',
    semproReady: false,
    title: 'Perancangan Aplikasi Bimbingan',
  },
]

export function WireframeListMahasiswaBimbingan() {
  return (
    <WireframeLayout
      role="dosen"
      active="/dosen/list-mahasiswa"
      title="Mahasiswa Bimbingan"
      subtitle="Pilih mahasiswa untuk melihat detail bimbingan"
    >
      <div className="stack" style={{ maxWidth: 980, margin: '0 auto' }}>
        <section className="toolbar">
          <input className="input" style={{ width: 360 }} placeholder="Cari nama atau NIM mahasiswa..." />
          <select className="select" style={{ width: 210 }}>
            <option>Filter Peran: Mahasiswa Bimbingan</option>
            <option>Mahasiswa Pengujian</option>
            <option>Semua</option>
          </select>
          <div className="row">
            <div className="card" style={{ minWidth: 150 }}>
              <h2 style={{ margin: 0 }}>3</h2>
              <p className="small muted">Total Mahasiswa</p>
            </div>
            <div className="card" style={{ minWidth: 150 }}>
              <h2 style={{ margin: 0 }}>1</h2>
              <p className="small muted">Perlu Review</p>
            </div>
          </div>
        </section>

        <section className="outline-list">
          {students.map((student) => (
            <article className="list-item" key={student.nim}>
              <div className="toolbar">
                <div className="row">
                  <PlaceholderBox width={54} height={54} label="Avatar mahasiswa" />
                  <div>
                    <div className="row">
                      <h3 className="card-title" style={{ margin: 0 }}>{student.name}</h3>
                      <span className="status">{student.relation}</span>
                    </div>
                    <p className="small muted">{student.nim}</p>
                  </div>
                </div>
                <div className="row">
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{student.progress}</p>
                    <p className="small muted">Update: {student.update}</p>
                  </div>
                  <span className="status">{student.status}</span>
                  {student.semproReady && <button className="button secondary">Surat</button>}
                  <a className="button secondary" href="/dosen/review">Lihat</a>
                </div>
              </div>
              <div className="note-box">
                <span className="small"><strong>Judul TA:</strong> {student.title}</span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </WireframeLayout>
  )
}
