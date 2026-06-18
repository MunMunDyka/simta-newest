import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    CalendarCheck,
    Search,
    ChevronDown,
    ExternalLink,
    CheckCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'

// Types
interface Student {
    id: string
    _id?: string
    nim: string
    nim_nip?: string
    nama: string
    name?: string
    progress: string
    currentProgress?: string
    tanggalUpdate: string
    status: 'revisi' | 'baik' | 'menunggu' | 'acc' | 'lanjut_bab' | 'acc_sempro' | 'belum_ada'
    revisiDetail?: string
    lastBimbinganStatus?: string
    lastBimbinganVersion?: string | number
    lastBimbinganJudul?: string
    lastBimbinganAt?: string
    lastFeedbackAt?: string
    lastActionStatus?: 'revisi' | 'baik' | 'acc' | 'lanjut_bab' | 'acc_sempro'
    lastActionVersion?: string | number
    lastActionJudul?: string
    lastActionAt?: string
    pendingReviewCount?: number
    reviewStatus?: 'menunggu_review' | 'sudah_direview' | 'belum_ada'
    dosenRelation?: 'pembimbing' | 'penguji'
}

interface DosenStats {
    totalMahasiswa: number
    mengerjakanCount: number
    terpenuhi: number
    pendingReviewCount: number
    deadline: number
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true, path: '/dashboard/dosen' },
]

