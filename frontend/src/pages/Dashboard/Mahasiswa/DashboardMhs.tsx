/**
 * ===========================================
 * Dashboard Mahasiswa - Integrated with API
 * ===========================================
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    User,
    TrendingUp,
    GraduationCap,
    FileEdit,
    CheckCircle,
    XCircle,
    Download,
    Clock,
    CheckCircle2,
    Award,
    Upload,
    AlertTriangle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'
import { uploadWisuda } from '@/services/wisudaService'
import type { DokumenWisuda } from '@/services/authService'

// Types
interface DosenInfo {
    _id: string
    name: string
    nim_nip: string
    email?: string
}

interface MahasiswaData {
    _id: string
    name: string
    nim_nip: string
    prodi: string
    semester: string
    judulTA: string
    currentProgress: string
    statusMahasiswa?: string
    penguji_1?: DosenInfo
    penguji_2?: DosenInfo
    dospem_1?: DosenInfo
    dospem_2?: DosenInfo
    dokumenWisuda?: DokumenWisuda
}

type BimbinganStatus = 'menunggu' | 'revisi' | 'acc' | 'lanjut_bab' | 'acc_sempro' | null

interface DospemStatus {
    status: BimbinganStatus
}

interface BimbinganStats {
    dospem1Status: DospemStatus
    dospem2Status: DospemStatus
    penguji1Status: DospemStatus
    penguji2Status: DospemStatus
    totalBimbingan: number
    pendingCount: number
}

// Sempro Status interface
interface SemproStatus {
    isReady: boolean
    minRequired: number
    dospem1: {
        dosen: { name: string; nim_nip: string } | null
        accCount: number
        totalBimbingan: number
        required: number
        needed: number
        meetsMinimum: boolean
        approved: boolean
        ready: boolean
    }
    dospem2: {
        dosen: { name: string; nim_nip: string } | null
        accCount: number
        totalBimbingan: number
        required: number
        needed: number
        meetsMinimum: boolean
        approved: boolean
        ready: boolean
    }
    message: string
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true, path: '/dashboard/mahasiswa' },
]

const aktivitasItems = [
    { label: 'Bimbingan', icon: FileEdit, path: '/bimbingan/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

const studentMascotUrl = '/maskot_siakad.png'

export const DashboardMhs = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    // State for data from API
    const [mahasiswaData, setMahasiswaData] = useState<MahasiswaData | null>(null)
    const [bimbinganStats, setBimbinganStats] = useState<BimbinganStats>({
        dospem1Status: { status: null },
        dospem2Status: { status: null },
        penguji1Status: { status: null },
        penguji2Status: { status: null },
        totalBimbingan: 0,
        pendingCount: 0
    })
    const [semproStatus, setSemproStatus] = useState<SemproStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [studentMascotError, setStudentMascotError] = useState(false)

    // Wisuda Upload States
    const [skripsiFullFile, setSkripsiFullFile] = useState<File | null>(null)
    const [pptFile, setPptFile] = useState<File | null>(null)
    const [halamanFile, setHalamanFile] = useState<File | null>(null)
    const [formFile, setFormFile] = useState<File | null>(null)
    const [isUploadingWisuda, setIsUploadingWisuda] = useState(false)
    const [uploadWisudaError, setUploadWisudaError] = useState<string | null>(null)
    const [uploadWisudaSuccess, setUploadWisudaSuccess] = useState<string | null>(null)

    const fetchData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true)
            setLoadError(null)

            // Get user data with dosen pembimbing populated
            const userResponse = await api.get('/auth/me')
            const userData = userResponse.data.data
            setMahasiswaData(userData)

            // Get bimbingan stats
            try {
                const bimbinganResponse = await api.get('/bimbingan', { params: { limit: 50 } })
                const bimbinganList = bimbinganResponse.data.data || []

                // Calculate stats
                const pendingCount = bimbinganList.filter((b: { status: string }) => b.status === 'menunggu').length

                // Get last status per dospem and penguji
                const lastDospem1 = bimbinganList.find((b: { dosenType: string }) => b.dosenType === 'dospem_1')
                const lastDospem2 = bimbinganList.find((b: { dosenType: string }) => b.dosenType === 'dospem_2')
                const lastPenguji1 = bimbinganList.find((b: { dosenType: string }) => b.dosenType === 'penguji_1')
                const lastPenguji2 = bimbinganList.find((b: { dosenType: string }) => b.dosenType === 'penguji_2')

                setBimbinganStats({
                    dospem1Status: {
                        status: lastDospem1?.status || null,
                    },
                    dospem2Status: {
                        status: lastDospem2?.status || null,
                    },
                    penguji1Status: {
                        status: lastPenguji1?.status || null,
                    },
                    penguji2Status: {
                        status: lastPenguji2?.status || null,
                    },
                    totalBimbingan: bimbinganList.length,
                    pendingCount
                })
            } catch {
                // Bimbingan endpoint might not have data yet
                console.log('No bimbingan data yet')
            }

            // Get sempro status
            try {
                const semproResponse = await api.get(`/bimbingan/sempro-status/${userData._id}`)
                setSemproStatus(semproResponse.data.data)
            } catch {
                console.log('Failed to fetch sempro status')
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
            setLoadError(getApiErrorMessage(error, 'Gagal memuat data dashboard. Silakan refresh halaman.'))
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }

    // Fetch mahasiswa data on mount
    useEffect(() => {
        fetchData()
    }, [])

    const handleUploadWisuda = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!skripsiFullFile && !pptFile && !halamanFile && !formFile) {
            setUploadWisudaError('Pilih setidaknya satu file PDF untuk diunggah')
            return
        }

        setIsUploadingWisuda(true)
        setUploadWisudaError(null)
        setUploadWisudaSuccess(null)

        try {
            const formData = new FormData()
            if (skripsiFullFile) formData.append('skripsiFull', skripsiFullFile)
            if (pptFile) formData.append('pptSkripsi', pptFile)
            if (halamanFile) formData.append('halamanPengesahan', halamanFile)
            if (formFile) formData.append('formBimbingan', formFile)

            const res = await uploadWisuda(formData)
            if (res.success) {
                setUploadWisudaSuccess('Dokumen wisuda berhasil diunggah')
                setSkripsiFullFile(null)
                setPptFile(null)
                setHalamanFile(null)
                setFormFile(null)
                // Refresh data without full layout spinner
                fetchData(false)
            }
        } catch (err: unknown) {
            setUploadWisudaError(getApiErrorMessage(err, 'Gagal mengunggah berkas wisuda.'))
        } finally {
            setIsUploadingWisuda(false)
        }
    }

    const getFileUrl = (path: string) => {
        if (!path) return ''
        const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'
        const assetBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
        return `${assetBaseUrl}/${path.replace(/\\/g, '/')}`
    }

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12,
            },
        },
    }

    const cardVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    }

    const sidebarVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    }

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'revisi':
                return 'from-red-500 to-red-600'
            case 'acc':
                return 'from-green-500 to-green-600'
            case 'acc_sempro':
                return 'from-purple-500 to-purple-600'
            case 'menunggu':
                return 'from-yellow-500 to-yellow-600'
            case 'lanjut_bab':
                return 'from-blue-500 to-blue-600'
            default:
                return 'from-gray-400 to-gray-500'
        }
    }

    const getStatusText = (status: string | null) => {
        switch (status) {
            case 'revisi':
                return 'REVISI'
            case 'acc':
                return 'ACC'
            case 'acc_sempro':
                return 'ACC SEMPRO'
            case 'menunggu':
                return 'MENUNGGU'
            case 'lanjut_bab':
                return 'LANJUT BAB'
            default:
                return 'TIDAK ADA'
        }
    }

    const getSidangStatusText = (dospem: SemproStatus['dospem1']) => {
        if (dospem.ready) return 'Siap maju sidang'
        if (!dospem.meetsMinimum) return `Belum siap maju sidang - butuh ${dospem.needed} bimbingan lagi`
        return 'Belum di-ACC Maju Sidang'
    }

    // Navigate to bimbingan page
    const handleStartBimbingan = () => {
        navigate('/bimbingan/mahasiswa')
    }

    const isRevisionPhase = ['revisi_sempro', 'revisi_semhas', 'revisi_sidang'].includes(mahasiswaData?.statusMahasiswa || 'pra_sempro')

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            </div>
        )
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
                {/* Wave decoration at bottom */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 256 200" className="w-full h-auto" preserveAspectRatio="none">
                        <path
                            d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z"
                            fill="rgba(219, 234, 254, 0.6)"
                        />
                        <path
                            d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z"
                            fill="rgba(191, 219, 254, 0.5)"
                        />
                        <path
                            d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z"
                            fill="rgba(147, 197, 253, 0.4)"
                        />
                        <path
                            d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z"
                            fill="rgba(96, 165, 250, 0.3)"
                        />
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
                        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.avatar || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-600 text-white text-sm">
                                            {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => navigate('/profile/mahasiswa')}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/')
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        <FeedbackAlert message={loadError} onClose={() => setLoadError(null)} />

                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Left: Greeting */}
                            <motion.div
                                variants={cardVariants}
                                className="relative min-h-[104px] overflow-hidden bg-white rounded-2xl px-6 py-5 pl-[82px] shadow-sm border border-gray-100"
                            >
                                <motion.div
                                    className="absolute left-0 top-1/2 h-24 w-24 -translate-y-1/2 flex items-center justify-start"
                                    whileHover={{ scale: 1.04 }}
                                    transition={{ type: 'spring' as const, stiffness: 300 }}
                                >
                                    {studentMascotError ? (
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-md border-2 border-blue-200">
                                            <GraduationCap className="w-8 h-8 text-blue-600" />
                                        </div>
                                    ) : (
                                        <img
                                            src={studentMascotUrl}
                                            alt="Maskot SIAKAD"
                                            className="h-25 w-25 object-contain object-left"
                                            onError={() => setStudentMascotError(true)}
                                        />
                                    )}
                                </motion.div>
                                <div className="relative z-10 flex min-h-16 items-center">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-bold text-gray-800 leading-tight truncate">
                                            Hi, {mahasiswaData?.name || user?.name}
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500 leading-tight">
                                            {mahasiswaData?.nim_nip || 'NIM'} &middot; Prodi <span className="font-semibold text-blue-600">{mahasiswaData?.prodi || 'Sistem Informasi'}</span> &middot; Semester {mahasiswaData?.semester || '8'}
                                        </p>
                                        <p className="mt-1.5 text-xs text-blue-500 font-medium italic leading-tight">
                                            Tetap semangat dan teruslah belajar! 💪
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right: Judul TA */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center"
                            >
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Judul Tugas Akhir</p>
                                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                    {mahasiswaData?.judulTA || 'Judul Tugas Akhir belum diset'}
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* ===== ROW 2: Stats Cards (4 cols) ===== */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {/* Card 1 - Progress */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <p className="text-xs text-gray-400 font-semibold mb-3 text-center uppercase tracking-wider">Progress</p>
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 flex items-center justify-between">
                                    <motion.span
                                        className="text-lg font-bold text-white"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {mahasiswaData?.currentProgress || 'BAB I'}
                                    </motion.span>
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 2 - Status Dospem 1 / Penguji 1 */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <p className="text-xs text-gray-400 font-semibold mb-3 text-center uppercase tracking-wider">
                                    {isRevisionPhase ? 'Status Penguji 1' : 'Status Dospem 1'}
                                </p>
                                <div className={`bg-gradient-to-r ${getStatusColor(isRevisionPhase ? bimbinganStats.penguji1Status.status : bimbinganStats.dospem1Status.status)} rounded-xl p-4`}>
                                    <motion.span
                                        className="text-lg font-bold text-white block"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {getStatusText(isRevisionPhase ? bimbinganStats.penguji1Status.status : bimbinganStats.dospem1Status.status)}
                                    </motion.span>
                                </div>
                            </motion.div>

                            {/* Card 3 - Status Dospem 2 / Penguji 2 */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <p className="text-xs text-gray-400 font-semibold mb-3 text-center uppercase tracking-wider">
                                    {isRevisionPhase ? 'Status Penguji 2' : 'Status Dospem 2'}
                                </p>
                                <div className={`bg-gradient-to-r ${getStatusColor(isRevisionPhase ? bimbinganStats.penguji2Status.status : bimbinganStats.dospem2Status.status)} rounded-xl p-4`}>
                                    <motion.span
                                        className="text-lg font-bold text-white block"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.45 }}
                                    >
                                        {getStatusText(isRevisionPhase ? bimbinganStats.penguji2Status.status : bimbinganStats.dospem2Status.status)}
                                    </motion.span>
                                </div>
                            </motion.div>

                            {/* Card 4 - Total Bimbingan */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <p className="text-xs text-gray-400 font-semibold mb-3 text-center uppercase tracking-wider">Total Bimbingan</p>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 flex items-center justify-between">
                                    <motion.span
                                        className="text-lg font-bold text-white"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {bimbinganStats.totalBimbingan} Sesi
                                    </motion.span>
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <FileEdit className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>


                        {/* ===== WISUDA CARD ===== */}
                        {mahasiswaData && ['persiapan_wisuda', 'selesai'].includes(mahasiswaData.statusMahasiswa || '') && (
                            <motion.div
                                variants={itemVariants}
                                className={`rounded-2xl p-6 shadow-sm border ${
                                    mahasiswaData.dokumenWisuda?.statusVerifikasi === 'disetujui'
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                        : mahasiswaData.dokumenWisuda?.statusVerifikasi === 'ditolak'
                                        ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                                        : 'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm border border-orange-200">
                                        <Award className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Persiapan Wisuda</h3>
                                        <p className="text-xs text-gray-500">Unggah berkas administrasi kelulusan akhir Anda (Format PDF, Maksimal 25MB)</p>
                                    </div>

                                    {mahasiswaData.dokumenWisuda?.statusVerifikasi === 'disetujui' && (
                                        <Badge className="ml-auto bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs shadow-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            LULUS & SELESAI!
                                        </Badge>
                                    )}
                                    {mahasiswaData.dokumenWisuda?.statusVerifikasi === 'menunggu_verifikasi' && (
                                        <Badge className="ml-auto bg-yellow-500 hover:bg-yellow-650 text-white font-semibold flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs animate-pulse">
                                            <Clock className="w-4 h-4" />
                                            Menunggu Verifikasi
                                        </Badge>
                                    )}
                                    {mahasiswaData.dokumenWisuda?.statusVerifikasi === 'ditolak' && (
                                        <Badge className="ml-auto bg-red-650 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs">
                                            <XCircle className="w-4 h-4" />
                                            Perlu Perbaikan
                                        </Badge>
                                    )}
                                </div>

                                {uploadWisudaError && (
                                    <FeedbackAlert message={uploadWisudaError} onClose={() => setUploadWisudaError(null)} className="mb-4" />
                                )}
                                {uploadWisudaSuccess && (
                                    <FeedbackAlert message={uploadWisudaSuccess} type="success" onClose={() => setUploadWisudaSuccess(null)} className="mb-4" />
                                )}

                                {/* Admin notes if rejected */}
                                {mahasiswaData.dokumenWisuda?.statusVerifikasi === 'ditolak' && mahasiswaData.dokumenWisuda?.catatanAdmin && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                                        <span className="font-bold flex items-center gap-1.5 mb-1">
                                            <AlertTriangle className="w-4 h-4" />
                                            Catatan Evaluasi Admin:
                                        </span>
                                        <p>{mahasiswaData.dokumenWisuda.catatanAdmin}</p>
                                    </div>
                                )}

                                {/* Upload Form */}
                                <form onSubmit={handleUploadWisuda} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* File 1: Skripsi Full */}
                                        <div className="p-4 rounded-xl border border-gray-250 bg-white">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">1. File Skripsi Lengkap (PDF)</label>
                                            {mahasiswaData.dokumenWisuda?.skripsiFull?.fileName ? (
                                                <div className="flex items-center justify-between text-xs bg-gray-55 p-2.5 rounded-lg border border-gray-150 mb-2">
                                                    <a
                                                        href={getFileUrl(mahasiswaData.dokumenWisuda.skripsiFull.filePath)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-semibold text-blue-600 hover:underline truncate max-w-[200px]"
                                                    >
                                                        {mahasiswaData.dokumenWisuda.skripsiFull.fileOriginalName}
                                                    </a>
                                                    <span className="text-gray-400 font-medium">{mahasiswaData.dokumenWisuda.skripsiFull.fileSize}</span>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic mb-2">Belum ada file diunggah</p>
                                            )}
                                            {mahasiswaData.dokumenWisuda?.statusVerifikasi !== 'disetujui' && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        id="skripsiFullInput"
                                                        className="hidden"
                                                        onChange={(e) => setSkripsiFullFile(e.target.files?.[0] || null)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('skripsiFullInput')?.click()}
                                                        className="text-xs flex items-center gap-1.5 h-8 border-gray-300 hover:bg-gray-50"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                                                        Pilih File
                                                    </Button>
                                                    {skripsiFullFile && <span className="text-xs text-green-600 truncate font-semibold">{skripsiFullFile.name}</span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* File 2: PPT Skripsi */}
                                        <div className="p-4 rounded-xl border border-gray-250 bg-white">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">2. PPT Presentasi Skripsi (PDF)</label>
                                            {mahasiswaData.dokumenWisuda?.pptSkripsi?.fileName ? (
                                                <div className="flex items-center justify-between text-xs bg-gray-55 p-2.5 rounded-lg border border-gray-150 mb-2">
                                                    <a
                                                        href={getFileUrl(mahasiswaData.dokumenWisuda.pptSkripsi.filePath)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-semibold text-blue-600 hover:underline truncate max-w-[200px]"
                                                    >
                                                        {mahasiswaData.dokumenWisuda.pptSkripsi.fileOriginalName}
                                                    </a>
                                                    <span className="text-gray-400 font-medium">{mahasiswaData.dokumenWisuda.pptSkripsi.fileSize}</span>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic mb-2">Belum ada file diunggah</p>
                                            )}
                                            {mahasiswaData.dokumenWisuda?.statusVerifikasi !== 'disetujui' && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        id="pptInput"
                                                        className="hidden"
                                                        onChange={(e) => setPptFile(e.target.files?.[0] || null)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('pptInput')?.click()}
                                                        className="text-xs flex items-center gap-1.5 h-8 border-gray-300 hover:bg-gray-50"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                                                        Pilih File
                                                    </Button>
                                                    {pptFile && <span className="text-xs text-green-600 truncate font-semibold">{pptFile.name}</span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* File 3: Halaman Pengesahan */}
                                        <div className="p-4 rounded-xl border border-gray-250 bg-white">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">3. Halaman Pengesahan Ber-TTD (PDF)</label>
                                            {mahasiswaData.dokumenWisuda?.halamanPengesahan?.fileName ? (
                                                <div className="flex items-center justify-between text-xs bg-gray-55 p-2.5 rounded-lg border border-gray-150 mb-2">
                                                    <a
                                                        href={getFileUrl(mahasiswaData.dokumenWisuda.halamanPengesahan.filePath)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-semibold text-blue-600 hover:underline truncate max-w-[200px]"
                                                    >
                                                        {mahasiswaData.dokumenWisuda.halamanPengesahan.fileOriginalName}
                                                    </a>
                                                    <span className="text-gray-400 font-medium">{mahasiswaData.dokumenWisuda.halamanPengesahan.fileSize}</span>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic mb-2">Belum ada file diunggah</p>
                                            )}
                                            {mahasiswaData.dokumenWisuda?.statusVerifikasi !== 'disetujui' && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        id="halamanInput"
                                                        className="hidden"
                                                        onChange={(e) => setHalamanFile(e.target.files?.[0] || null)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('halamanInput')?.click()}
                                                        className="text-xs flex items-center gap-1.5 h-8 border-gray-300 hover:bg-gray-50"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                                                        Pilih File
                                                    </Button>
                                                    {halamanFile && <span className="text-xs text-green-600 truncate font-semibold">{halamanFile.name}</span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* File 4: Form Bimbingan */}
                                        <div className="p-4 rounded-xl border border-gray-250 bg-white">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">4. Form Logbook Bimbingan (PDF)</label>
                                            {mahasiswaData.dokumenWisuda?.formBimbingan?.fileName ? (
                                                <div className="flex items-center justify-between text-xs bg-gray-55 p-2.5 rounded-lg border border-gray-150 mb-2">
                                                    <a
                                                        href={getFileUrl(mahasiswaData.dokumenWisuda.formBimbingan.filePath)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-semibold text-blue-600 hover:underline truncate max-w-[200px]"
                                                    >
                                                        {mahasiswaData.dokumenWisuda.formBimbingan.fileOriginalName}
                                                    </a>
                                                    <span className="text-gray-400 font-medium">{mahasiswaData.dokumenWisuda.formBimbingan.fileSize}</span>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic mb-2">Belum ada file diunggah</p>
                                            )}
                                            {mahasiswaData.dokumenWisuda?.statusVerifikasi !== 'disetujui' && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        id="formInput"
                                                        className="hidden"
                                                        onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('formInput')?.click()}
                                                        className="text-xs flex items-center gap-1.5 h-8 border-gray-300 hover:bg-gray-50"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                                                        Pilih File
                                                    </Button>
                                                    {formFile && <span className="text-xs text-green-600 truncate font-semibold">{formFile.name}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {mahasiswaData.dokumenWisuda?.statusVerifikasi !== 'disetujui' && (
                                        <div className="pt-2 flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={isUploadingWisuda || (!skripsiFullFile && !pptFile && !halamanFile && !formFile)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20"
                                            >
                                                {isUploadingWisuda ? 'Mengunggah...' : 'Unggah Berkas'}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </motion.div>
                        )}

                        {/* ===== STATUS BIMBINGAN CARD (Only show when NOT in persiapan_wisuda / selesai) ===== */}
                        {semproStatus && mahasiswaData && !['persiapan_wisuda', 'selesai'].includes(mahasiswaData.statusMahasiswa || '') && (
                            <motion.div
                                variants={itemVariants}
                                className={`rounded-2xl p-6 shadow-sm border ${semproStatus.isReady
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                    : 'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm border border-blue-200">
                                        <div className="relative">
                                            <GraduationCap className="w-5 h-5 text-blue-600" />
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Status Bimbingan</h3>
                                    </div>
                                    {semproStatus.isReady && (
                                        <motion.div
                                            className="ml-auto bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            SIAP SIDANG!
                                        </motion.div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Dospem 1 Progress */}
                                    <div className={`p-4 rounded-xl ${semproStatus.dospem1.ready
                                        ? 'bg-green-100 border border-green-200'
                                        : 'bg-gray-50 border border-gray-200'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {semproStatus.dospem1.ready
                                                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                                                    : <XCircle className="w-5 h-5 text-gray-400" />
                                                }
                                                <span className="font-medium text-gray-700">Dospem 1</span>
                                            </div>
                                            <span className={`text-sm font-bold ${semproStatus.dospem1.ready ? 'text-green-600' : 'text-gray-600'
                                                }`}>
                                                {semproStatus.dospem1.totalBimbingan}/{semproStatus.dospem1.required} bimbingan
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 truncate">
                                            {semproStatus.dospem1.dosen?.name || 'Belum ditentukan'}
                                        </p>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <motion.div
                                                className={`h-2.5 rounded-full ${semproStatus.dospem1.ready ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${Math.min(100, (semproStatus.dospem1.totalBimbingan / semproStatus.dospem1.required) * 100)}%`
                                                }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                            />
                                        </div>
                                        <p className={`text-xs mt-2 ${semproStatus.dospem1.ready ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                            {getSidangStatusText(semproStatus.dospem1)}
                                        </p>
                                    </div>

                                    {/* Dospem 2 Progress */}
                                    <div className={`p-4 rounded-xl ${semproStatus.dospem2.ready
                                        ? 'bg-green-100 border border-green-200'
                                        : 'bg-gray-50 border border-gray-200'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {semproStatus.dospem2.ready
                                                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                                                    : <XCircle className="w-5 h-5 text-gray-400" />
                                                }
                                                <span className="font-medium text-gray-700">Dospem 2</span>
                                            </div>
                                            <span className={`text-sm font-bold ${semproStatus.dospem2.ready ? 'text-green-600' : 'text-gray-600'
                                                }`}>
                                                {semproStatus.dospem2.totalBimbingan}/{semproStatus.dospem2.required} bimbingan
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 truncate">
                                            {semproStatus.dospem2.dosen?.name || 'Belum ditentukan'}
                                        </p>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <motion.div
                                                className={`h-2.5 rounded-full ${semproStatus.dospem2.ready ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${Math.min(100, (semproStatus.dospem2.totalBimbingan / semproStatus.dospem2.required) * 100)}%`
                                                }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <p className={`text-xs mt-2 ${semproStatus.dospem2.ready ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                            {getSidangStatusText(semproStatus.dospem2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className={`mt-4 p-3 rounded-lg text-center ${semproStatus.isReady
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}>
                                    <p className="text-sm font-medium">
                                        Syarat Sidang: minimal {semproStatus.minRequired} kali bimbingan dan ACC Maju Sidang dari masing-masing dosen pembimbing.
                                    </p>
                                </div>

                                {/* Download Button - Only show when ready and status is pra_sempro / menunggu_sempro */}
                                {semproStatus.isReady && mahasiswaData && 
                                    (!mahasiswaData.statusMahasiswa || 
                                     mahasiswaData.statusMahasiswa === 'pra_sempro' || 
                                     mahasiswaData.statusMahasiswa === 'menunggu_sempro') && (
                                    <motion.button
                                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={async () => {
                                            try {
                                                const response = await api.get(
                                                    `/bimbingan/generate-surat-sempro/${mahasiswaData._id}`,
                                                    { responseType: 'blob' }
                                                )
                                                const url = window.URL.createObjectURL(new Blob([response.data]))
                                                const link = document.createElement('a')
                                                link.href = url
                                                link.setAttribute('download', `Surat_Persetujuan_Sempro_${mahasiswaData.nim_nip}.docx`)
                                                document.body.appendChild(link)
                                                link.click()
                                                link.remove()
                                                window.URL.revokeObjectURL(url)
                                            } catch (error) {
                                                console.error('Failed to download:', error)
                                                alert('Gagal mengunduh surat. Silakan coba lagi.')
                                            }
                                        }}
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Surat Persetujuan Sempro
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* Quick Actions (Only show when NOT in persiapan_wisuda / selesai) */}
                        {mahasiswaData && !['persiapan_wisuda', 'selesai'].includes(mahasiswaData.statusMahasiswa || '') && (
                            <motion.div
                                variants={itemVariants}
                                className="bg-gradient-to-r from-blue-500 via-blue-600 to-gray-600 rounded-2xl p-6 shadow-lg"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="text-white">
                                        <h3 className="text-xl font-bold mb-1">Mulai Bimbingan Sekarang</h3>
                                        <p className="text-blue-100 text-sm">Upload dokumen revisi dan kirim ke dosen pembimbing</p>
                                    </div>
                                    <motion.button
                                        className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                        whileHover={{ scale: 1.05, x: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartBimbingan}
                                    >
                                        <FileEdit className="w-5 h-5" />
                                        Upload Bimbingan
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
