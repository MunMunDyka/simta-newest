import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    Calendar,
    CalendarCheck,
    ChevronDown,
    LogOut,
    User,
    Download,
    FileEdit,
    Eye,
    Clock,
    MapPin,
    Users,
    CalendarDays,
    CheckCircle,
    XCircle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { RoleSwitchMenuItem } from '@/components/RoleSwitchMenuItem'
import { getApiErrorMessage } from '@/lib/errorMessage'

// Types
interface JadwalSidangItem {
    no: number
    tanggal: string
    waktu: string
    nim: string
    nama: string
    judul: string
    pembimbing1: string
    pembimbing2: string
    penguji1: string
    penguji2: string
    ruangan: string
    status: string
}

// Menu items untuk mahasiswa
const mahasiswaMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/mahasiswa' },
]
const mahasiswaAktivitasItems = [
    { label: 'Bimbingan', icon: FileEdit, path: '/bimbingan/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, active: true, path: '/jadwal-sidang' },
]

// Menu items untuk dosen
const dosenMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/dosen' },
]
const dosenAktivitasItems = [
    { label: 'Mahasiswa Bimbingan', icon: Users, path: '/dosen/mahasiswa' },
    { label: 'Jadwal Penguji', icon: CalendarCheck, path: '/dosen/jadwal-penguji' },
    { label: 'Jadwal Sidang', icon: Calendar, active: true, path: '/jadwal-sidang' },
]

