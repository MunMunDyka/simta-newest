const groups = [
  {
    title: 'Umum',
    links: [{ href: '/login', title: 'Login', description: 'Split layout login dengan input username dan password.' }],
  },
  {
    title: 'Mahasiswa',
    links: [
      { href: '/mahasiswa/dashboard', title: 'Dashboard Mahasiswa', description: 'Progress, status dospem, dan ringkasan bimbingan.' },
      { href: '/mahasiswa/bimbingan', title: 'Bimbingan Mahasiswa', description: 'Upload dokumen, riwayat, feedback, dan reply.' },
    ],
  },
  {
    title: 'Dosen Pembimbing',
    links: [
      { href: '/dosen/dashboard', title: 'Dashboard Dosen', description: 'Ringkasan mahasiswa bimbingan dan status review.' },
      { href: '/dosen/list-mahasiswa', title: 'List Mahasiswa Bimbingan', description: 'Tabel mahasiswa bimbingan dosen.' },
      { href: '/dosen/review', title: 'Review Bimbingan', description: 'Download dokumen dan form feedback dosen.' },
    ],
  },
  {
    title: 'Admin',
    links: [
      { href: '/admin/dashboard', title: 'Dashboard Admin', description: 'Statistik user, bimbingan, dan jadwal.' },
      { href: '/admin/manajemen-user', title: 'Manajemen User', description: 'Kelola mahasiswa, dosen, dan admin.' },
      { href: '/admin/assign-dospem', title: 'Assign Dospem', description: 'Plotting dosen pembimbing 1 dan 2.' },
      { href: '/admin/kelola-jadwal', title: 'Kelola Jadwal', description: 'Form dan tabel jadwal sidang.' },
    ],
  },
  {
    title: 'Jadwal',
    links: [{ href: '/jadwal', title: 'Jadwal Sidang', description: 'Tampilan view-only jadwal untuk user.' }],
  },
]

export function WireframeDashboard() {
  return (
    <main className="wireframe-main">
      <header className="topbar">
        <div>
          <h1>Dashboard Wireframe SIMTA</h1>
          <p className="subtitle">Dokumentasi Wireframe Bab 4</p>
        </div>
        <a className="button secondary" href="/login">
          Mulai dari Login
        </a>
      </header>

      <section className="card">
        <h2 className="page-title">Pilih Halaman Wireframe</h2>
        <p className="subtitle">Dashboard ini hanya untuk navigasi screenshot, bukan bagian dari sistem utama.</p>
      </section>

      {groups.map((group) => (
        <section className="section" key={group.title}>
          <h2 className="section-title">{group.title}</h2>
          <div className="dashboard-links">
            {group.links.map((link) => (
              <a className="link-card" href={link.href} key={link.href}>
                <h3 className="card-title">{link.title}</h3>
                <p className="card-caption">{link.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
