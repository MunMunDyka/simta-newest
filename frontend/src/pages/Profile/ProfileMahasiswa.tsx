import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    LayoutDashboard,
    Calendar,
    ChevronDown,
    LogOut,
    Settings,
    User,
    FileEdit,
    Camera,
    Mail,
    Phone,
    Lock,
    Save,
    GraduationCap,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/dashboard/mahasiswa' },
]

const aktivitasItems = [
    { label: 'Bimbingan', icon: FileEdit, path: '/bimbingan/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

const settingsItems = [
    { label: 'Profile', icon: User, active: true, path: '/profile/mahasiswa' },
]

export const ProfileMahasiswa = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [nama, setNama] = useState('')
    const [email, setEmail] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [nim, setNim] = useState('')
    const [prodi, setProdi] = useState('')
    const [passwordLama, setPasswordLama] = useState('')
    const [passwordBaru, setPasswordBaru] = useState('')
    const [konfirmasiPassword, setKonfirmasiPassword] = useState('')
    const [activeSection, setActiveSection] = useState<'info' | 'password' | 'whatsapp'>('info')
    const [isLoading, setIsLoading] = useState(false)

    // Fetch user data on mount
    useEffect(() => {
        if (user) {
            setNama(user.name || '')
            setEmail(user.email || '')
            setNim(user.nim_nip || '')
            setProdi(user.prodi || 'Program Studi')
            // Load whatsapp from user data
            setWhatsapp((user as any).whatsapp || '')
        }
    }, [user])

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
        },
    }

    const sidebarVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
        },
    }

    const handleUpdateInfo = () => {
        console.log('Updating info:', { nama, email })
        alert('Info akun berhasil diperbarui!')
    }

    const handleUpdatePassword = () => {
        if (passwordBaru !== konfirmasiPassword) {
            alert('Password baru tidak cocok!')
            return
        }
        console.log('Updating password')
        alert('Password berhasil diubah!')
        setPasswordLama('')
        setPasswordBaru('')
        setKonfirmasiPassword('')
    }

    const handleUpdateWhatsapp = async () => {
        if (!whatsapp) {
            alert('Nomor WhatsApp tidak boleh kosong!')
            return
        }

        setIsLoading(true)
        try {
            await api.put('/users/profile', { whatsapp })
            alert('Nomor WhatsApp berhasil diperbarui!')
        } catch (error: any) {
            console.error('Error updating WhatsApp:', error)
            alert(error.response?.data?.message || 'Gagal memperbarui nomor WhatsApp')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Sidebar */}
            <motion.aside
                className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm relative overflow-hidden"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 256 200" className="w-full h-auto" preserveAspectRatio="none">
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(219, 234, 254, 0.6)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(191, 219, 254, 0.5)" />
                        <path d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z" fill="rgba(147, 197, 253, 0.4)" />
                        <path d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z" fill="rgba(96, 165, 250, 0.3)" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                        <img
                            src="/LOGO-ITEBA-TOPBAR.png"
                            alt="ITEBA Logo"
                            className="h-12 w-auto"
                        />
                        <div>
                            <h1 className="text-xl font-bold tracking-wider text-gray-800">SIMTA</h1>
                            <p className="text-xs text-gray-500">SI Manajemen Tugas Akhir</p>
                        </div>
                    </motion.div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-6 relative z-10">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <motion.li key={item.label}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Aktivitas Bimbingan</p>
                        <ul className="space-y-1">
                            {aktivitasItems.map((item) => (
                                <motion.li key={item.label}>
                                    <motion.button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Settings</p>
                        <ul className="space-y-1">
                            {settingsItems.map((item) => (
                                <motion.li key={item.label}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className="p-4 relative z-10">
                    <motion.p className="text-xs text-blue-700 font-medium text-center drop-shadow-sm" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>
                        Institut Teknologi Batam 2025
                    </motion.p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Akun Saya</h1>
                        <p className="text-sm text-gray-500">Kelola informasi profil Anda</p>
                    </div>

                    <div className="flex items-center gap-4">
                        

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.avatar || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                                            {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer"><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/')
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Side - Profile Card */}
                            <motion.div variants={itemVariants} className="lg:col-span-1">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative group">
                                            <Avatar className="w-32 h-32 border-4 border-blue-100">
                                                <AvatarImage src={user?.avatar || undefined} />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl">
                                                    {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <motion.button
                                                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Camera className="w-5 h-5" />
                                            </motion.button>
                                        </div>

                                        <h2 className="text-lg font-bold text-gray-800 mt-4 text-center">{nama || user?.name}</h2>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>NIM: {nim || user?.nim_nip}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{prodi || user?.prodi}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 space-y-2">
                                        <motion.button
                                            onClick={() => setActiveSection('info')}
                                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeSection === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
                                            whileHover={{ x: 4 }}
                                        >
                                            Perbarui Info Akun
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setActiveSection('password')}
                                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeSection === 'password' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
                                            whileHover={{ x: 4 }}
                                        >
                                            Simpan Sandi Baru
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setActiveSection('whatsapp')}
                                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeSection === 'whatsapp' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
                                            whileHover={{ x: 4 }}
                                        >
                                            Update WhatsApp Number
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Side - Form */}
                            <motion.div variants={itemVariants} className="lg:col-span-2">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

                                    {/* Info Akun Section */}
                                    {activeSection === 'info' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Perbarui Info Akun</h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nama <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        value={nama}
                                                        onChange={(e) => setNama(e.target.value)}
                                                        className="pl-10 rounded-xl h-12"
                                                        placeholder="Masukkan nama lengkap"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="pl-10 rounded-xl h-12"
                                                        placeholder="Masukkan email"
                                                    />
                                                </div>
                                            </div>

                                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                <Button onClick={handleUpdateInfo} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl h-12">
                                                    <Save className="w-5 h-5 mr-2" />
                                                    Simpan Perubahan
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* Password Section */}
                                    {activeSection === 'password' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Simpan Sandi Baru</h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Password Lama <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        value={passwordLama}
                                                        onChange={(e) => setPasswordLama(e.target.value)}
                                                        className="pl-10 rounded-xl h-12"
                                                        placeholder="Masukkan password lama"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Password Baru <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        value={passwordBaru}
                                                        onChange={(e) => setPasswordBaru(e.target.value)}
                                                        className="pl-10 rounded-xl h-12"
                                                        placeholder="Masukkan password baru"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Konfirmasi Password <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        value={konfirmasiPassword}
                                                        onChange={(e) => setKonfirmasiPassword(e.target.value)}
                                                        className="pl-10 rounded-xl h-12"
                                                        placeholder="Konfirmasi password baru"
                                                    />
                                                </div>
                                            </div>

                                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                <Button onClick={handleUpdatePassword} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl h-12">
                                                    <Lock className="w-5 h-5 mr-2" />
                                                    Update Password
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* WhatsApp Section */}
                                    {activeSection === 'whatsapp' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Update WhatsApp Number</h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    No WhatsApp <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        value={whatsapp}
                                                        onChange={(e) => setWhatsapp(e.target.value)}
                                                        className="pl-10 rounded-xl h-12"
                                                        placeholder="Contoh: 081234567890"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    * Nomor ini akan digunakan untuk notifikasi bimbingan
                                                </p>
                                            </div>

                                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                <Button onClick={handleUpdateWhatsapp} disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12 disabled:opacity-50">
                                                    <Phone className="w-5 h-5 mr-2" />
                                                    {isLoading ? 'Menyimpan...' : 'Update WhatsApp'}
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                </div>
                            </motion.div>

                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