// Menu items untuk admin
const adminMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
]
const adminAktivitasItems = [
    { label: 'Manajemen User', icon: Users, path: '/admin/users' },
    { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
    { label: 'Jadwal Sidang', icon: CalendarCheck, active: true, path: '/jadwal-sidang' },
]

export const JadwalSidang = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [jenisJadwalFilter, setJenisJadwalFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('dijadwalkan')
    const [ruanganFilter, setRuanganFilter] = useState('all')
    const [dosenFilter, setDosenFilter] = useState('all')
    const [jadwalData, setJadwalData] = useState<JadwalSidangItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    // Fetch jadwal data from API
    useEffect(() => {
        const fetchJadwal = async () => {
            try {
                setIsLoading(true)
                setLoadError(null)
                const params: Record<string, string | number> = { limit: 500, viewAll: 'true' }
                if (jenisJadwalFilter !== 'all') {
                    params.jenisJadwal = jenisJadwalFilter
                }
                if (statusFilter !== 'all') {
                    params.status = statusFilter
                }
                const response = await api.get('/jadwal', { params })

                const jadwalList = response.data.data || []

                // Transform data
                const transformed: JadwalSidangItem[] = jadwalList.map((jadwal: {
                    _id: string
                    mahasiswa?: { name?: string; nim_nip?: string; judulTA?: string; dospem_1?: { name?: string }; dospem_2?: { name?: string } }
                    tanggal: string
                    waktuMulai: string
                    waktuSelesai?: string
                    ruangan?: string
                    penguji?: { name?: string }[]
                    status: string
                }, index: number) => {
                    const tanggalObj = new Date(jadwal.tanggal)
                    const tanggalFormatted = tanggalObj.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })

                    return {
                        no: index + 1,
                        tanggal: tanggalFormatted,
                        waktu: jadwal.waktuSelesai
                            ? `${jadwal.waktuMulai} - ${jadwal.waktuSelesai}`
                            : jadwal.waktuMulai,
                        nim: jadwal.mahasiswa?.nim_nip || '-',
                        nama: jadwal.mahasiswa?.name || '-',
                        judul: jadwal.mahasiswa?.judulTA || '-',
                        pembimbing1: jadwal.mahasiswa?.dospem_1?.name || '-',
                        pembimbing2: jadwal.mahasiswa?.dospem_2?.name || '',
                        penguji1: jadwal.penguji?.[0]?.name || '-',
                        penguji2: jadwal.penguji?.[1]?.name || '-',
                        ruangan: jadwal.ruangan || 'B302',
                        status: jadwal.status || 'dijadwalkan'
                    }
                })

                setJadwalData(transformed)
            } catch (error) {
                console.error('Failed to fetch jadwal:', error)
                setLoadError(getApiErrorMessage(error, 'Gagal memuat jadwal sidang. Silakan refresh halaman.'))
                // Fallback to empty array if API fails
                setJadwalData([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchJadwal()
    }, [jenisJadwalFilter, statusFilter])

    // Determine navigation and profile from the selected mode for multi-role users.
    const activeRole = user?.activeRole || user?.role
    const isDosen = activeRole === 'dosen'
    const isAdmin = activeRole === 'admin'

    const menuItems = isAdmin ? adminMenuItems : isDosen ? dosenMenuItems : mahasiswaMenuItems
    const aktivitasItems = isAdmin ? adminAktivitasItems : isDosen ? dosenAktivitasItems : mahasiswaAktivitasItems
    const profilePath = isAdmin ? '/admin/profile' : isDosen ? '/profile/dosen' : '/profile/mahasiswa'

    const ruanganOptions = useMemo(() => {
        return Array.from(new Set(jadwalData.map(j => j.ruangan).filter(Boolean))).sort()
    }, [jadwalData])

    const dosenOptions = useMemo(() => {
        return Array.from(new Set(
            jadwalData
                .flatMap(j => [j.penguji1, j.penguji2])
                .filter((name) => name && name !== '-')
        )).sort()
    }, [jadwalData])

    useEffect(() => {
        if (ruanganFilter !== 'all' && !ruanganOptions.includes(ruanganFilter)) {
            setRuanganFilter('all')
        }
        if (dosenFilter !== 'all' && !dosenOptions.includes(dosenFilter)) {
            setDosenFilter('all')
        }
    }, [ruanganFilter, ruanganOptions, dosenFilter, dosenOptions])

    const filteredJadwalData = useMemo(() => {
        return jadwalData.filter(jadwal => {
            const matchesRuangan = ruanganFilter === 'all' || jadwal.ruangan === ruanganFilter
            const matchesDosen = dosenFilter === 'all' || jadwal.penguji1 === dosenFilter || jadwal.penguji2 === dosenFilter
            return matchesRuangan && matchesDosen
        })
    }, [jadwalData, ruanganFilter, dosenFilter])

    const totalSesi = useMemo(() => {
        return new Set(filteredJadwalData.map(j => j.waktu)).size
    }, [filteredJadwalData])

    const totalRuangan = useMemo(() => {
        return new Set(filteredJadwalData.map(j => j.ruangan).filter(Boolean)).size
    }, [filteredJadwalData])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'selesai':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>
            case 'dibatalkan':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0"><XCircle className="w-3 h-3 mr-1" />Dibatalkan</Badge>
            case 'berlangsung':
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0"><Clock className="w-3 h-3 mr-1" />Berlangsung</Badge>
            default:
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"><Clock className="w-3 h-3 mr-1" />Terjadwal</Badge>
        }
    }

    const getStatusFilterLabel = () => {
        switch (statusFilter) {
            case 'dijadwalkan': return 'Terjadwal'
            case 'berlangsung': return 'Berlangsung'
            case 'selesai': return 'Selesai'
            case 'dibatalkan': return 'Dibatalkan'
            default: return 'Semua Status'
        }
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
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(219, 234, 254, 0.6)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(191, 219, 254, 0.5)" />
                        <path d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z" fill="rgba(147, 197, 253, 0.4)" />
                        <path d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z" fill="rgba(96, 165, 250, 0.3)" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring' as const, stiffness: 300 }}
                    >
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
                    {/* Main Menu */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${'active' in item && item.active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
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

                    {/* Aktivitas Bimbingan */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Aktivitas Bimbingan</p>
                        <ul className="space-y-1">
                            {aktivitasItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${'active' in item && item.active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
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
                </nav>

                {/* Footer */}
                <div className="p-4 relative z-10">
                    <motion.p className="text-xs text-blue-700 font-medium text-center drop-shadow-sm" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
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
                    transition={{ delay: 0.2 }}
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Jadwal Sidang</h1>
                        {/* <p className="text-sm text-gray-500">Jadwal Sidang Tugas Akhir</p> */}
                    </div>

                    <div className="flex items-center gap-4">

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors" whileHover={{ scale: 1.02 }}>
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
                                <RoleSwitchMenuItem />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => navigate(profilePath)}
                                >
                                    <User className="w-4 h-4 mr-2" />Profile
                                </DropdownMenuItem>                                <DropdownMenuSeparator />
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
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <FeedbackAlert message={loadError} onClose={() => setLoadError(null)} />

                        {/* Header + Filter Combined */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Title Section */}
                                <div>
                                    {/* <h1 className="text-xl font-bold text-gray-800">Jadwal Sidang</h1> */}
                                    <p className="text-sm text-gray-500">Lihat jadwal sidang tugas akhir</p>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Jenis Sidang */}
                                    <Select value={jenisJadwalFilter} onValueChange={setJenisJadwalFilter}>
                                        <SelectTrigger className="w-44 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                                            <SelectValue placeholder="Jenis Sidang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Ujian</SelectItem>
                                            <SelectItem value="sidang_proposal">Seminar Proposal</SelectItem>
                                            <SelectItem value="sidang_semhas">Seminar Hasil</SelectItem>
                                            <SelectItem value="sidang_skripsi">Sidang Akhir</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Status Jadwal */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-40 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm">
                                            <SelectValue placeholder="Status Jadwal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dijadwalkan">Terjadwal</SelectItem>
                                            <SelectItem value="berlangsung">Berlangsung</SelectItem>
                                            <SelectItem value="selesai">Selesai</SelectItem>
                                            <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Ruangan */}
                                    <Select value={ruanganFilter} onValueChange={setRuanganFilter}>
                                        <SelectTrigger className="w-32 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm">
                                            <SelectValue placeholder="Ruangan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Ruang</SelectItem>
                                            {ruanganOptions.map((room) => (
                                                <SelectItem key={room} value={room}>{room}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Dosen Penguji */}
                                    <Select value={dosenFilter} onValueChange={setDosenFilter}>
                                        <SelectTrigger className="w-52 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm">
                                            <SelectValue placeholder="Dosen Penguji" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Dosen</SelectItem>
                                            {dosenOptions.map((dosen) => (
                                                <SelectItem key={dosen} value={dosen}>{dosen}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 ml-2">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button variant="outline" size="sm" className="rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 h-9">
                                                <Eye className="w-4 h-4 mr-1.5" />
                                                Preview
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg h-9">
                                                <Download className="w-4 h-4 mr-1.5" />
                                                Download PDF
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Info Cards */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <CalendarDays className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{filteredJadwalData.length}</p>
                                    <p className="text-xs text-gray-500">Total Sidang</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{filteredJadwalData.length}</p>
                                    <p className="text-xs text-gray-500">Mahasiswa</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{totalSesi}</p>
                                    <p className="text-xs text-gray-500">Sesi Waktu</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{totalRuangan}</p>
                                    <p className="text-xs text-gray-500">Ruangan</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Table Section */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Table Title */}
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                                        {jenisJadwalFilter === 'all'
                                            ? 'Jadwal Ujian Tugas Akhir'
                                            : jenisJadwalFilter === 'sidang_proposal'
                                                ? 'Jadwal Seminar Proposal Tugas Akhir'
                                                : jenisJadwalFilter === 'sidang_semhas'
                                                    ? 'Jadwal Seminar Hasil Tugas Akhir'
                                                    : 'Jadwal Sidang Akhir Tugas Akhir'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">Sistem Informasi</p>
                                    <Badge className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                                        {getStatusFilterLabel()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table className="text-sm">
                                    <TableHeader>
                                        <TableRow className="bg-blue-600 hover:bg-blue-600">
                                            <TableHead className="text-white font-semibold text-center text-xs py-3 px-3 w-12">No</TableHead>
                                            <TableHead className="text-white font-semibold text-xs py-3 px-3">Tanggal</TableHead>
                                            <TableHead className="text-white font-semibold text-xs py-3 px-3">Waktu</TableHead>
                                            <TableHead className="text-white font-semibold text-xs py-3 px-3">Mahasiswa</TableHead>
                                            <TableHead className="text-white font-semibold text-xs py-3 px-3">Judul</TableHead>
                                            <TableHead className="text-white font-semibold text-xs py-3 px-3">Penguji</TableHead>
                                            <TableHead className="text-white font-semibold text-xs py-3 px-3 text-center">Ruang</TableHead>
                                            <TableHead className="text-white font-semibold text-xs py-3 px-3 text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                                                        <p className="text-gray-500 text-sm">Memuat data jadwal...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredJadwalData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Calendar className="w-12 h-12 text-gray-300" />
                                                        <p className="text-gray-500">Belum ada jadwal sidang</p>
                                                        <p className="text-gray-400 text-sm">Jadwal sidang akan muncul setelah dijadwalkan oleh admin</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredJadwalData.map((jadwal, index) => (
                                                <motion.tr
                                                    key={jadwal.no}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.03 * index }}
                                                    className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                                >
                                                    <TableCell className="text-center font-medium text-gray-700 py-3 px-3">{index + 1}</TableCell>
                                                    <TableCell className="text-gray-700 py-3 px-3 whitespace-nowrap text-xs">{jadwal.tanggal.split(', ')[1] || jadwal.tanggal}</TableCell>
                                                    <TableCell className="text-gray-700 py-3 px-3 whitespace-nowrap text-xs">{jadwal.waktu}</TableCell>
                                                    <TableCell className="py-3 px-3">
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-xs">{jadwal.nama}</p>
                                                            <p className="text-gray-400 text-xs">{jadwal.nim}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 px-3 align-top" style={{ maxWidth: '320px' }}>
                                                        <p className="text-gray-600 text-xs leading-relaxed whitespace-normal break-words">{jadwal.judul}</p>
                                                    </TableCell>
                                                    <TableCell className="py-3 px-3">
                                                        <div className="space-y-0.5">
                                                            <p className="text-gray-700 text-xs">1. {jadwal.penguji1.split(',')[0]}</p>
                                                            <p className="text-gray-500 text-xs">2. {jadwal.penguji2.split(',')[0]}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-3 px-3">
                                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 font-semibold text-xs">
                                                            {jadwal.ruangan}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center py-3 px-3">
                                                        {getStatusBadge(jadwal.status)}
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Table Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Menampilkan {filteredJadwalData.length} dari {jadwalData.length} jadwal sidang
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        * Jadwal dapat berubah sewaktu-waktu. Harap konfirmasi dengan prodi.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </main>
            </div>
        </div>
    )
}
