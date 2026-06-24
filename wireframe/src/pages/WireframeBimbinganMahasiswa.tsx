import { WireframeLayout } from '../components/WireframeLayout'

export function WireframeBimbinganMahasiswa() {
  return (
    <WireframeLayout
      role="mahasiswa"
      active="/mahasiswa/bimbingan"
      title="Bimbingan Skripsi"
      subtitle="Kirim progres dan lihat feedback dosen"
    >
      <div className="bimbingan-clean">
        <section className="progress-card">
          <h2 className="progress-title">Timeline Progress Tugas Akhir</h2>
          <div className="progress-steps">
            <div className="progress-step active">
              <span className="step-circle">1</span>
              <div>
                <strong>Seminar Proposal</strong>
                <p>Bimbingan Dospem</p>
              </div>
            </div>
            <div className="step-line" />
            <div className="progress-step">
              <span className="step-circle">2</span>
              <div>
                <strong>Seminar Hasil</strong>
                <p>Bimbingan Dospem</p>
              </div>
            </div>
            <div className="step-line" />
            <div className="progress-step">
              <span className="step-circle">3</span>
              <div>
                <strong>Sidang Akhir</strong>
                <p>Bimbingan Dospem</p>
              </div>
            </div>
          </div>
        </section>

        <div className="segment-control">
          <button className="segment-option active">Bimbingan Pembimbing</button>
          <button className="segment-option">Bimbingan Penguji</button>
        </div>

        <section className="advisor-grid">
          <button className="advisor-card active">
            <span className="advisor-icon">U</span>
            <strong>Dosen Pembimbing 1</strong>
            <p>Alvendo Wahyu Aranski M.Kom</p>
          </button>
          <button className="advisor-card">
            <span className="advisor-icon">U</span>
            <strong>Dosen Pembimbing 2</strong>
            <p>Rifa'atul Mahmudah Burhan, S.Kom.</p>
          </button>
        </section>

        <section>
          <h2 className="section-title">Riwayat Bimbingan</h2>
          <div className="history-stack">
            <article className="history-entry">
              <div className="history-version">V2</div>
              <div className="history-body">
                <h3>BAB I Pendahuluan (Revisi)</h3>
                <p>bimbingan_2321053_v2.pdf - 1543200</p>
                <span className="small muted">Dikirim:</span>
              </div>
              <span className="status yellow">Menunggu Review</span>
              <span className="history-chevron">›</span>
            </article>

            <article className="history-entry">
              <div className="history-version">V1</div>
              <div className="history-body">
                <h3>BAB I Pendahuluan</h3>
                <p>bimbingan_2321053_v1.pdf - 1543200</p>
                <span className="small muted">Dikirim:</span>
              </div>
              <span className="status red">Revisi</span>
              <span className="history-chevron">›</span>
            </article>
          </div>
        </section>
      </div>
    </WireframeLayout>
  )
}
