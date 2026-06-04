import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeLayout } from '../components/WireframeLayout'

export function WireframeBimbinganMahasiswa() {
  return (
    <WireframeLayout
      role="mahasiswa"
      active="/mahasiswa/bimbingan"
      title="Bimbingan Skripsi"
      subtitle="Kirim progres dan lihat feedback dosen"
    >
      <div className="stack" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="tab-list">
          <div className="tab active">
            Dosen Pembimbing 1
            <p className="small">Alvendo Wahyu Aranski M.Kom</p>
          </div>
          <div className="tab">
            Dosen Pembimbing 2
            <p className="small">Rifa'atul Mahmudah Burhan, S.Kom.</p>
          </div>
        </div>

        <section>
          <h2 className="section-title">Riwayat Bimbingan</h2>
          <div className="outline-list">
            <article className="list-item">
              <div className="document-card">
                <PlaceholderBox width={44} height={44} label="Versi dokumen" />
                <div>
                  <h3 className="card-title">V2 - TEST BIMBINGAN BAB 4</h3>
                  <p className="small">DraftSelesaiRevisi.pdf - 1936225</p>
                  <p className="small muted">Dikirim: 26/05/2026</p>
                </div>
                <span className="status">Revisi</span>
              </div>
              <div className="section feedback-box">
                <p className="small"><strong>Catatan Anda:</strong></p>
                <p>Mohon review revisi BAB IV yang sudah saya perbaiki.</p>
              </div>
              <div className="feedback-box">
                <p className="small"><strong>Feedback Dosen (26/05/2026):</strong></p>
                <p>Perbaiki bagian pembahasan dan tambahkan hasil pengujian sistem.</p>
              </div>
              <div className="feedback-box">
                <p className="small"><strong>Dosen:</strong> Mohon revisi bagian tabel hasil pengujian.</p>
                <p className="small"><strong>Anda:</strong> Baik Pak, saya upload revisi terbaru.</p>
                <div className="row">
                  <input className="input" placeholder="Tulis balasan..." />
                  <button className="button">Kirim</button>
                </div>
              </div>
              <button className="button secondary full">Download DraftSelesaiRevisi.pdf</button>
            </article>

            <article className="list-item">
              <div className="document-card">
                <PlaceholderBox width={44} height={44} label="Versi dokumen" />
                <div>
                  <h3 className="card-title">V1 - BAB IV</h3>
                  <p className="small">BAB4.pdf - 734243</p>
                  <p className="small muted">Dikirim: 24/05/2026</p>
                </div>
                <span className="status">ACC</span>
              </div>
            </article>
          </div>

          <div className="section" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="button">Kirim Bimbingan Baru</button>
          </div>
        </section>

        <section className="card">
          <div className="row" style={{ marginBottom: 14 }}>
            <PlaceholderBox width={42} height={42} label="Upload icon" />
            <div>
              <h2 className="section-title" style={{ marginBottom: 2 }}>Kirim Bimbingan Baru</h2>
              <p className="subtitle">Upload file revisi atau progres terbaru</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              <span className="label">Judul Bimbingan</span>
              <input className="input" placeholder="Contoh: Revisi BAB III - Metodologi Penelitian" />
            </label>
            <label>
              <span className="label">Upload File (PDF)</span>
              <div className="upload-zone">
                <div>
                  <PlaceholderBox width={72} height={54} label="Area upload PDF" />
                  <p>Klik atau drag file PDF ke sini</p>
                  <p className="small">Maksimal 10MB</p>
                </div>
              </div>
            </label>
            <label>
              <span className="label">Catatan Tambahan (Opsional)</span>
              <textarea className="textarea" placeholder="Jelaskan apa saja yang sudah diperbaiki atau ditambahkan..." />
            </label>
            <button className="button full">Kirim Bimbingan</button>
          </div>
        </section>
      </div>
    </WireframeLayout>
  )
}
