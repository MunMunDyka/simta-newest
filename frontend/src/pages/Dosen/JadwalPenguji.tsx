import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    Calendar,
    ChevronDown,
    LogOut,
    User,
    Clock,
    MapPin,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'


interface JadwalSidangItem {
    _id: string
    mahasiswa: {
        _id: string
        name: string
        nim_nip: string
        judulTA?: string
        prodi?: string
    }
    jenisJadwal: 'sidang_proposal' | 'sidang_semhas' | 'sidang_skripsi'
    tanggal: string
    waktuMulai: string
    waktuSelesai?: string
    ruangan?: string
    penguji: { _id: string; name: string }[]
    status: 'dijadwalkan' | 'selesai' | 'dibatalkan'
}

export const JadwalPenguji = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [jadwalList, setJadwalList] = useState<JadwalSidangItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    // Helper functions for timeline color coding
    const isToday = (tanggalStr: string) => {
        const examDate = new Date(tanggalStr)
        const today = new Date()
        return examDate.toDateString() === today.toDateString()
    }

    const isUpcomingNear = (tanggalStr: string) => {
        const examDate = new Date(tanggalStr)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        examDate.setHours(0, 0, 0, 0)
        const diffTime = examDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // 7 days in the future
        return diffDays >= 0 && diffDays <= 7
    }

    // Priority sorting weight: Hari ini = 3, Mendekati = 2, Dijadwalkan (>7 hari) = 1, Selesai/Batal = 0
    const getSortPriority = (item: JadwalSidangItem) => {
        if (item.status === 'selesai' || item.status === 'dibatalkan') return 0
        if (isToday(item.tanggal)) return 3
        if (isUpcomingNear(item.tanggal)) return 2
        return 1
    }

    // Fetch Dosen's schedules where they are the examiner
    useEffect(() => {
        const fetchJadwal = async () => {
            try {
                setIsLoading(true)
                setLoadError(null)
                // In backend controller, Dosen role is automatically restricted to see only schedules where they are penguji
                const response = await api.get('/jadwal')
                setJadwalList(response.data.data || [])
            } catch (error) {
                console.error('Failed to fetch jadwal penguji:', error)
                setLoadError(getApiErrorMessage(error, 'Gagal memuat jadwal sidang penguji.'))
            } finally {
                setIsLoading(false)
            }
        }
        fetchJadwal()
    }, [])

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    // Sorting: Urgent first (weight desc), then date asc
    const sortedJadwal = [...jadwalList].sort((a, b) => {
        const priorityA = getSortPriority(a)
        const priorityB = getSortPriority(b)
        if (priorityA !== priorityB) {
            return priorityB - priorityA
        }
        return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    })

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
            transition: { type: 'spring', stiffness: 100, damping: 12 },
        },
    }



    const formatJenisSidang = (jenis: string) => {
        switch (jenis) {
            case 'sidang_proposal':
                return 'Seminar Proposal'
            case 'sidang_semhas':
                return 'Seminar Hasil'
            case 'sidang_skripsi':
                return 'Sidang Akhir'
            default:
                return jenis
        }
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 h-20 px-8 flex items-center justify-between shadow-sm flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">Jadwal Sidang Penguji</h2>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 h-11">
                                    <Avatar className="h-8 w-8 border border-blue-100">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-blue-500 text-white font-semibold">
                                            {user?.name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden md:block">
                                        <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                                        <p className="text-xs text-gray-500">Dosen</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                                <DropdownMenuLabel className="font-normal text-xs text-gray-400 px-2.5 py-1">Akun Saya</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile/dosen')} className="rounded-lg py-2 px-2.5 text-gray-600 hover:text-blue-600">
                                    <User className="w-4 h-4 mr-2 text-gray-400" /> Profil Saya
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="rounded-lg py-2 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                                    <LogOut className="w-4 h-4 mr-2 text-red-400 group-hover:text-red-500" /> Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
                    {loadError && <FeedbackAlert type="error" message={loadError} />}

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {/* Page Title & Stats info */}
                        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Daftar seluruh jadwal ujian mahasiswa yang Anda uji. Diurutkan berdasarkan urgensi waktu.
                                </p>
                            </div>

                            {/* Legend / Petunjuk Warna */}
                            <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 shadow-sm px-4 py-2.5 rounded-xl text-xs">
                                <span className="font-semibold text-gray-500 mr-1">Petunjuk:</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 block"></span>
                                    <span className="text-amber-800 font-medium">Hari ini</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-300 block"></span>
                                    <span className="text-blue-800 font-medium">Mendekati (&le; 7 hari)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded bg-red-100 border border-red-300 block"></span>
                                    <span className="text-red-800 font-medium">Selesai</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Schedule Table Card */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                                    <p className="text-sm text-gray-500">Memuat jadwal penguji...</p>
                                </div>
                            ) : sortedJadwal.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                                        <Calendar className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Tidak ada jadwal sidang</h3>
                                    <p className="text-sm text-gray-500 max-w-sm">
                                        Anda belum ditugaskan sebagai penguji pada jadwal sidang manapun saat ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow>
                                                <TableHead className="font-semibold text-gray-700 py-4 pl-6 w-[180px]">Tanggal & Waktu</TableHead>
                                                <TableHead className="font-semibold text-gray-700 py-4">Mahasiswa</TableHead>
                                                <TableHead className="font-semibold text-gray-700 py-4">Judul TA</TableHead>
                                                <TableHead className="font-semibold text-gray-700 py-4">Jenis Sidang</TableHead>
                                                <TableHead className="font-semibold text-gray-700 py-4 w-[120px]">Ruangan</TableHead>
                                                <TableHead className="font-semibold text-gray-700 py-4 w-[140px]">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedJadwal.map((jadwal) => {
                                                const todayFlag = isToday(jadwal.tanggal)
                                                const nearFlag = isUpcomingNear(jadwal.tanggal)
                                                const isCompleted = jadwal.status === 'selesai'
                                                const isCancelled = jadwal.status === 'dibatalkan'

                                                // Determine background color based on logic
                                                let rowClass = 'bg-white hover:bg-gray-50'
                                                if (isCompleted) {
                                                    rowClass = 'bg-red-50/60 hover:bg-red-100/60 text-red-900 border-l-4 border-l-red-500'
                                                } else if (isCancelled) {
                                                    rowClass = 'bg-gray-100 hover:bg-gray-150 text-gray-600 border-l-4 border-l-gray-400'
                                                } else if (todayFlag) {
                                                    rowClass = 'bg-amber-50/60 hover:bg-amber-100/60 text-amber-900 border-l-4 border-l-amber-500 font-medium'
                                                } else if (nearFlag) {
                                                    rowClass = 'bg-blue-50/60 hover:bg-blue-100/60 text-blue-900 border-l-4 border-l-blue-500'
                                                }

                                                const tanggalFormatted = new Date(jadwal.tanggal).toLocaleDateString('id-ID', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })

                                                return (
                                                    <TableRow key={jadwal._id} className={`${rowClass} transition-colors border-b border-gray-100`}>
                                                        {/* Date & Time */}
                                                        <TableCell className="py-4 pl-6">
                                                            <div className="font-semibold">{tanggalFormatted}</div>
                                                            <div className="text-xs flex items-center gap-1 mt-1 opacity-70">
                                                                <Clock className="w-3 h-3" />
                                                                {jadwal.waktuMulai} - {jadwal.waktuSelesai || 'Selesai'}
                                                            </div>
                                                        </TableCell>

                                                        {/* Student info */}
                                                        <TableCell className="py-4">
                                                            <div className="font-semibold">{jadwal.mahasiswa?.name}</div>
                                                            <div className="text-xs opacity-70 mt-1">{jadwal.mahasiswa?.nim_nip}</div>
                                                        </TableCell>

                                                        {/* Title */}
                                                        <TableCell className="py-4 max-w-[320px]">
                                                            <p className="text-sm font-medium line-clamp-2" title={jadwal.mahasiswa?.judulTA}>
                                                                {jadwal.mahasiswa?.judulTA || '-'}
                                                            </p>
                                                        </TableCell>

                                                        {/* Type */}
                                                        <TableCell className="py-4">
                                                            <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-none font-medium px-2.5 py-1 text-xs">
                                                                {formatJenisSidang(jadwal.jenisJadwal)}
                                                            </Badge>
                                                        </TableCell>

                                                        {/* Room */}
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center gap-1 text-sm font-semibold">
                                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                                {jadwal.ruangan || '-'}
                                                            </div>
                                                        </TableCell>

                                                        {/* Status */}
                                                        <TableCell className="py-4 pr-6">
                                                            {isCompleted ? (
                                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-150 border-none font-semibold flex items-center w-fit gap-1 text-xs px-2.5 py-1">
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Selesai
                                                                </Badge>
                                                            ) : isCancelled ? (
                                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-150 border-none font-semibold flex items-center w-fit gap-1 text-xs px-2.5 py-1">
                                                                    <XCircle className="w-3.5 h-3.5" /> Dibatalkan
                                                                </Badge>
                                                            ) : todayFlag ? (
                                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-150 border-none font-semibold flex items-center w-fit gap-1 text-xs px-2.5 py-1 animate-pulse">
                                                                    <AlertCircle className="w-3.5 h-3.5" /> Hari ini
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-150 border-none font-semibold flex items-center w-fit gap-1 text-xs px-2.5 py-1">
                                                                    <Clock className="w-3.5 h-3.5" /> Dijadwalkan
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