const aktivitasItems = [
    { label: 'Mahasiswa Bimbingan', icon: Users, path: '/dosen/mahasiswa' },
    { label: 'Jadwal Penguji', icon: CalendarCheck, path: '/dosen/jadwal-penguji' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

export const DashboardDosen = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState('')
    const [entriesPerPage, setEntriesPerPage] = useState('10')
    const [currentPage, setCurrentPage] = useState(1)
    const [filterRole, setFilterRole] = useState<'pembimbing' | 'penguji' | 'semua'>('pembimbing')

    // Data states
    const [studentsData, setStudentsData] = useState<Student[]>([])
    const [stats, setStats] = useState<DosenStats>({
        totalMahasiswa: 0,
        mengerjakanCount: 0,
        terpenuhi: 0,
        pendingReviewCount: 0,
        deadline: 30
    })
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [dosenMascotError, setDosenMascotError] = useState(false)

    // Fetch mahasiswa bimbingan
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setLoadError(null)
                const response = await api.get('/users/mahasiswa-bimbingan', {
                    params: { filterRole }
                })
                const mahasiswaList = response.data.data || []

                // Transform data
                const transformedData: Student[] = mahasiswaList.map((mhs: {
                    _id: string;
                    nim_nip: string;
                    name: string;
                    currentProgress?: string;
                    statusMahasiswa?: string;
                    updatedAt?: string;
                    lastBimbinganStatus?: Student['status'] | null;
                    lastBimbinganVersion?: string | number | null;
                    lastBimbinganJudul?: string | null;
                    lastBimbinganAt?: string | null;
                    lastFeedbackAt?: string | null;
                    lastActionStatus?: Student['lastActionStatus'] | null;
                    lastActionVersion?: string | number | null;
                    lastActionJudul?: string | null;
                    lastActionAt?: string | null;
                    pendingReviewCount?: number;
                    reviewStatus?: Student['reviewStatus'];
                    dosenRelation?: Student['dosenRelation'];
                }) => {
                    const pendingReviewCount = mhs.pendingReviewCount || 0;
                    const status = pendingReviewCount > 0
                        ? 'menunggu'
                        : (mhs.lastBimbinganStatus || 'belum_ada');
                    const displayDate = mhs.lastBimbinganAt || mhs.updatedAt;

                    return {
                        id: mhs._id,
                        _id: mhs._id,
                        nim: mhs.nim_nip,
                        nama: mhs.name,
                        progress: mhs.dosenRelation === 'penguji'
                            ? (mhs.statusMahasiswa === 'revisi_sempro'
                                ? 'BAB I - III (Revisi)'
                                : mhs.statusMahasiswa === 'revisi_semhas'
                                ? 'BAB I - V (Revisi)'
                                : mhs.statusMahasiswa === 'revisi_sidang'
                                ? 'BAB I - VI (Revisi)'
                                : mhs.currentProgress || 'BAB I')
                            : mhs.currentProgress || 'BAB I',
                        tanggalUpdate: displayDate ? new Date(displayDate).toLocaleDateString('id-ID') : '-',
                        status,
                        lastBimbinganStatus: mhs.lastBimbinganStatus || undefined,
                        lastBimbinganVersion: mhs.lastBimbinganVersion || undefined,
                        lastBimbinganJudul: mhs.lastBimbinganJudul || undefined,
                        lastBimbinganAt: mhs.lastBimbinganAt || undefined,
                        lastFeedbackAt: mhs.lastFeedbackAt || undefined,
                        lastActionStatus: mhs.lastActionStatus || undefined,
                        lastActionVersion: mhs.lastActionVersion || undefined,
                        lastActionJudul: mhs.lastActionJudul || undefined,
                        lastActionAt: mhs.lastActionAt || undefined,
                        pendingReviewCount,
                        reviewStatus: mhs.reviewStatus || (status === 'belum_ada' ? 'belum_ada' : status === 'menunggu' ? 'menunggu_review' : 'sudah_direview'),
                        dosenRelation: mhs.dosenRelation
                    }
                })

                setStudentsData(transformedData)

                // Calculate stats
                const pendingReviewCount = transformedData.filter((s: Student) => (s.pendingReviewCount || 0) > 0).length
                const mengerjakanCount = transformedData.filter((s: Student) => s.status !== 'acc' && s.status !== 'acc_sempro').length
                const terpenuhi = transformedData.filter((s: Student) => s.status === 'acc' || s.status === 'acc_sempro').length

                setStats({
                    totalMahasiswa: transformedData.length,
                    mengerjakanCount,
                    terpenuhi,
                    pendingReviewCount,
                    deadline: 30
                })
            } catch (error) {
                console.error('Failed to fetch mahasiswa:', error)
                setLoadError(getApiErrorMessage(error, 'Gagal memuat data mahasiswa bimbingan. Silakan refresh halaman.'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [filterRole])

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

    const getStatusBadge = (student: Student) => {
        const statusConfig = {
            revisi: {
                label: `Sudah Direview - Revisi${student.revisiDetail ? ` ${student.revisiDetail}` : ''}`,
                className: 'bg-red-100 text-red-600 hover:bg-red-100'
            },
            baik: {
                label: 'Sudah Direview - Baik',
                className: 'bg-green-100 text-green-600 hover:bg-green-100'
            },
            menunggu: {
                label: `Menunggu Review${student.pendingReviewCount && student.pendingReviewCount > 1 ? ` (${student.pendingReviewCount})` : ''}`,
                className: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-100'
            },
            acc: {
                label: 'Sudah Direview - ACC',
                className: 'bg-green-100 text-green-600 hover:bg-green-100'
            },
            lanjut_bab: {
                label: 'Sudah Direview - Lanjut BAB',
                className: 'bg-blue-100 text-blue-600 hover:bg-blue-100'
            },
            acc_sempro: {
                label: 'Sudah Direview - ACC Sidang',
                className: 'bg-purple-100 text-purple-600 hover:bg-purple-100'
            },
            belum_ada: {
                label: 'Belum Ada Bimbingan',
                className: 'bg-gray-100 text-gray-600 hover:bg-gray-100'
            }
        } as const;
        const config = statusConfig[student.status];

        if (config) {
            return (
                <Badge className={`${config.className} border-0 font-medium`}>
                    {config.label}
                </Badge>
            );
        }

        return (
            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 font-medium">
                Status tidak diketahui
            </Badge>
        )
    }

    const getProgressBadge = (progress: string) => {
        const normalizedProgress = (progress || 'BAB I').toUpperCase()
        const progressConfig: Record<string, { label: string; className: string }> = {
            'BAB I': {
                label: 'BAB I',
                className: 'bg-blue-50 text-blue-700 ring-blue-200'
            },
            'BAB II': {
                label: 'BAB II',
                className: 'bg-cyan-50 text-cyan-700 ring-cyan-200'
            },
            'BAB III': {
                label: 'BAB III',
                className: 'bg-amber-50 text-amber-700 ring-amber-200'
            },
            'BAB IV': {
                label: 'BAB IV',
                className: 'bg-indigo-50 text-indigo-700 ring-indigo-200'
            },
            'BAB V': {
                label: 'BAB V',
                className: 'bg-emerald-50 text-emerald-700 ring-emerald-200'
            },
            'BAB VI': {
                label: 'BAB VI',
                className: 'bg-violet-50 text-violet-700 ring-violet-200'
            },
            'BAB I - III (REVISI)': {
                label: 'BAB I - III (Revisi)',
                className: 'bg-purple-50 text-purple-700 ring-purple-200'
            },
            'BAB I - V (REVISI)': {
                label: 'BAB I - V (Revisi)',
                className: 'bg-purple-50 text-purple-700 ring-purple-200'
            },
            'BAB I - VI (REVISI)': {
                label: 'BAB I - VI (Revisi)',
                className: 'bg-purple-50 text-purple-700 ring-purple-200'
            },
            'SELESAI': {
                label: 'Selesai',
                className: 'bg-green-50 text-green-700 ring-green-200'
            }
        }
        const config = progressConfig[normalizedProgress] || {
            label: progress || 'BAB I',
            className: 'bg-slate-50 text-slate-700 ring-slate-200'
        }

        return (
            <span className={`inline-flex min-w-[76px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${config.className}`}>
                {config.label}
            </span>
        )
    }

    const getActionBadge = (status?: Student['lastActionStatus']) => {
        const actionConfig = {
            revisi: {
                label: 'Revisi',
                className: 'bg-red-50 text-red-600'
            },
            baik: {
                label: 'Baik',
                className: 'bg-green-50 text-green-600'
            },
            acc: {
                label: 'ACC',
                className: 'bg-green-50 text-green-600'
            },
            lanjut_bab: {
                label: 'Lanjut BAB',
                className: 'bg-blue-50 text-blue-600'
            },
            acc_sempro: {
                label: 'ACC Sidang',
                className: 'bg-purple-50 text-purple-600'
            }
        } as const

        const config = status ? actionConfig[status] : undefined

        return (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config?.className || 'bg-gray-50 text-gray-600'}`}>
                {config?.label || 'Aksi'}
            </span>
        )
    }

    const formatHistoryDate = (value?: string) => {
        if (!value) return '-'

        return new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const filteredStudents = studentsData.filter(student =>
        student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nim.includes(searchQuery)
    )

    const pageSize = parseInt(entriesPerPage, 10) || 10
    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)
    const startIndex = (safeCurrentPage - 1) * pageSize
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize)
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2))
        const end = Math.min(totalPages, start + maxVisible - 1)

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let page = start; page <= end; page++) {
            pages.push(page)
        }

        return pages
    }
    const recentActions = studentsData
        .filter((student) => Boolean(student.lastActionStatus && student.lastActionAt))
        .sort((a, b) => new Date(b.lastActionAt || 0).getTime() - new Date(a.lastActionAt || 0).getTime())
        .slice(0, 5)

    useEffect(() => {
        setCurrentPage(1)
    }, [entriesPerPage, searchQuery])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

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
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0">
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
                <div className="p-6 border-b border-gray-100 relative z-10">
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                            Main Menu
                        </p>
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => (
                                <motion.li
                                    key={item.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                            Aktivitas Bimbingan
                        </p>
                        <ul className="space-y-1">
                            {aktivitasItems.map((item, index) => (
                                <motion.li
                                    key={item.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                    <motion.button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
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
                    <motion.p
                        className="text-xs text-blue-700 font-medium text-center drop-shadow-sm"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        Institut Teknologi Batam 2025
                    </motion.p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header
                    className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <motion.button
                                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
                                whileHover={{ scale: 1.02 }}
                            >
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
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => navigate('/profile/dosen')}
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

                        {/* Greeting */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1"
                        >
                            <motion.div
                                variants={cardVariants}
                                className="relative min-h-[104px] overflow-hidden bg-white rounded-2xl px-6 py-5 pl-[82px] shadow-sm border border-gray-100"
                            >
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-50/80 via-blue-50/30 to-transparent" />
                                <div className="pointer-events-none absolute -right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full border border-blue-100/80" />
                                <div className="pointer-events-none absolute right-10 top-6 h-2 w-2 rounded-full bg-blue-300/60" />
                                <div className="pointer-events-none absolute right-20 bottom-7 h-1.5 w-1.5 rounded-full bg-cyan-300/70" />
                                <motion.div
                                    className="absolute left-0 top-1/2 h-24 w-24 -translate-y-1/2 flex items-center justify-start"
                                    whileHover={{ scale: 1.04 }}
                                    transition={{ type: 'spring' as const, stiffness: 300 }}
                                >
                                    {dosenMascotError ? (
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-md border border-blue-100">
                                            <Users className="w-8 h-8 text-blue-600" />
                                        </div>
                                    ) : (
                                        <img
                                            src="/maskot_siakad.png"
                                            alt="Maskot ITEBA"
                                            className="h-25 w-25 object-contain object-left"
                                            onError={() => setDosenMascotError(true)}
                                        />
                                    )}
                                </motion.div>
                                <div className="relative z-10 flex min-h-16 items-center">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-bold text-gray-800 leading-tight truncate">
                                            Hi, {user?.name || 'Dosen Pembimbing'}
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500 leading-tight">
                                            {user?.nim_nip || 'NIP belum tersedia'} &middot; Dosen Pembimbing
                                        </p>
                                        <p className="mt-1.5 text-xs text-blue-500 font-medium italic leading-tight">
                                            Pantau bimbingan dan tindak lanjuti review mahasiswa.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Stats Cards */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {/* Card 1 - Mengerjakan */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mahasiswa</p>
                                        <h3 className="font-bold text-gray-800">Bimbingan Aktif</h3>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                                    <p className="text-3xl font-bold text-blue-700">{stats.totalMahasiswa}</p>
                                </div>
                            </motion.div>

                            {/* Card 2 - Terpenuhi */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Syarat</p>
                                        <h3 className="font-bold text-gray-800">Terpenuhi</h3>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-green-100 bg-green-50/70 px-4 py-3">
                                    <p className="text-3xl font-bold text-green-700">{stats.terpenuhi}</p>
                                </div>
                            </motion.div>

                            {/* Card 3 - Pending Review */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Review</p>
                                        <h3 className="font-bold text-gray-800">Menunggu</h3>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-orange-100 bg-orange-50/80 px-4 py-3">
                                    <p className="text-3xl font-bold text-orange-700">{stats.pendingReviewCount}</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Table Section */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            {/* Table Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Show</span>
                                            <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                                                <SelectTrigger className="w-20 h-9 bg-gray-50 border-gray-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5</SelectItem>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="25">25</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm text-gray-600">entries</span>
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 h-9 w-64 bg-gray-50 border-gray-200 focus:border-blue-500 rounded-xl"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 font-medium">Peran:</span>
                                            <Select value={filterRole} onValueChange={(val: any) => setFilterRole(val)}>
                                                <SelectTrigger className="w-44 h-9 bg-gray-50 border-gray-200 focus:border-blue-500 rounded-xl">
                                                    <SelectValue placeholder="Pilih Peran" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pembimbing">Pembimbing</SelectItem>
                                                    <SelectItem value="penguji">Pengujian</SelectItem>
                                                    <SelectItem value="semua">Semua</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    variant="outline"
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                                                >
                                                    Recent History
                                                </Button>
                                            </motion.div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-96 rounded-2xl p-0 overflow-hidden">
                                            <div className="p-4 border-b border-gray-100">
                                                <DropdownMenuLabel className="p-0 text-sm font-bold text-gray-800">
                                                    Aksi Review Terakhir
                                                </DropdownMenuLabel>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Riwayat feedback terbaru yang sudah diberikan dosen.
                                                </p>
                                            </div>

                                            <div className="max-h-80 overflow-auto p-2">
                                                {recentActions.length === 0 ? (
                                                    <div className="px-3 py-6 text-center">
                                                        <Clock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                                        <p className="text-sm font-medium text-gray-600">Belum ada aksi review</p>
                                                        <p className="mt-1 text-xs text-gray-400">Aksi akan muncul setelah dosen memberi feedback.</p>
                                                    </div>
                                                ) : (
                                                    recentActions.map((student) => (
                                                        <button
                                                            key={`${student.id}-${student.lastActionAt}`}
                                                            type="button"
                                                            onClick={() => navigate(`/bimbingan/dosen/${student.id}`)}
                                                            className="w-full rounded-xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-semibold text-gray-800">{student.nama}</p>
                                                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                                                        {student.lastActionJudul || 'Bimbingan'} {student.lastActionVersion ? `(${student.lastActionVersion})` : ''}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-gray-400">
                                                                        {formatHistoryDate(student.lastActionAt)}
                                                                    </p>
                                                                </div>
                                                                {getActionBadge(student.lastActionStatus)}
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                                            <TableHead className="h-12 text-center font-semibold text-gray-700">NIM</TableHead>
                                            <TableHead className="h-12 font-semibold text-gray-700">NAMA</TableHead>
                                            <TableHead className="h-12 font-semibold text-gray-700">PROGRESS</TableHead>
                                            <TableHead className="h-12 text-center font-semibold text-gray-700">PERAN</TableHead>
                                            <TableHead className="h-12 text-center font-semibold text-gray-700">TANGGAL UPDATE</TableHead>
                                            <TableHead className="h-12 text-center font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="h-12 w-32 font-semibold text-gray-700 text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-32">
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                        <span className="ml-3 text-gray-500">Memuat data...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-32">
                                                    <div className="flex flex-col items-center justify-center text-center py-8">
                                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                            <Users className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                                                            {filterRole === 'penguji' ? 'Belum ada mahasiswa pengujian' : 'Belum ada mahasiswa bimbingan'}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {searchQuery
                                                                ? 'Tidak ada mahasiswa yang sesuai dengan pencarian'
                                                                : filterRole === 'penguji'
                                                                    ? 'Anda belum ditugaskan sebagai penguji'
                                                                    : 'Anda belum memiliki mahasiswa bimbingan'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedStudents.map((student, index) => (
                                                <motion.tr
                                                    key={student.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                    className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
                                                >
                                                    <TableCell className="py-4 text-center font-medium text-gray-700">{student.nim}</TableCell>
                                                    <TableCell className="py-4 font-semibold text-gray-800">{student.nama}</TableCell>
                                                    <TableCell className="py-4">{getProgressBadge(student.progress)}</TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        {student.dosenRelation === 'penguji' ? (
                                                            <Badge className="bg-purple-100 text-purple-700 border-0 font-medium hover:bg-purple-100">
                                                                Penguji
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-blue-100 text-blue-700 border-0 font-medium hover:bg-blue-100">
                                                                Pembimbing
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center text-gray-600">{student.tanggalUpdate}</TableCell>
                                                    <TableCell className="py-4 text-center">{getStatusBadge(student)}</TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <motion.button
                                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-sm font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50 hover:border-blue-300"
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            onClick={() => navigate(`/bimbingan/dosen/${student.id}`)}
                                                            aria-label={`Buka detail bimbingan ${student.nama}`}
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            Detail
                                                        </motion.button>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-800"
                                    onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                                    disabled={safeCurrentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>

                                {getPageNumbers().map((page) => (
                                    <motion.button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg font-medium transition-all ${safeCurrentPage === page
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {page}
                                    </motion.button>
                                ))}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-800"
                                    onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </div >
    )
}
