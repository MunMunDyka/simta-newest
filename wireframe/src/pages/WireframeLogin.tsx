import { PlaceholderBox } from '../components/PlaceholderBox'

export function WireframeLogin() {
  return (
    <main className="login-layout">
      <section className="login-left">
        <div className="stack" style={{ alignItems: 'center' }}>
          <PlaceholderBox width={112} height={112} />
          <h1>Selamat Datang</h1>
          <p className="muted">Sistem Informasi Manajemen Tugas Akhir untuk kemudahan proses bimbingan mahasiswa.</p>
        </div>
      </section>

      <section className="login-right">
        <div className="login-form">
          <div className="stack" style={{ alignItems: 'center', marginBottom: 28 }}>
            <PlaceholderBox width={72} height={72} />
            <div style={{ textAlign: 'center' }}>
              <h1 className="page-title">SIMTA</h1>
              <p className="subtitle">SI Manajemen Tugas Akhir</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="warning-box small">
              Area pesan error login: username/password wajib diisi atau kredensial salah.
            </div>
            <label>
              <span className="label">Username</span>
              <input className="input" placeholder="Masukkan username" />
            </label>
            <label>
              <span className="label">Password</span>
              <input className="input" placeholder="Masukkan password" type="password" />
              <span className="small muted">Toggle ikon mata untuk tampil/sembunyikan password</span>
            </label>
            <div className="toolbar">
              <label className="row small">
                <input type="checkbox" />
                Remember me
              </label>
              <span className="small">Lupa password</span>
            </div>
            <button className="button full">Login</button>
          </div>
        </div>
      </section>
    </main>
  )
}
