/**
 * ===========================================
 * DASHBOARD MAHASISWA - WIREFRAME VERSION
 * ===========================================
 * Versi Low-Fidelity untuk dokumentasi skripsi
 * Hanya menampilkan struktur dan layout
 */

export const DashboardWireframe = () => {
    return (
        <div className="min-h-screen flex bg-white">
            {/* Sidebar */}
            <aside className="w-64 border-r-2 border-black flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b-2 border-black">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                            <span className="font-mono text-xs">LOGO</span>
                        </div>
                        <div>
                            <h1 className="font-mono font-bold">SIMTA</h1>
                            <p className="font-mono text-xs">SI Manajemen TA</p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-6">
                    <div>
                        <p className="font-mono text-xs font-bold mb-3 px-3">MAIN MENU</p>
                        <ul className="space-y-1">
                            <li className="border-2 border-black bg-gray-200 px-3 py-2 font-mono text-sm flex items-center gap-2">
                                <div className="w-5 h-5 border border-black flex items-center justify-center text-xs">☐</div>
                                Dashboard
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-mono text-xs font-bold mb-3 px-3">AKTIVITAS</p>
                        <ul className="space-y-1">
                            <li className="border-2 border-black px-3 py-2 font-mono text-sm flex items-center gap-2">
                                <div className="w-5 h-5 border border-black flex items-center justify-center text-xs">☐</div>
                                Bimbingan
                            </li>
                            <li className="border-2 border-black px-3 py-2 font-mono text-sm flex items-center gap-2">
                                <div className="w-5 h-5 border border-black flex items-center justify-center text-xs">☐</div>
                                Jadwal Sidang
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t-2 border-black">
                    <p className="font-mono text-xs text-center">ITB 2025</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b-2 border-black flex items-center justify-between px-6">
                    <h1 className="font-mono font-bold text-lg">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        {/* Notification */}
                        <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                            <span className="text-sm">🔔</span>
                        </div>
                        {/* User Avatar */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center">
                                <span className="font-mono text-xs">U</span>
                            </div>
                            <span className="font-mono text-xs">▼</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto bg-gray-50">
                    <div className="space-y-6">
                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Card 1 - Progress */}
                            <div className="border-2 border-black bg-white p-5">
                                <p className="font-mono text-xs font-bold text-center mb-3">PROGRESS</p>
                                <div className="border-2 border-black bg-gray-200 p-4 flex items-center justify-between">
                                    <span className="font-mono font-bold">BAB III</span>
                                    <div className="w-8 h-8 border border-black flex items-center justify-center">↑</div>
                                </div>
                            </div>

                            {/* Card 2 - Status */}
                            <div className="border-2 border-black bg-white p-5">
                                <p className="font-mono text-xs font-bold text-center mb-3">STATUS</p>
                                <div className="border-2 border-black bg-gray-200 p-4 flex items-center justify-between">
                                    <span className="font-mono font-bold">REVISI</span>
                                    <div className="w-8 h-8 border border-black flex items-center justify-center">↓</div>
                                </div>
                            </div>

                            {/* Card 3 - Deadline */}
                            <div className="border-2 border-black bg-white p-5">
                                <p className="font-mono text-xs font-bold text-center mb-3">DEADLINE</p>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 border-2 border-black p-3">
                                        <p className="font-mono text-xs">DEADLINE</p>
                                        <p className="font-mono font-bold text-sm">13-03-2025</p>
                                    </div>
                                    <div className="border-2 border-black bg-gray-200 px-3 py-3">
                                        <span className="font-mono font-bold text-sm">30 Hari</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Greeting Card */}
                        <div className="border-2 border-black bg-white p-6">
                            <div className="flex items-center gap-5">
                                {/* Avatar */}
                                <div className="w-20 h-20 border-2 border-black flex items-center justify-center flex-shrink-0">
                                    <span className="font-mono text-xs text-center">AVATAR<br />MHS</span>
                                </div>

                                {/* Greeting Text */}
                                <div className="flex-1">
                                    <h2 className="font-mono font-bold text-lg mb-1">
                                        Hi, [NAMA MAHASISWA] ([NIM])
                                    </h2>
                                    <p className="font-mono text-sm mb-1">
                                        Saat ini kamu berada di semester <span className="font-bold">8 Ganjil</span> (Minggu #12).
                                    </p>
                                    <p className="font-mono text-sm italic">
                                        Tetap semangat dan teruslah belajar! 💪
                                    </p>
                                </div>

                                {/* Prodi Badge */}
                                <div className="border-2 border-black px-4 py-2">
                                    <span className="font-mono font-bold text-sm">[PRODI]</span>
                                </div>
                            </div>
                        </div>

                        {/* Judul Tugas Akhir */}
                        <div className="border-2 border-black bg-white p-6">
                            <h3 className="font-mono font-bold text-center mb-4">JUDUL TUGAS AKHIR</h3>
                            <p className="font-mono text-center text-sm">
                                [JUDUL TUGAS AKHIR MAHASISWA AKAN DITAMPILKAN DI SINI]
                            </p>
                        </div>

                        {/* Dosen Pembimbing Section */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Dosen Pembimbing 1 */}
                            <div className="border-2 border-black bg-white p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-14 h-14 border-2 border-black flex items-center justify-center flex-shrink-0">
                                            <span className="font-mono text-xs">D1</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-mono text-sm font-bold mb-1">Dosen Pembimbing 1:</p>
                                            <h4 className="font-mono font-bold">[NAMA DOSEN 1]</h4>
                                            <p className="font-mono text-sm">NIP: [NIP DOSEN]</p>
                                        </div>
                                    </div>
                                    {/* Chat Button */}
                                    <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                                        <span className="text-lg">💬</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dosen Pembimbing 2 */}
                            <div className="border-2 border-black bg-white p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-14 h-14 border-2 border-black flex items-center justify-center flex-shrink-0">
                                            <span className="font-mono text-xs">D2</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-mono text-sm font-bold mb-1">Dosen Pembimbing 2:</p>
                                            <h4 className="font-mono font-bold">[NAMA DOSEN 2]</h4>
                                            <p className="font-mono text-sm">NIP: [NIP DOSEN]</p>
                                        </div>
                                    </div>
                                    {/* Chat Button */}
                                    <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                                        <span className="text-lg">💬</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Banner */}
                        <div className="border-2 border-black bg-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-mono font-bold text-lg mb-1">Mulai Bimbingan Sekarang</h3>
                                    <p className="font-mono text-sm">Upload dokumen revisi dan kirim ke dosen pembimbing</p>
                                </div>
                                <button className="border-2 border-black bg-white px-6 py-3 font-mono font-bold flex items-center gap-2 hover:bg-gray-100">
                                    <span>📤</span> Upload Bimbingan
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
