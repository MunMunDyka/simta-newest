import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeLayout } from '../components/WireframeLayout'
import { WireframeTable } from '../components/WireframeTable'

export function WireframeReviewBimbinganDosen() {
  return (
    <WireframeLayout
      role="dosen"
      active="/dosen/review"
      title="Review Bimbingan"
      subtitle="Berikan feedback untuk mahasiswa"
    >
      <div className="stack" style={{ maxWidth: 980, margin: '0 auto' }}>
        <section className="card">
          <div className="row">
            <PlaceholderBox width={72} height={72} label="Avatar mahasiswa" />
            <div>
              <h2 className="card-title">Andhika Laksmana Putra Alka</h2>
              <div className="row">
                <span className="status">2321053</span>
                <span className="status">Sistem Informasi</span>
                <span className="status">BAB IV</span>
              </div>
            </div>
          </div>
          <div className="note-box section">
            <p className="small"><strong>Judul Tugas Akhir:</strong></p>
            <p>Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web untuk Optimalisasi Proses Bimbingan</p>
          </div>
        </section>

        <section className="card">
          <div className="row" style={{ marginBottom: 14 }}>
            <PlaceholderBox width={44} height={44} label="Status dokumen" />
            <div>
              <h2 className="section-title" style={{ marginBottom: 2 }}>Menunggu Review</h2>
              <p className="subtitle">V3 - TEST STATUS BIMBINGAN</p>
            </div>
          </div>

          <div className="document-card feedback-box">
            <PlaceholderBox width={58} height={58} label="File dokumen" />
            <div>
              <h3 className="card-title">UTS_Kelompok_LaporanBusiness.pdf</h3>
              <p className="small">0.10 MB - Dikirim 26/05/2026, 19.13.56</p>
            </div>
            <button className="button">Download File</button>
          </div>

          <div className="section feedback-box">
            <p className="small"><strong>Pesan dari Mahasiswa:</strong></p>
            <p>Test</p>
          </div>
        </section>

        <section className="card">
          <div className="row" style={{ marginBottom: 16 }}>
            <PlaceholderBox width={44} height={44} label="Feedback icon" />
            <div>
              <h2 className="section-title" style={{ marginBottom: 2 }}>Berikan Feedback</h2>
              <p className="subtitle">Tentukan status dan berikan masukan</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              <span className="label">Status Bimbingan *</span>
              <select className="select">
                <option>Revisi - Perlu diperbaiki</option>
                <option>ACC - Disetujui</option>
                <option>Lanjut BAB - Silakan lanjut ke bab berikutnya</option>
                <option>ACC Maju Sempro - minimal 5x bimbingan</option>
              </select>
            </label>

            <div className="note-box">Mahasiswa akan diminta untuk merevisi.</div>

            <label>
              <span className="label">Komentar / Feedback *</span>
              <textarea className="textarea" placeholder="Tuliskan feedback, masukan, atau catatan revisi untuk mahasiswa..." />
            </label>

            <label>
              <span className="label">Lampiran File (Opsional) - Jika ada file coretan/catatan</span>
              <div className="upload-zone">
                <div>
                  <PlaceholderBox width={72} height={54} label="Upload file feedback" />
                  <p>Klik untuk upload file feedback</p>
                </div>
              </div>
            </label>

            <button className="button full">Kirim Feedback</button>
            <p className="small muted" style={{ textAlign: 'center' }}>
              Setelah mengirim feedback, mahasiswa akan menerima notifikasi email jika alamat email tersedia.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="row">
            <PlaceholderBox width={48} height={48} label="Sudah direview" />
            <div>
              <h2 className="section-title" style={{ marginBottom: 2 }}>Sudah Direview</h2>
              <p className="subtitle">Bimbingan ini sudah diberikan feedback. Tunggu mahasiswa untuk mengirim revisi baru.</p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="row" style={{ marginBottom: 16 }}>
            <PlaceholderBox width={44} height={44} label="Riwayat icon" />
            <div>
              <h2 className="section-title" style={{ marginBottom: 2 }}>Riwayat Bimbingan</h2>
              <p className="subtitle">Total 3 bimbingan</p>
            </div>
          </div>

          <WireframeTable
            columns={['Versi', 'Judul', 'Tanggal', 'File', 'Status', 'Feedback']}
            rows={[
              ['V3', 'TEST STATUS BIMBINGAN', '26/05/2026', 'UTS_Kelompok_LaporanBusiness.pdf', <span className="status">Menunggu</span>, '-'],
              ['V2', 'TEST BIMBINGAN BAB 4', '25/05/2026', 'DraftSelesaiRevisi.pdf', <span className="status">Revisi</span>, 'Perbaiki pembahasan'],
              ['V1', 'BAB IV', '24/05/2026', 'BAB4.pdf', <span className="status">ACC</span>, 'Sudah sesuai'],
            ]}
          />
        </section>
      </div>
    </WireframeLayout>
  )
}
