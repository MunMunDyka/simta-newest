/**
 * ===========================================
 * LOGIN PAGE - WIREFRAME VERSION
 * ===========================================
 * Versi Low-Fidelity untuk dokumentasi skripsi
 * Hanya menampilkan struktur dan layout
 */

export const LoginWireframe = () => {
    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image Placeholder */}
            <div className="hidden lg:flex lg:w-1/2 border-r-2 border-black bg-gray-100 relative">
                {/* Placeholder for Image */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Image Placeholder Box */}
                    <div className="w-64 h-64 border-2 border-black bg-white flex items-center justify-center mb-6">
                        <div className="text-center">
                            <div className="w-16 h-16 border-2 border-black mx-auto mb-2 flex items-center justify-center">
                                <span className="font-mono text-xs">ICON</span>
                            </div>
                            <span className="font-mono text-sm">[ GAMBAR LATAR ]</span>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="text-center border-2 border-black bg-white p-4">
                        <h2 className="text-2xl font-mono font-bold mb-2">SELAMAT DATANG</h2>
                        <p className="font-mono text-sm">
                            Sistem Informasi Manajemen<br />Tugas Akhir
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo Section */}
                    <div className="text-center mb-10">
                        {/* Logo Box */}
                        <div className="w-20 h-20 border-2 border-black mx-auto mb-4 flex items-center justify-center">
                            <span className="font-mono text-xs text-center">LOGO<br />SIMTA</span>
                        </div>
                        <h1 className="text-3xl font-mono font-bold tracking-wider mb-2">
                            S I M T A
                        </h1>
                        <p className="font-mono text-sm">
                            SI Manajemen Tugas Akhir
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="block font-mono text-sm font-medium">
                                Username / NIM / NIP
                            </label>
                            <div className="h-12 border-2 border-black bg-white px-4 flex items-center">
                                <span className="font-mono text-gray-400 text-sm">
                                    Masukkan username...
                                </span>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block font-mono text-sm font-medium">
                                Password
                            </label>
                            <div className="h-12 border-2 border-black bg-white px-4 flex items-center justify-between">
                                <span className="font-mono text-gray-400 text-sm">
                                    ••••••••
                                </span>
                                <div className="w-6 h-6 border border-black flex items-center justify-center">
                                    <span className="text-xs">👁</span>
                                </div>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-black"></div>
                                <span className="font-mono text-sm">Remember me</span>
                            </div>
                            <span className="font-mono text-sm underline">
                                Forgot Password?
                            </span>
                        </div>

                        {/* Login Button */}
                        <button className="w-full h-12 border-2 border-black bg-gray-200 font-mono font-bold hover:bg-gray-300 transition-colors">
                            LOGIN
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 text-center">
                        <p className="font-mono text-sm">
                            Institut Teknologi Batam 2025
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
