/**
 * ===========================================
 * List Mahasiswa Bimbingan - Dosen View
 * ===========================================
 * Halaman untuk menampilkan daftar mahasiswa yang dibimbing dosen
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    LayoutDashboard,
    Users,
    Calendar,
    CalendarCheck,
    Search,
    ChevronDown,
    LogOut,
    User,
    Eye,
    Clock,
    Download,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'

// Types
interface MahasiswaWithBimbingan {
    id: string
    nim: string
    nama: string
    avatar?: string
    judulTA: string
    progress: string
    lastUpdate: string
    sortTime: number
    pendingCount: number
    status: 'menunggu' | 'revisi' | 'baik' | 'acc' | 'lanjut_bab' | 'acc_sempro' | 'selesai' | 'belum_ada'
    isSemproReady: boolean
    dosenRelation?: 'pembimbing' | 'penguji'
}

type StatusFilter = 'semua' | 'menunggu_review' | 'sudah_direview' | MahasiswaWithBimbingan['status']

// Menu items untuk dosen
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/dosen' },
]
const aktivitasItems = [
    { label: 'Mahasiswa Bimbingan', icon: Users, active: true, path: '/dosen/mahasiswa' },
    { label: 'Jadwal Penguji', icon: CalendarCheck, path: '/dosen/jadwal-penguji' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

export const ListMahasiswaBimbingan = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState('')
    const [mahasiswaList, setMahasiswaList] = useState<MahasiswaWithBimbingan[]>([])
    const [filterRole, setFilterRole] = useState<'pembimbing' | 'penguji' | 'semua'>('pembimbing')
    const [filterStatus, setFilterStatus] = useState<StatusFilter>('semua')
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

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

    // Fetch mahasiswa bimbingan data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setLoadError(null)
                console.log('--- ListMahasiswaBimbingan: Fetching data ---');
                console.log('Requested filterRole:', filterRole);
                const response = await api.get('/users/mahasiswa-bimbingan', {
                    params: { filterRole }
                })
                const mahasiswaListFromApi = response.data.data || []
                console.log('API response count:', mahasiswaListFromApi.length, mahasiswaListFromApi);

                const mahasiswaArray: MahasiswaWithBimbingan[] = mahasiswaListFromApi.map((mhs: any) => {
                    const pendingCount = mhs.pendingReviewCount || 0
                    const isFinishedStage = ['persiapan_wisuda', 'selesai'].includes(mhs.statusMahasiswa || '')
                    const status = pendingCount > 0
                        ? 'menunggu'
                        : isFinishedStage
                            ? 'selesai'
                            : (mhs.lastBimbinganStatus || 'belum_ada')
                    const displayDate = mhs.lastBimbinganAt || mhs.updatedAt
                    
                    return {
                        id: mhs._id,
                        nim: mhs.nim_nip || '',
                        nama: mhs.name || '',
                        avatar: mhs.avatar,
                        judulTA: mhs.judulTA || 'Judul TA belum diset',
                        progress: isFinishedStage
                            ? 'Selesai'
                            : mhs.dosenRelation === 'penguji'
                            ? (mhs.statusMahasiswa === 'revisi_sempro'
                                ? 'BAB I - III (Revisi)'
                                : mhs.statusMahasiswa === 'revisi_semhas'
                                ? 'BAB I - V (Revisi)'
                                : mhs.statusMahasiswa === 'revisi_sidang'
                                ? 'BAB I - VI (Revisi)'
                                : mhs.currentProgress || 'BAB I')
                            : mhs.currentProgress || 'BAB I',
                        lastUpdate: displayDate ? new Date(displayDate).toLocaleDateString('id-ID') : '-',
                        sortTime: displayDate ? new Date(displayDate).getTime() : 0,
                        pendingCount,
                        status,
                        isSemproReady: false,
                        dosenRelation: mhs.dosenRelation
                    }
                })

                // Fetch sempro readiness only for dospem role students (parallel)
                await Promise.all(mahasiswaArray.map(async (mhs) => {
                    if (mhs.dosenRelation === 'penguji') {
                        mhs.isSemproReady = false;
                        return;
                    }
                    try {
                        const res = await api.get(`/bimbingan/sempro-status/${mhs.id}`)
                        mhs.isSemproReady = res.data.data?.isReady || false
                    } catch {
                        mhs.isSemproReady = false
                    }
                }))

                mahasiswaArray.sort((a, b) => {
                    const aWaiting = a.pendingCount > 0 || a.status === 'menunggu'
                    const bWaiting = b.pendingCount > 0 || b.status === 'menunggu'

                    if (aWaiting !== bWaiting) return aWaiting ? -1 : 1
                    if (a.pendingCount !== b.pendingCount) return b.pendingCount - a.pendingCount
                    if (a.sortTime !== b.sortTime) return b.sortTime - a.sortTime
                    return a.nama.localeCompare(b.nama)
                })

                setMahasiswaList(mahasiswaArray)
            } catch (error) {
                console.error('Failed to fetch mahasiswa:', error)
                setLoadError(getApiErrorMessage(error, 'Gagal memuat daftar mahasiswa bimbingan. Silakan refresh halaman.'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [filterRole])

    const statusMatches = (mahasiswa: MahasiswaWithBimbingan) => {
        if (filterStatus === 'semua') return true
        if (filterStatus === 'menunggu_review') return mahasiswa.pendingCount > 0 || mahasiswa.status === 'menunggu'
        if (filterStatus === 'sudah_direview') {
            return ['revisi', 'baik', 'acc', 'lanjut_bab', 'acc_sempro'].includes(mahasiswa.status)
        }
        return mahasiswa.status === filterStatus
    }

    // Filter mahasiswa based on search and status. Order is kept from mahasiswaList,
    // where pending review items are already sorted to the top.
    const filteredMahasiswa = mahasiswaList.filter(m => {
        const keyword = searchQuery.toLowerCase()
        const searchMatches = m.nama.toLowerCase().includes(keyword) || m.nim.includes(searchQuery)
        return searchMatches && statusMatches(m)
    })

    const getStatusBadge = (status: string, pendingCount: number) => {
        if (pendingCount > 0) {
            return (
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {pendingCount} Menunggu Review
                </Badge>
            )
        }
        switch (status) {
            case 'revisi':
                return <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">Revisi</Badge>
            case 'baik':
                return <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0">Baik</Badge>
            case 'acc':
                return <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0">ACC</Badge>
            case 'lanjut_bab':
                return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">Lanjut BAB</Badge>
            case 'acc_sempro':
                return <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-100 border-0">ACC Seminar</Badge>
            case 'selesai':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Selesai</Badge>
            case 'belum_ada':
                return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Belum Ada Bimbingan</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">-</Badge>
        }
    }

    const handleDownloadSurat = async (e: React.MouseEvent, mhs: MahasiswaWithBimbingan) => {
        e.stopPropagation()
        try {
            const response = await api.get(
                `/bimbingan/generate-surat-sempro/${mhs.id}`,
                { responseType: 'blob' }
            )
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Surat_Persetujuan_Sempro_${mhs.nim || mhs.nama}.docx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download surat failed:', error)
            setLoadError('Gagal mengunduh surat persetujuan sempro. Silakan coba lagi.')
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Aktivitas Bimbingan</p>
                        <ul className="space-y-1">
                            {aktivitasItems.map((item) => (
                                <motion.li key={item.label}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${item.active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
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
                    <motion.p className="text-xs text-blue-700 font-medium text-center" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>
                        Institut Teknologi Batam 2025
                    </motion.p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Mahasiswa Bimbingan</h1>
                        <p className="text-sm text-gray-500">Daftar mahasiswa yang Anda bimbing</p>
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
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => navigate('/profile/dosen')}
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

                        {/* Search & Stats */}
                        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Cari nama atau NIM mahasiswa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 rounded-xl"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Filter Peran:</span>
                                    <Select value={filterRole} onValueChange={(val: any) => setFilterRole(val)}>
                                        <SelectTrigger className="w-full sm:w-44 h-10 bg-white border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                                            <SelectValue placeholder="Pilih Peran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pembimbing">Mahasiswa Bimbingan</SelectItem>
                                            <SelectItem value="penguji">Mahasiswa Pengujian</SelectItem>
                                            <SelectItem value="semua">Semua</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Status:</span>
                                    <Select value={filterStatus} onValueChange={(val: StatusFilter) => setFilterStatus(val)}>
                                        <SelectTrigger className="w-full sm:w-48 h-10 bg-white border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semua">Semua Status</SelectItem>
                                            <SelectItem value="menunggu_review">Menunggu Review</SelectItem>
                                            <SelectItem value="sudah_direview">Sudah Direview</SelectItem>
                                            <SelectItem value="revisi">Revisi</SelectItem>
                                            <SelectItem value="acc">ACC</SelectItem>
                                            <SelectItem value="lanjut_bab">Lanjut BAB</SelectItem>
                                            <SelectItem value="acc_sempro">ACC Seminar</SelectItem>
                                            <SelectItem value="selesai">Selesai</SelectItem>
                                            <SelectItem value="belum_ada">Belum Ada Bimbingan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                                    <p className="text-2xl font-bold text-gray-800">{mahasiswaList.length}</p>
                                    <p className="text-xs text-gray-500">Total Mahasiswa</p>
                                </div>
                                <div className="bg-yellow-50 rounded-xl px-4 py-2 shadow-sm border border-yellow-100">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {mahasiswaList.filter(m => m.pendingCount > 0).length}
                                    </p>
                                    <p className="text-xs text-yellow-600">Perlu Review</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Mahasiswa List */}
                        <motion.div variants={itemVariants} className="space-y-3">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Memuat data mahasiswa...</p>
                                </div>
                            ) : filteredMahasiswa.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {filterRole === 'penguji' ? 'Belum ada mahasiswa pengujian' : 'Belum ada mahasiswa bimbingan'}
                                    </p>
                                </div>
                            ) : (
                                filteredMahasiswa.map((mahasiswa, index) => (
                                    <motion.div
                                        key={mahasiswa.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                                        onClick={() => navigate(`/bimbingan/dosen/${mahasiswa.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-12 h-12 border-2 border-blue-100">
                                                    <AvatarImage src={mahasiswa.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                        {mahasiswa.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-800">{mahasiswa.nama}</h3>
                                                        {mahasiswa.dosenRelation === 'penguji' ? (
                                                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-[10px] py-0.5 px-2 font-medium">
                                                                Penguji
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 text-[10px] py-0.5 px-2 font-medium">
                                                                Pembimbing
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{mahasiswa.nim}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-700">{mahasiswa.progress}</p>
                                                    <p className="text-xs text-gray-500">Update: {mahasiswa.lastUpdate}</p>
                                                </div>
                                                {getStatusBadge(mahasiswa.status, mahasiswa.pendingCount)}
                                                {mahasiswa.isSemproReady && (
                                                    <motion.button
                                                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => handleDownloadSurat(e, mahasiswa)}
                                                        title="Download Surat Persetujuan Sempro"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Judul TA */}
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 line-clamp-1">
                                                <span className="font-medium text-gray-700">Judul TA:</span> {mahasiswa.judulTA}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>

                    </motion.div>
                </main>
            </div>
        </div>
    )
}

export default ListMahasiswaBimbingan
