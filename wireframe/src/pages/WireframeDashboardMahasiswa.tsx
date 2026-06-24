import { PlaceholderBox } from '../components/PlaceholderBox'
import { WireframeCard } from '../components/WireframeCard'
import { WireframeLayout } from '../components/WireframeLayout'

export function WireframeDashboardMahasiswa() {
  return (
    <WireframeLayout
      role="mahasiswa"
      active="/mahasiswa/dashboard"
      title="Dashboard"
      subtitle="Ringkasan progress tugas akhir mahasiswa"
    >
      <div className="grid grid-2">
        <WireframeCard>
          <div className="row">
            <PlaceholderBox width={82} height={82} />
            <div>
              <h2 className="card-title">Hi, Andhika Laksmana Putra Alka</h2>
              <p className="card-caption">2321053 - Prodi Sistem Informasi - Semester 7</p>
              <p className="small">Tetap semangat dan teruslah belajar.</p>
            </div>
          </div>
        </WireframeCard>
        <WireframeCard title="Judul Tugas Akhir">
          <p>Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web untuk Optimalisasi Proses Bimbingan</p>
        </WireframeCard>
      </div>

      <section className="section grid grid-4">
        <WireframeCard title="Progress">
          <h2>BAB IV</h2>
          <p className="small">Tahap pengerjaan tugas akhir saat ini</p>
        </WireframeCard>
        <WireframeCard title="Status Dospem 1">
          <span className="status">Revisi</span>
          <p className="small">Alvendo Wahyu Aranski M.Kom</p>
          <p className="small muted">Pada fase revisi, kartu ini menjadi Status Penguji 1.</p>
        </WireframeCard>
        <WireframeCard title="Status Dospem 2">
          <span className="status">Belum Ada</span>
          <p className="small">Rifa'atul Mahmudah Burhan, S.Kom.</p>
          <p className="small muted">Pada fase revisi, kartu ini menjadi Status Penguji 2.</p>
        </WireframeCard>
        <WireframeCard title="Total Bimbingan">
          <h2>2 Sesi</h2>
          <p className="small">Bimbingan tercatat</p>
        </WireframeCard>
      </section>

      <section className="section card">
        <h2 className="section-title">Status Bimbingan</h2>
        <div className="grid grid-2">
          <div className="feedback-box">
            <div className="toolbar">
              <strong>Dospem 1</strong>
              <span>2/5 bimbingan</span>
            </div>
            <p className="small">Alvendo Wahyu Aranski M.Kom</p>
            <div className="progress"><span style={{ width: '40%' }} /></div>
            <p className="small">Belum siap maju sempro - butuh 3 bimbingan lagi</p>
          </div>
          <div className="feedback-box">
            <div className="toolbar">
              <strong>Dospem 2</strong>
              <span>0/5 bimbingan</span>
            </div>
            <p className="small">Rifa'atul Mahmudah Burhan, S.Kom.</p>
            <div className="progress"><span style={{ width: '0%' }} /></div>
            <p className="small">Belum siap maju sempro - butuh 5 bimbingan lagi</p>
          </div>
        </div>
        <div className="note-box section">
          Syarat Sempro: minimal 5 kali bimbingan dan ACC Sempro dari masing-masing dosen pembimbing.
        </div>
        <button className="button secondary full section">Download Surat Persetujuan Sempro</button>
      </section>

      <section className="section card">
        <div className="toolbar">
          <div>
            <h2 className="section-title">Mulai Bimbingan Sekarang</h2>
            <p className="subtitle">Upload dokumen revisi dan kirim ke dosen pembimbing.</p>
          </div>
          <a className="button" href="/mahasiswa/bimbingan">Upload Bimbingan</a>
        </div>
      </section>
    </WireframeLayout>
  )
}
