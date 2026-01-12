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
    Search,
    ChevronDown,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Clock,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings,
    User,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

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
    status: 'revisi' | 'baik' | 'menunggu' | 'acc' | 'lanjut_bab'
    revisiDetail?: string
    lastBimbinganStatus?: string
}

interface DosenStats {
    totalMahasiswa: number
    mengerjakanCount: number
    terpenuhi: number
    deadline: number
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true, path: '/dashboard/dosen' },
]

const aktivitasItems = [
    { label: 'Mahasiswa Bimbingan', icon: Users, path: '/dosen/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

export const DashboardDosen = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState('')
    const [entriesPerPage, setEntriesPerPage] = useState('10')
    const [currentPage, setCurrentPage] = useState(1)

    // Data states
    const [studentsData, setStudentsData] = useState<Student[]>([])
    const [stats, setStats] = useState<DosenStats>({
        totalMahasiswa: 0,
        mengerjakanCount: 0,
        terpenuhi: 0,
        deadline: 30
    })
    const [isLoading, setIsLoading] = useState(true)

    // Fetch mahasiswa bimbingan
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const response = await api.get('/users/mahasiswa-bimbingan')
                const mahasiswaList = response.data.data || []

                // Transform data
                const transformedData: Student[] = mahasiswaList.map((mhs: { _id: string; nim_nip: string; name: string; currentProgress?: string; updatedAt?: string; lastBimbinganStatus?: string }) => ({
                    id: mhs._id,
                    _id: mhs._id,
                    nim: mhs.nim_nip,
                    nama: mhs.name,
                    progress: mhs.currentProgress || 'BAB I',
                    tanggalUpdate: mhs.updatedAt ? new Date(mhs.updatedAt).toLocaleDateString('id-ID') : '-',
                    status: mhs.lastBimbinganStatus || 'menunggu'
                }))

                setStudentsData(transformedData)

                // Calculate stats
                const mengerjakanCount = transformedData.filter((s: Student) => s.status !== 'acc').length
                const terpenuhi = transformedData.filter((s: Student) => s.status === 'acc').length

                setStats({
                    totalMahasiswa: transformedData.length,
                    mengerjakanCount,
                    terpenuhi,
                    deadline: 30
                })
            } catch (error) {
                console.error('Failed to fetch mahasiswa:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

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
        switch (student.status) {
            case 'revisi':
                return (
                    <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0 font-medium">
                        Revisi ⚠️ {student.revisiDetail}
                    </Badge>
                )
            case 'baik':
                return (
                    <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0 font-medium">
                        Baik
                    </Badge>
                )
            case 'menunggu':
                return (
                    <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-100 border-0 font-medium">
                        Menunggu Review
                    </Badge>
                )
        }
    }

    const filteredStudents = studentsData.filter(student =>
        student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nim.includes(searchQuery)
    )

    const totalPages = Math.ceil(filteredStudents.length / parseInt(entriesPerPage))

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
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
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
                        {/* Stats Cards */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {/* Card 1 - Mengerjakan */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <motion.h2
                                            className="text-4xl font-bold text-gray-800"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3, type: 'spring' as const }}
                                        >
                                            {stats.mengerjakanCount}
                                        </motion.h2>
                                        <p className="text-gray-500 font-medium">Mengerjakan</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Total Mahasiswa</p>
                                        <p className="text-2xl font-bold text-blue-700">{stats.totalMahasiswa}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">
                                        <span className="text-lg font-bold text-blue-600">
                                            {stats.totalMahasiswa > 0 ? Math.round((stats.mengerjakanCount / stats.totalMahasiswa) * 100) : 0}%
                                        </span>
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 2 - Terpenuhi */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <motion.h2
                                            className="text-4xl font-bold text-gray-800"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4, type: 'spring' as const }}
                                        >
                                            {stats.terpenuhi}
                                        </motion.h2>
                                        <p className="text-gray-500 font-medium">Terpenuhi</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-4">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">Tidak Memenuhi</p>
                                        <p className="text-2xl font-bold text-green-700">{stats.totalMahasiswa - stats.terpenuhi}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm">
                                        <span className="text-lg font-bold text-red-500">
                                            {stats.totalMahasiswa > 0 ? Math.round((stats.terpenuhi / stats.totalMahasiswa) * 100) : 0}%
                                        </span>
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 3 - Deadline */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <motion.h2
                                            className="text-3xl font-bold text-red-600"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, type: 'spring' as const }}
                                        >
                                            13-03-2025
                                        </motion.h2>
                                        <p className="text-gray-500 font-medium">DEADLINE</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium">Capaian BAB</p>
                                        <p className="text-2xl font-bold text-orange-700">IV</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-xl shadow-md">
                                        <Clock className="w-4 h-4 text-white" />
                                        <span className="font-bold text-white">{stats.deadline} Hari Lagi</span>
                                    </div>
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
                                    </div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant="outline"
                                            className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                                        >
                                            Recent History
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="font-semibold text-gray-700">NIM</TableHead>
                                            <TableHead className="font-semibold text-gray-700">NAMA</TableHead>
                                            <TableHead className="font-semibold text-gray-700">PROGRESS</TableHead>
                                            <TableHead className="font-semibold text-gray-700">TANGGAL UPDATE</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32">
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                        <span className="ml-3 text-gray-500">Memuat data...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-32">
                                                    <div className="flex flex-col items-center justify-center text-center py-8">
                                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                            <Users className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-700 mb-1">Belum ada mahasiswa bimbingan</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {searchQuery
                                                                ? 'Tidak ada mahasiswa yang sesuai dengan pencarian'
                                                                : 'Anda belum memiliki mahasiswa bimbingan'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredStudents.map((student, index) => (
                                                <motion.tr
                                                    key={student.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <TableCell className="font-medium text-gray-700">{student.nim}</TableCell>
                                                    <TableCell className="text-gray-700">{student.nama}</TableCell>
                                                    <TableCell className="text-gray-600">{student.progress}</TableCell>
                                                    <TableCell className="text-gray-600">{student.tanggalUpdate}</TableCell>
                                                    <TableCell>{getStatusBadge(student)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <motion.button
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => navigate(`/bimbingan/dosen/${student.id}`)}
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
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
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>

                                {[1, 2, 3].map((page) => (
                                    <motion.button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg font-medium transition-all ${currentPage === page
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
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
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
