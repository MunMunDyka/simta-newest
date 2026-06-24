import { WireframeCard } from '../components/WireframeCard'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeKelolaBimbinganAdmin() {
  return (
    <WireframeLayout
      role="admin"
      active="/admin/kelola-bimbingan"
      title="Kelola Bimbingan"
      subtitle="Lihat dan kelola riwayat bimbingan mahasiswa"
    >
      <div className="stack" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <section className="card">
          <h2 className="section-title">Pilih Mahasiswa</h2>
          <input className="input" placeholder="Ketik nama atau NIM mahasiswa..." />
        </section>

        <section className="card">
          <h2 className="section-title">Setting Syarat Sidang Mahasiswa</h2>
          <p className="subtitle">
            Target minimal bisa dibedakan untuk Dospem 1 dan Dospem 2. ACC Maju Sidang tetap wajib dari kedua dosen pembimbing.
          </p>
          <div className="row section">
            <label>
              <span className="label">Dospem 1</span>
              <input className="input" style={{ width: 110 }} value="5" readOnly />
            </label>
            <label>
              <span className="label">Dospem 2</span>
              <input className="input" style={{ width: 110 }} value="5" readOnly />
            </label>
            <button className="button" style={{ alignSelf: 'end' }}>Simpan Target</button>
          </div>
          <p className="small muted">Syarat aktif mahasiswa ini: Dospem 1 minimal 5 kali, Dospem 2 minimal 5 kali.</p>
        </section>

        <section className="card">
          <div className="toolbar">
            <div>
              <h2 className="section-title">Andhika Laksmana Putra Alka</h2>
              <p className="subtitle">2321053 - Sistem Informasi - Progress BAB IV</p>
            </div>
            <div className="grid grid-2" style={{ minWidth: 300 }}>
              <div className="note-box small"><strong>Dospem 1:</strong> Alvendo Wahyu</div>
              <div className="note-box small"><strong>Dospem 2:</strong> Rifa'atul Mahmudah</div>
            </div>
          </div>
        </section>

        <section className="grid grid-5">
          <WireframeCard title="Total Bimbingan"><h2>7</h2></WireframeCard>
          <WireframeCard title="ACC"><h2>3</h2></WireframeCard>
          <WireframeCard title="ACC Sempro"><h2>1</h2></WireframeCard>
          <WireframeCard title="Revisi"><h2>2</h2></WireframeCard>
          <WireframeCard title="Menunggu"><h2>1</h2></WireframeCard>
        </section>

        <section className="card" style={{ padding: 0 }}>
          <div className="tab-list" style={{ margin: 0 }}>
            <div className="tab active">Dospem 1 (4)</div>
            <div className="tab">Dospem 2 (3)</div>
          </div>
          <div className="toolbar" style={{ padding: 16, borderBottom: '1px solid #ccc' }}>
            <p className="small">Dosen: <strong>Alvendo Wahyu Aranski</strong> (197001)</p>
            <div className="row">
              <span className="status">ACC: 1</span>
              <span className="status">ACC Sempro: 1</span>
              <span className="status">Revisi: 1</span>
              <span className="status">Menunggu: 1</span>
            </div>
          </div>
          <WireframeTable
            columns={['No', 'Versi', 'Judul', 'Status', 'Tanggal Kirim', 'Feedback']}
            rows={[
              ['1', 'V3', 'TEST STATUS BIMBINGAN', <span className="status">Menunggu</span>, '26 Mei 2026', '-'],
              ['2', 'V2', 'TEST BIMBINGAN BAB 4', <span className="status">Revisi</span>, '25 Mei 2026', '26 Mei 2026'],
              ['3', 'V1', 'BAB IV', <span className="status">ACC Sempro</span>, '24 Mei 2026', '24 Mei 2026'],
            ]}
          />
        </section>

        <section className="card">
          <h2 className="section-title">Clear Riwayat Bimbingan</h2>
          <p className="small muted">Menghapus record, reply, dan file PDF secara permanen.</p>
          <div className="row section">
            <button className="button danger">Clear Dospem 1 (4)</button>
            <button className="button danger">Clear Dospem 2 (3)</button>
            <button className="button danger">Clear Semua Bimbingan (7)</button>
          </div>
        </section>

        <section className="grid grid-2">
          <div className="modal-wire">
            <h2 className="section-title">Modal Konfirmasi Hapus Bimbingan</h2>
            <p className="small">Tampilkan scope, jumlah bimbingan, opsi reset progress, dan tombol hapus permanen.</p>
            <select className="select"><option>Reset progress ke BAB I</option></select>
          </div>
          <div className="modal-wire">
            <h2 className="section-title">Global Clear</h2>
            <p className="small">Menghapus seluruh data bimbingan semua mahasiswa.</p>
            <input className="input" placeholder="Ketik: HAPUS SEMUA BIMBINGAN" />
            <button className="button danger section">Hapus Seluruh Database Bimbingan</button>
          </div>
        </section>
      </div>
    </WireframeLayout>
  )
}
