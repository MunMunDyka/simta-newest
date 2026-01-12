import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
    Users,
    Calendar,
    ChevronDown,
    LogOut,
    Settings,
    User,
    FileText,
    ArrowLeft,
    GraduationCap,
    Mail,
    Phone,
    MapPin,
    BookOpen,
    Key,
    Edit,
    Trash2,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

// Types
interface MahasiswaData {
    _id: string
    name: string
    nim_nip: string
    email: string
    prodi?: string
    currentProgress?: string
    judulTA?: string
    semester?: string
    plainPassword?: string
    dospem_1?: {
        _id: string
        name: string
        nim_nip: string
    }
    dospem_2?: {
        _id: string
        name: string
        nim_nip: string
    }
    status: 'aktif' | 'nonaktif'
    avatar?: string
    whatsapp?: string
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
]

const managementItems = [
    { label: 'Manajemen User', icon: Users, active: true, path: '/admin/users' },
    { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
]

const reportItems = [
    { label: 'Laporan', icon: FileText, path: '/admin/laporan' },
]

export const ManajemenUserMahasiswa = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [mahasiswa, setMahasiswa] = useState<MahasiswaData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [newPassword, setNewPassword] = useState('')
    const [showResetModal, setShowResetModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Fetch mahasiswa data
    const fetchMahasiswa = async () => {
        if (!id) return
        try {
            setIsLoading(true)
            const response = await api.get(`/users/${id}`)
            setMahasiswa(response.data.data)
        } catch (error) {
            console.error('Failed to fetch mahasiswa:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMahasiswa()
    }, [id])

    // Handle reset password
    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Password minimal 6 karakter')
            return
        }
        try {
            await api.put(`/users/${id}/reset-password`, { newPassword })
            setShowResetModal(false)
            setNewPassword('')
            fetchMahasiswa() // Refresh data to show new password
            alert('Password berhasil direset!')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal reset password: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

    // Handle deactivate (soft delete)
    const handleDeactivate = async () => {
        if (!id) return
        try {
            await api.delete(`/users/${id}`)
            setShowDeleteModal(false)
            alert('Mahasiswa berhasil dinonaktifkan!')
            navigate('/admin/users')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal menonaktifkan: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

    // Handle permanent delete
    const handlePermanentDelete = async () => {
        if (!id) return
        if (!confirm(`PERINGATAN: Mahasiswa "${mahasiswa?.name}" akan DIHAPUS PERMANEN! Lanjutkan?`)) return
        try {
            await api.delete(`/users/${id}/permanent`)
            setShowDeleteModal(false)
            alert('Mahasiswa berhasil dihapus permanen!')
            navigate('/admin/users')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal menghapus: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

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
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(254, 215, 170, 0.5)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(253, 186, 116, 0.4)" />
                        <path d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z" fill="rgba(251, 146, 60, 0.3)" />
                        <path d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z" fill="rgba(249, 115, 22, 0.2)" />
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
                            <p className="text-xs text-gray-500">Admin Panel</p>
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
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50"
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Manajemen</p>
                        <ul className="space-y-1">
                            {managementItems.map((item) => (
                                <motion.li key={item.label}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Laporan</p>
                        <ul className="space-y-1">
                            {reportItems.map((item) => (
                                <motion.li key={item.label}>
                                    <motion.button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50"
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

                {/* Footer */}
                <div className="p-4 relative z-10">
                    <motion.p className="text-xs text-orange-700 font-medium text-center" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>
                        Institut Teknologi Batam 2025
                    </motion.p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header
                    className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />Kembali
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Detail Mahasiswa</h1>
                            <p className="text-sm text-gray-500">Lihat informasi lengkap mahasiswa</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                                            {user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'AD'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                                    <User className="w-4 h-4 mr-2" />Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => { dispatch(logout()); navigate('/') }}>
                                    <LogOut className="w-4 h-4 mr-2" />Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : mahasiswa ? (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">
                            {/* Profile Card */}
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <div className="flex items-start gap-6">
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={mahasiswa.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl">
                                            {mahasiswa.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-gray-800">{mahasiswa.name}</h2>
                                            <Badge className={mahasiswa.status === 'aktif' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}>
                                                {mahasiswa.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-500 mb-4">{mahasiswa.nim_nip} • {mahasiswa.prodi || 'Sistem Informasi'}</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{mahasiswa.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{mahasiswa.whatsapp || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">Batam, Kepulauan Riau</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <GraduationCap className="w-4 h-4" />
                                                <span className="text-sm">Semester {mahasiswa.semester || '7'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => navigate(`/admin/users/mahasiswa/${id}/edit`)}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />Edit Data
                                    </Button>
                                    <Button
                                        onClick={() => setShowDeleteModal(true)}
                                        variant="destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />Hapus
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Thesis Info */}
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-orange-500" />
                                    Informasi Tugas Akhir
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Judul Tugas Akhir</p>
                                        <p className="font-medium text-gray-800">{mahasiswa.judulTA || 'Belum ada judul'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Progress Saat Ini</p>
                                            <Badge className="bg-blue-100 text-blue-600">{mahasiswa.currentProgress || 'BAB I'}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Status Bimbingan</p>
                                            <Badge className="bg-green-100 text-green-600">Aktif</Badge>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Dosen Pembimbing */}
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Dosen Pembimbing</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-2">Pembimbing 1</p>
                                        <p className="font-medium text-gray-800">{mahasiswa.dospem_1?.name || 'Belum ditentukan'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-2">Pembimbing 2</p>
                                        <p className="font-medium text-gray-800">{mahasiswa.dospem_2?.name || 'Belum ditentukan'}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Informasi Akun (Admin Only) */}
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-orange-500" />
                                    Informasi Akun (Admin Only)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-orange-50 rounded-xl">
                                        <p className="text-sm text-orange-600 mb-2">Username / NIM</p>
                                        <p className="font-medium text-gray-800 font-mono">{mahasiswa.nim_nip}</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-xl">
                                        <p className="text-sm text-orange-600 mb-2">Password</p>
                                        <p className="font-medium text-gray-800 font-mono">{mahasiswa.plainPassword || '******'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-orange-500">⚠️ Informasi ini hanya untuk keperluan admin.</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-orange-500 text-orange-500 hover:bg-orange-50"
                                        onClick={() => setShowResetModal(true)}
                                    >
                                        Reset Password
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500">Data mahasiswa tidak ditemukan</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Reset Password Modal */}
            <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Reset password untuk {mahasiswa?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Password Baru</Label>
                            <Input
                                id="newPassword"
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResetModal(false)}>Batal</Button>
                        <Button onClick={handleResetPassword} className="bg-orange-500 hover:bg-orange-600">Reset</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            Hapus Mahasiswa
                        </DialogTitle>
                        <DialogDescription>
                            Pilih aksi untuk mahasiswa <strong>{mahasiswa?.name}</strong>:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800 font-medium">Nonaktifkan</p>
                            <p className="text-xs text-yellow-600">Mahasiswa tidak bisa login tapi data tetap tersimpan</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-800 font-medium">Hapus Permanen</p>
                            <p className="text-xs text-red-600">Data mahasiswa akan dihapus dari database dan tidak bisa dikembalikan!</p>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Batal</Button>
                        <Button onClick={handleDeactivate} className="bg-yellow-500 hover:bg-yellow-600">Nonaktifkan</Button>
                        <Button onClick={handlePermanentDelete} variant="destructive">Hapus Permanen</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
