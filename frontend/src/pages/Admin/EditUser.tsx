import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
    Save,
    Phone,
    Mail,
    GraduationCap,
    Briefcase,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

// Types
interface UserData {
    _id: string
    name: string
    nim_nip: string
    email: string
    role: 'mahasiswa' | 'dosen' | 'admin'
    prodi?: string
    currentProgress?: string
    judulTA?: string
    semester?: string
    status: 'aktif' | 'nonaktif'
    avatar?: string
    whatsapp?: string
    dospem_1?: { _id: string; name: string }
    dospem_2?: { _id: string; name: string }
}

interface DosenOption {
    _id: string
    name: string
    nim_nip: string
    status?: 'aktif' | 'nonaktif'
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

export const EditUser = () => {
    const { id, userType } = useParams<{ id: string; userType: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user: currentUser } = useAppSelector((state) => state.auth)

    const [userData, setUserData] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [dosenList, setDosenList] = useState<DosenOption[]>([])

    // Form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [prodi, setProdi] = useState('')
    const [semester, setSemester] = useState('')
    const [judulTA, setJudulTA] = useState('')
    const [currentProgress, setCurrentProgress] = useState('')
    const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif')
    const [dospem1, setDospem1] = useState('')
    const [dospem2, setDospem2] = useState('')

    // Fetch user data
    const fetchUserData = async () => {
        if (!id) return
        try {
            setIsLoading(true)
            const response = await api.get(`/users/${id}`)
            const data = response.data.data
            setUserData(data)

            // Populate form
            setName(data.name || '')
            setEmail(data.email || '')
            setWhatsapp(data.whatsapp || '')
            setProdi(data.prodi || '')
            setSemester(data.semester || '')
            setJudulTA(data.judulTA || '')
            setCurrentProgress(data.currentProgress || 'BAB I')
            setStatus(data.status || 'aktif')
            setDospem1(data.dospem_1?._id || 'none')
            setDospem2(data.dospem_2?._id || 'none')
        } catch (error) {
            console.error('Failed to fetch user:', error)
            alert('Gagal memuat data user')
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch dosen list for dropdown
    const fetchDosenList = async () => {
        try {
            const response = await api.get('/users/dosen')
            setDosenList(response.data.data)
        } catch (error) {
            console.error('Failed to fetch dosen list:', error)
        }
    }

    useEffect(() => {
        fetchUserData()
        if (userType === 'mahasiswa') {
            fetchDosenList()
        }
    }, [id, userType])

    // Handle save
    const handleSave = async () => {
        if (!id) return

        setIsSaving(true)
        try {
            const updateData: Record<string, unknown> = {
                name,
                email,
                whatsapp,
                status,
            }

            // Add mahasiswa-specific fields
            if (userType === 'mahasiswa') {
                updateData.prodi = prodi
                updateData.semester = semester
                updateData.judulTA = judulTA
                updateData.currentProgress = currentProgress
            }

            await api.put(`/users/${id}`, updateData)

            // Update dospem separately if changed
            if (userType === 'mahasiswa') {
                const dospemData: Record<string, string | null> = {}
                const newDospem1 = dospem1 === 'none' ? '' : dospem1
                const newDospem2 = dospem2 === 'none' ? '' : dospem2
                if (newDospem1 !== (userData?.dospem_1?._id || '')) {
                    dospemData.dospem_1 = newDospem1 || null
                }
                if (newDospem2 !== (userData?.dospem_2?._id || '')) {
                    dospemData.dospem_2 = newDospem2 || null
                }
                if (Object.keys(dospemData).length > 0) {
                    await api.put(`/users/${id}/assign-dospem`, dospemData)
                }
            }

            alert('Data berhasil disimpan!')
            navigate(`/admin/users/${userType}/${id}`)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal menyimpan: ' + (err.response?.data?.message || 'Unknown error'))
        } finally {
            setIsSaving(false)
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

    const isMahasiswa = userType === 'mahasiswa'

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
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/users/${userType}/${id}`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />Kembali
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Edit {isMahasiswa ? 'Mahasiswa' : 'Dosen'}</h1>
                            <p className="text-sm text-gray-500">Ubah data {userData?.name || ''}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                                            {currentUser?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'AD'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <p className="text-sm font-medium">{currentUser?.name || 'Admin'}</p>
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
                    ) : userData ? (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-6">

                            {/* Profile Header */}
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={userData.avatar} />
                                        <AvatarFallback className={`${isMahasiswa ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'} text-white text-xl`}>
                                            {userData.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{userData.name}</h2>
                                        <p className="text-gray-500 flex items-center gap-2">
                                            {isMahasiswa ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                            {userData.nim_nip}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Form */}
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Informasi Umum</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Nama */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="pl-10"
                                                placeholder="Masukkan nama"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                                placeholder="Masukkan email"
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp */}
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="whatsapp"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                className="pl-10"
                                                placeholder="Contoh: 081234567890"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">* Untuk notifikasi WhatsApp</p>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={status} onValueChange={(value: 'aktif' | 'nonaktif') => setStatus(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Mahasiswa-specific fields */}
                            {isMahasiswa && (
                                <>
                                    <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800 mb-6">Informasi Akademik</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Prodi */}
                                            <div className="space-y-2">
                                                <Label htmlFor="prodi">Program Studi</Label>
                                                <Select value={prodi} onValueChange={setProdi}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih prodi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Matematika">Matematika</SelectItem>
                                                        <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
                                                        <SelectItem value="Teknik Komputer">Teknik Komputer</SelectItem>
                                                        <SelectItem value="Desain Komunikasi Visual">Desain Komunikasi Visual</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Semester */}
                                            <div className="space-y-2">
                                                <Label htmlFor="semester">Semester</Label>
                                                <Select value={semester} onValueChange={setSemester}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih semester" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[...Array(14)].map((_, i) => (
                                                            <SelectItem key={i + 1} value={String(i + 1)}>Semester {i + 1}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Judul TA */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="judulTA">Judul Tugas Akhir</Label>
                                                <Input
                                                    id="judulTA"
                                                    value={judulTA}
                                                    onChange={(e) => setJudulTA(e.target.value)}
                                                    placeholder="Masukkan judul tugas akhir"
                                                />
                                            </div>

                                            {/* Progress */}
                                            <div className="space-y-2">
                                                <Label htmlFor="progress">Progress Saat Ini</Label>
                                                <Select value={currentProgress} onValueChange={setCurrentProgress}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih progress" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="BAB I">BAB I</SelectItem>
                                                        <SelectItem value="BAB II">BAB II</SelectItem>
                                                        <SelectItem value="BAB III">BAB III</SelectItem>
                                                        <SelectItem value="BAB IV">BAB IV</SelectItem>
                                                        <SelectItem value="BAB V">BAB V</SelectItem>
                                                        <SelectItem value="Selesai">Selesai</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Dosen Pembimbing */}
                                    <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800 mb-6">Dosen Pembimbing</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Pembimbing 1</Label>
                                                <Select value={dospem1} onValueChange={setDospem1}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih dosen pembimbing 1" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- Tidak Ada --</SelectItem>
                                                        {dosenList.map((dosen) => (
                                                            <SelectItem key={dosen._id} value={dosen._id}>
                                                                {dosen.name} ({dosen.nim_nip}){dosen.status === 'nonaktif' && ' - Nonaktif'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Pembimbing 2</Label>
                                                <Select value={dospem2} onValueChange={setDospem2}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih dosen pembimbing 2" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- Tidak Ada --</SelectItem>
                                                        {dosenList.map((dosen) => (
                                                            <SelectItem key={dosen._id} value={dosen._id}>
                                                                {dosen.name} ({dosen.nim_nip}){dosen.status === 'nonaktif' && ' - Nonaktif'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                </>
                            )}

                            {/* Actions */}
                            <motion.div variants={itemVariants} className="flex gap-4 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/admin/users/${userType}/${id}`)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500">Data tidak ditemukan</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
