/**
 * ===========================================
 * Laporan Progress Bimbingan - Admin Page
 * ===========================================
 * Halaman admin untuk melihat progress bimbingan
 * semua mahasiswa — berapa kali bimbingan per dospem
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
    User,
    FileText,
    Search,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    TrendingUp,
    BookOpen,
    Download,
    GraduationCap,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'

// Types
interface DospemProgress {
    total: number
    acc: number
    revisi: number
    menunggu: number
    lanjut_bab: number
    acc_sempro: number
    meetsMinimum: boolean
    lastActivity: string | null
    isSufficient: boolean
}

interface PengujiProgress {
    total: number
    acc: number
    revisi: number
    menunggu: number
    acc_sempro: number
    lastActivity: string | null
    isSufficient: boolean
}

interface MahasiswaProgress {
    _id: string
    name: string
    nim_nip: string
    prodi: string
    judulTA: string
    currentProgress: string
    statusMahasiswa?: string
    dospem_1: { name: string; nim_nip: string; workload?: number } | null
    dospem_2: { name: string; nim_nip: string; workload?: number } | null
    penguji_1: { name: string; nim_nip: string; workload?: number } | null
    penguji_2: { name: string; nim_nip: string; workload?: number } | null
    dospem1: DospemProgress
    dospem2: DospemProgress
    penguji1: PengujiProgress
    penguji2: PengujiProgress
    totalBimbingan: number
    totalAcc: number
    isBothSufficient: boolean
    isSemproReady: boolean
    lastActivity: string | null
}

interface ReportSummary {
    totalMahasiswa: number
    sufficientBoth: number
    sufficientOne: number
    insufficientBoth: number
    minAccRequired: number
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/admin/dashboard' },
]

const managementItems = [
    { label: 'Manajemen User', icon: Users, active: false, path: '/admin/users' },
    { label: 'Manajemen Dosen', icon: GraduationCap, path: '/admin/plotting' },
    { label: 'Kelola Bimbingan', icon: FileText, active: false, path: '/admin/bimbingan' },
    { label: 'Kelola Jadwal', icon: Calendar, active: false, path: '/admin/jadwal' },
    { label: 'Verifikasi Dokumen', icon: GraduationCap, path: '/admin/wisuda' },
]

const reportItems = [
    { label: 'Laporan', icon: BarChart3, active: true, path: '/admin/laporan' },
]

const SIDANG_AKHIR_STATUSES = new Set([
    'bimbingan_akhir',
    'menunggu_sidang',
    'revisi_sidang',
])

const statusMahasiswaOptions = [
    { value: 'all', label: 'Semua Fase' },
    { value: 'pra_sempro', label: 'Pra-Sempro' },
    { value: 'menunggu_sempro', label: 'Menunggu Sempro' },
    { value: 'revisi_sempro', label: 'Revisi Sempro' },
    { value: 'bimbingan_lanjut', label: 'Bimbingan Lanjut' },
    { value: 'menunggu_semhas', label: 'Menunggu Semhas' },
    { value: 'revisi_semhas', label: 'Revisi Semhas' },
    { value: 'sidang_akhir_akademik', label: 'Sidang Akhir Akademik' },
    { value: 'persiapan_wisuda', label: 'Persiapan Wisuda' },
    { value: 'selesai', label: 'Selesai' },
]

const getStatusMahasiswaLabel = (status?: string) => {
    if (status === 'bimbingan_akhir') return 'Bimbingan Akhir'
    if (status === 'menunggu_sidang') return 'Sidang Akhir Akademik'
    if (status === 'revisi_sidang') return 'Revisi Sidang Akhir'
    return statusMahasiswaOptions.find(option => option.value === status)?.label || 'Pra-Sempro'
}

export const Laporan = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [faseFilter, setFaseFilter] = useState('all')
    const [report, setReport] = useState<MahasiswaProgress[]>([])
    const [summary, setSummary] = useState<ReportSummary | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    }
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 12 } },
    }
    const sidebarVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
    }

    useEffect(() => {
        fetchReport()
    }, [])

    const fetchReport = async () => {
        try {
            setIsLoading(true)
            setLoadError(null)
            const res = await api.get('/bimbingan/admin/progress-report')
            setReport(res.data.data.report || [])
            setSummary(res.data.data.summary || null)
        } catch (error) {
            console.error('Failed to fetch progress report:', error)
            setLoadError(getApiErrorMessage(error, 'Gagal memuat laporan progress bimbingan. Silakan refresh halaman.'))
        } finally {
            setIsLoading(false)
        }
    }

    const filteredReport = report.filter(mhs => {
        const matchesSearch = mhs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mhs.nim_nip.includes(searchQuery)
        const mahasiswaPhase = mhs.statusMahasiswa || 'pra_sempro'
        const matchesFase = faseFilter === 'all' ||
            (faseFilter === 'sidang_akhir_akademik'
                ? SIDANG_AKHIR_STATUSES.has(mahasiswaPhase)
                : mahasiswaPhase === faseFilter)
        if (!matchesSearch || !matchesFase) return false
        if (statusFilter === 'all') return true
        if (statusFilter === 'sufficient') return mhs.isBothSufficient
        if (statusFilter === 'partial') return (mhs.dospem1.isSufficient || mhs.dospem2.isSufficient) && !mhs.isBothSufficient
        if (statusFilter === 'insufficient') return !mhs.dospem1.isSufficient && !mhs.dospem2.isSufficient
        return true
    })

    const ProgressBar = ({ current, min, color }: { current: number; min: number; color: string }) => {
        const percentage = Math.min((current / min) * 100, 100)
        return (
            <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <span className={`text-xs font-bold ${current >= min ? 'text-green-600' : 'text-gray-500'}`}>
                    {current}/{min}
                </span>
            </div>
        )
    }

    const handleDownloadSurat = async (mhs: MahasiswaProgress) => {
        try {
            const response = await api.get(
                `/bimbingan/generate-surat-sempro/${mhs._id}`,
                { responseType: 'blob' }
            )
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Surat_Persetujuan_Sempro_${mhs.nim_nip}.docx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to download:', error)
            alert('Gagal mengunduh surat. Silakan coba lagi.')
        }
    }

    const minBimbingan = summary?.minAccRequired || 5

    const statsCards = summary ? [
        { label: 'Total Mahasiswa', value: summary.totalMahasiswa, color: 'from-blue-500 to-blue-600', icon: Users, desc: 'Mahasiswa aktif' },
        { label: 'Siap Sempro', value: summary.sufficientBoth, color: 'from-green-500 to-green-600', icon: CheckCircle, desc: `${minBimbingan}x + ACC Sempro kedua dospem` },
        { label: 'Sebagian Terpenuhi', value: summary.sufficientOne, color: 'from-yellow-500 to-yellow-600', icon: AlertCircle, desc: 'Satu dospem sudah lengkap' },
        { label: 'Belum Cukup', value: summary.insufficientBoth, color: 'from-red-500 to-red-600', icon: XCircle, desc: 'Syarat belum lengkap' },
    ] : []

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Sidebar */}
            <motion.aside
                className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm relative overflow-hidden"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 256 200" className="w-full h-auto" preserveAspectRatio="none">
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(254, 215, 170, 0.5)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(253, 186, 116, 0.4)" />
                        <path d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z" fill="rgba(251, 146, 60, 0.3)" />
                        <path d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z" fill="rgba(249, 115, 22, 0.2)" />
                    </svg>
                </div>

                <div className="p-6 border-b border-gray-100">
                    <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }} transition={{ type: 'spring' as const, stiffness: 300 }}>
                        <img src="/LOGO-ITEBA-TOPBAR.png" alt="ITEBA Logo" className="h-12 w-auto" />
                        <div>
                            <h1 className="text-xl font-bold tracking-wider text-gray-800">SIMTA</h1>
                            <p className="text-xs text-gray-500">Admin Panel</p>
                        </div>
                    </motion.div>
                </div>

                <nav className="flex-1 p-4 space-y-6 relative z-10">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Manajemen</p>
                        <ul className="space-y-1">
                            {managementItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Laporan</p>
                        <ul className="space-y-1">
                            {reportItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className="p-4 relative z-10">
                    <motion.p className="text-xs text-orange-700 font-medium text-center drop-shadow-sm" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                        Institut Teknologi Batam 2025
                    </motion.p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header
                    className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6"
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Laporan Progress Bimbingan</h1>
                        <p className="text-sm text-gray-500">Monitor progress bimbingan semua mahasiswa</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors" whileHover={{ scale: 1.02 }}>
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.avatar || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                                        {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'AD'}
                                    </AvatarFallback>
                                </Avatar>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>{user?.name || 'Admin'}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer"><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => { dispatch(logout()); navigate('/') }}>
                                <LogOut className="w-4 h-4 mr-2" />Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <FeedbackAlert message={loadError} onClose={() => setLoadError(null)} />

                        {/* Stats Cards */}
                        {summary && (
                            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {statsCards.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                        whileHover={{ y: -2 }}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                                <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{stat.desc}</p>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                                <stat.icon className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Table */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Filters */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-wrap items-center gap-4">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-52 h-9 bg-gray-50 border-gray-200">
                                            <SelectValue placeholder="Filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Mahasiswa</SelectItem>
                                            <SelectItem value="sufficient">✅ Syarat Terpenuhi</SelectItem>
                                            <SelectItem value="partial">⚠️ Sebagian Terpenuhi</SelectItem>
                                            <SelectItem value="insufficient">❌ Belum Cukup</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={faseFilter} onValueChange={setFaseFilter}>
                                        <SelectTrigger className="w-56 h-9 bg-gray-50 border-gray-200">
                                            <SelectValue placeholder="Fase Mahasiswa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusMahasiswaOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Cari nama / NIM..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-9 w-64 bg-gray-50 border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    {summary && (
                                        <p className="text-sm text-gray-400 ml-auto">
                                            Syarat sempro: <strong className="text-orange-600">{minBimbingan}x bimbingan + ACC Sempro</strong> per dospem
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Table Content */}
                            <div className="overflow-x-auto">
                                <Table className="min-w-[1350px]">
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="font-semibold text-gray-700 w-12 pl-4 py-3">No</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-3">Mahasiswa</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-3">Progress</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center py-3">Dospem 1</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center py-3">Dospem 2</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center py-3">Penguji 1</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center py-3">Penguji 2</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center py-3">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center pr-4 py-3">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
                                                        <p className="text-gray-500 text-sm">Memuat data laporan...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredReport.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <BarChart3 className="w-12 h-12 text-gray-300" />
                                                        <p className="text-gray-500">Tidak ada data yang cocok</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredReport.map((mhs, index) => (
                                                <motion.tr
                                                    key={mhs._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.03 * index }}
                                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <TableCell className="text-gray-500 text-sm py-4 pl-4">{index + 1}</TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-9 h-9">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                                                                    {mhs.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-sm">{mhs.name}</p>
                                                                <p className="text-xs text-gray-400">{mhs.nim_nip}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col items-start gap-1.5">
                                                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                                                                <BookOpen className="w-3 h-3 mr-1" />{mhs.currentProgress || 'BAB I'}
                                                            </Badge>
                                                            <Badge className="bg-slate-100 text-slate-600 text-[10px] border-0">
                                                                {getStatusMahasiswaLabel(mhs.statusMahasiswa)}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="text-center space-y-1">
                                                            <p className="text-xs text-gray-700 truncate max-w-[120px] mx-auto font-semibold" title={mhs.dospem_1?.name}>
                                                                {mhs.dospem_1?.name || 'Belum ada'}
                                                            </p>
                                                            {mhs.dospem_1 && (
                                                                <p className="text-[10px] text-gray-500 font-medium">
                                                                    (Membimbing: {mhs.dospem_1.workload || 0} mhs)
                                                                </p>
                                                            )}
                                                            <ProgressBar
                                                                current={mhs.dospem1.total}
                                                                min={minBimbingan}
                                                                color={mhs.dospem1.isSufficient ? 'bg-green-500' : 'bg-orange-400'}
                                                            />
                                                            <p className="text-[10px] text-gray-400">
                                                                {mhs.dospem1.acc_sempro > 0 ? 'ACC Sempro' : 'Belum ACC Sempro'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="text-center space-y-1">
                                                            <p className="text-xs text-gray-700 truncate max-w-[120px] mx-auto font-semibold" title={mhs.dospem_2?.name}>
                                                                {mhs.dospem_2?.name || 'Belum ada'}
                                                            </p>
                                                            {mhs.dospem_2 && (
                                                                <p className="text-[10px] text-gray-500 font-medium">
                                                                    (Membimbing: {mhs.dospem_2.workload || 0} mhs)
                                                                </p>
                                                            )}
                                                            <ProgressBar
                                                                current={mhs.dospem2.total}
                                                                min={minBimbingan}
                                                                color={mhs.dospem2.isSufficient ? 'bg-green-500' : 'bg-orange-400'}
                                                            />
                                                            <p className="text-[10px] text-gray-400">
                                                                {mhs.dospem2.acc_sempro > 0 ? 'ACC Sempro' : 'Belum ACC Sempro'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="text-center space-y-1">
                                                            <p className="text-xs text-gray-700 truncate max-w-[120px] mx-auto font-semibold" title={mhs.penguji_1?.name}>
                                                                {mhs.penguji_1?.name || '—'}
                                                            </p>
                                                            {mhs.penguji_1 ? (
                                                                <>
                                                                    <p className="text-[10px] text-gray-500 font-medium">
                                                                        (Menguji: {mhs.penguji_1.workload || 0} mhs)
                                                                    </p>
                                                                    <ProgressBar
                                                                        current={mhs.penguji1.total}
                                                                        min={1}
                                                                        color={mhs.penguji1.isSufficient ? 'bg-green-500' : 'bg-orange-400'}
                                                                    />
                                                                    <p className="text-[10px] text-gray-400">
                                                                        {mhs.penguji1.isSufficient ? 'ACC Sempro' : 'Belum ACC Sempro'}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-[10px] text-gray-400 mt-1">
                                                                    Belum di-assign
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="text-center space-y-1">
                                                            <p className="text-xs text-gray-700 truncate max-w-[120px] mx-auto font-semibold" title={mhs.penguji_2?.name}>
                                                                {mhs.penguji_2?.name || '—'}
                                                            </p>
                                                            {mhs.penguji_2 ? (
                                                                <>
                                                                    <p className="text-[10px] text-gray-500 font-medium">
                                                                        (Menguji: {mhs.penguji_2.workload || 0} mhs)
                                                                    </p>
                                                                    <ProgressBar
                                                                        current={mhs.penguji2.total}
                                                                        min={1}
                                                                        color={mhs.penguji2.isSufficient ? 'bg-green-500' : 'bg-orange-400'}
                                                                    />
                                                                    <p className="text-[10px] text-gray-400">
                                                                        {mhs.penguji2.isSufficient ? 'ACC Sempro' : 'Belum ACC Sempro'}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-[10px] text-gray-400 mt-1">
                                                                    Belum di-assign
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        {mhs.isBothSufficient ? (
                                                            <Badge className="bg-green-100 text-green-700 border-0">
                                                                <CheckCircle className="w-3 h-3 mr-1" />Cukup
                                                            </Badge>
                                                        ) : (mhs.dospem1.isSufficient || mhs.dospem2.isSufficient) ? (
                                                            <Badge className="bg-yellow-100 text-yellow-700 border-0">
                                                                <AlertCircle className="w-3 h-3 mr-1" />Sebagian
                                                            </Badge>
                                                        ) : mhs.totalBimbingan > 0 ? (
                                                            <Badge className="bg-orange-100 text-orange-700 border-0">
                                                                <TrendingUp className="w-3 h-3 mr-1" />Proses
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-red-100 text-red-700 border-0">
                                                                <XCircle className="w-3 h-3 mr-1" />Belum
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-4 text-center">
                                                        {mhs.isSemproReady ? (
                                                            <motion.button
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDownloadSurat(mhs)}
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                Surat
                                                            </motion.button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Menampilkan {filteredReport.length} dari {report.length} mahasiswa
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}

export default Laporan
