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
        <WireframeCard title="Total Mahasiswa">
          <h2>3</h2>
          <p className="small">Mahasiswa bimbingan</p>
        </WireframeCard>
        <WireframeCard title="Menunggu Review">
          <h2>1</h2>
          <p className="small">Dokumen perlu ditinjau</p>
        </WireframeCard>
        <WireframeCard title="Status Revisi/ACC">
          <h2>2</h2>
          <p className="small">Sudah diberikan feedback</p>
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
            </div>
            <button className="button secondary">Recent History</button>
          </div>
        <WireframeTable
          columns={['NIM', 'Nama', 'Progress', 'Tanggal Update', 'Status', 'Aksi']}
          rows={[
            ['2321053', 'Andhika Laksmana Putra Alka', 'BAB IV', '26/05/2026', <span className="status">Menunggu Review</span>, <a href="/dosen/review">Review</a>],
            ['2221015', 'Dinda Putri', 'BAB I', '21/12/2025', <span className="status">Belum Ada Bimbingan</span>, 'Detail'],
            ['22012139', 'Pincen', 'BAB I', '30/12/2025', <span className="status">Belum Ada Bimbingan</span>, 'Detail'],
          ]}
        />
        </div>
      </section>
    </WireframeLayout>
  )
}
