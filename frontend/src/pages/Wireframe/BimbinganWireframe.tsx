/**
 * ===========================================
 * BIMBINGAN MAHASISWA - WIREFRAME VERSION
 * ===========================================
 * Versi Low-Fidelity untuk dokumentasi skripsi
 * Hanya menampilkan struktur dan layout
 */

export const BimbinganWireframe = () => {
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
                            <li className="border-2 border-black px-3 py-2 font-mono text-sm flex items-center gap-2">
                                <div className="w-5 h-5 border border-black flex items-center justify-center text-xs">☐</div>
                                Dashboard
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-mono text-xs font-bold mb-3 px-3">AKTIVITAS</p>
                        <ul className="space-y-1">
                            <li className="border-2 border-black bg-gray-200 px-3 py-2 font-mono text-sm flex items-center gap-2">
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
                    <div>
                        <h1 className="font-mono font-bold text-lg">Bimbingan Skripsi</h1>
                        <p className="font-mono text-xs">Kirim progres dan lihat feedback dosen</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                            <span className="text-sm">🔔</span>
                        </div>
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
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {/* Tab Selection */}
                        <div className="flex gap-2">
                            <button className="flex-1 border-2 border-black bg-gray-200 py-3 px-4 font-mono font-bold">
                                <div className="flex items-center justify-center gap-2">
                                    <span>👤</span> Dosen Pembimbing 1
                                </div>
                                <p className="font-mono text-xs mt-1">[Nama Dospem 1]</p>
                            </button>
                            <button className="flex-1 border-2 border-black bg-white py-3 px-4 font-mono">
                                <div className="flex items-center justify-center gap-2">
                                    <span>👤</span> Dosen Pembimbing 2
                                </div>
                                <p className="font-mono text-xs mt-1">[Nama Dospem 2]</p>
                            </button>
                        </div>

                        {/* Upload Form */}
                        <div className="border-2 border-black bg-white p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                                    <span>📤</span>
                                </div>
                                <div>
                                    <h2 className="font-mono font-bold text-lg">Kirim Bimbingan Baru</h2>
                                    <p className="font-mono text-sm">Upload file revisi atau progres terbaru</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Judul Input */}
                                <div>
                                    <label className="block font-mono text-sm font-medium mb-1">Judul Bimbingan</label>
                                    <div className="h-10 border-2 border-black bg-white px-4 flex items-center">
                                        <span className="font-mono text-gray-400 text-sm">
                                            Contoh: Revisi BAB III - Metodologi...
                                        </span>
                                    </div>
                                </div>

                                {/* File Upload Area */}
                                <div>
                                    <label className="block font-mono text-sm font-medium mb-1">Upload File (PDF)</label>
                                    <div className="border-2 border-dashed border-black p-6 text-center">
                                        <div className="w-10 h-10 border-2 border-black mx-auto mb-2 flex items-center justify-center">
                                            <span>📁</span>
                                        </div>
                                        <p className="font-mono text-sm">Klik atau drag file PDF ke sini</p>
                                        <p className="font-mono text-xs text-gray-400 mt-1">Maksimal 10MB</p>
                                    </div>
                                </div>

                                {/* Catatan Textarea */}
                                <div>
                                    <label className="block font-mono text-sm font-medium mb-1">Catatan Tambahan (Opsional)</label>
                                    <div className="h-24 border-2 border-black bg-white p-3">
                                        <span className="font-mono text-gray-400 text-sm">
                                            Jelaskan apa saja yang sudah diperbaiki...
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button className="w-full h-12 border-2 border-black bg-gray-200 font-mono font-bold flex items-center justify-center gap-2">
                                    <span>📨</span> Kirim Bimbingan
                                </button>
                            </div>
                        </div>

                        {/* History Section */}
                        <div>
                            <h3 className="font-mono font-bold text-lg mb-4">Riwayat Bimbingan</h3>
                            <div className="space-y-3">
                                {/* History Item 1 */}
                                <div className="border-2 border-black bg-white">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                                                    <span className="font-mono font-bold text-sm">V3</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-mono font-bold">[Judul Bimbingan]</h4>
                                                    <p className="font-mono text-xs">📎 dokumen.pdf • 2.5 MB</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="border-2 border-black px-3 py-1 font-mono text-xs">
                                                    ⏳ MENUNGGU
                                                </div>
                                                <span className="font-mono">▶</span>
                                            </div>
                                        </div>
                                        <p className="font-mono text-xs text-gray-400 mt-2">Dikirim: 20 Des 2025, 14:30</p>
                                    </div>
                                </div>

                                {/* History Item 2 */}
                                <div className="border-2 border-black bg-white">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                                                    <span className="font-mono font-bold text-sm">V2</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-mono font-bold">[Judul Bimbingan V2]</h4>
                                                    <p className="font-mono text-xs">📎 revisi.pdf • 1.8 MB</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="border-2 border-black bg-gray-200 px-3 py-1 font-mono text-xs">
                                                    ❌ REVISI
                                                </div>
                                                <span className="font-mono">▶</span>
                                            </div>
                                        </div>
                                        <p className="font-mono text-xs text-gray-400 mt-2">Dikirim: 18 Des 2025, 10:15</p>
                                    </div>
                                </div>

                                {/* History Item 3 */}
                                <div className="border-2 border-black bg-white">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                                                    <span className="font-mono font-bold text-sm">V1</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-mono font-bold">[Judul Bimbingan V1]</h4>
                                                    <p className="font-mono text-xs">📎 draft.pdf • 1.2 MB</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="border-2 border-black px-3 py-1 font-mono text-xs">
                                                    ✅ ACC
                                                </div>
                                                <span className="font-mono">▶</span>
                                            </div>
                                        </div>
                                        <p className="font-mono text-xs text-gray-400 mt-2">Dikirim: 15 Des 2025, 09:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
