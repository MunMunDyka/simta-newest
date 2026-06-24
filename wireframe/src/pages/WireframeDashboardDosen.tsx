import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeCard } from '../components/WireframeCard'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeDashboardDosen() {
  return (
    <WireframeLayout role="dosen" active="/dosen/dashboard" title="Dashboard Dosen" subtitle="Ringkasan mahasiswa bimbingan">
      <section className="card">
        <div className="row">
          <PlaceholderBox width={88} height={88} />
          <div>
            <h2 className="card-title">Hi, Alvendo Wahyu Aranski M.Kom</h2>
            <p className="card-caption">Dosen Pembimbing Tugas Akhir</p>
            <p className="small">Pantau bimbingan mahasiswa dan berikan review dokumen.</p>
          </div>
        </div>
      </section>

      <section className="section grid grid-3">
        <WireframeCard title="Mahasiswa">
          <h2>3</h2>
          <p className="small">Bimbingan aktif</p>
        </WireframeCard>
        <WireframeCard title="Syarat">
          <h2>1</h2>
          <p className="small">Terpenuhi</p>
        </WireframeCard>
        <WireframeCard title="Review">
          <h2>2</h2>
          <p className="small">Menunggu</p>
        </WireframeCard>
      </section>

      <section className="section">
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar" style={{ padding: 18, borderBottom: '1px solid #ccc' }}>
            <div className="row">
              <span className="small">Show</span>
              <select className="select" style={{ width: 82 }}>
                <option>10</option>
                <option>25</option>
              </select>
              <span className="small">entries</span>
              <input className="input" style={{ width: 260 }} placeholder="Search..." />
              <span className="small">Peran:</span>
              <select className="select" style={{ width: 160 }}>
                <option>Pembimbing</option>
                <option>Pengujian</option>
                <option>Semua</option>
              </select>
            </div>
            <button className="button secondary">Recent History</button>
          </div>
        <WireframeTable
          columns={['NIM', 'Nama', 'Progress', 'Peran', 'Tanggal Update', 'Status', 'Aksi']}
          rows={[
            ['2321053', 'Andhika Laksmana Putra Alka', 'BAB IV', <span className="status">Pembimbing</span>, '26/05/2026', <span className="status">Menunggu Review</span>, <a href="/dosen/review">Detail</a>],
            ['2221015', 'Dinda Putri', 'BAB I', <span className="status">Penguji</span>, '21/12/2025', <span className="status">Belum Ada Bimbingan</span>, 'Detail'],
            ['22012139', 'Pincen', 'BAB I', <span className="status">Pembimbing</span>, '30/12/2025', <span className="status">Belum Ada Bimbingan</span>, 'Detail'],
          ]}
        />
        </div>
      </section>
    </WireframeLayout>
  )
}
