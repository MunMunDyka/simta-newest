import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    LayoutDashboard,
    Users,
    Calendar,
    ChevronDown,
    LogOut,
    User,
    Search,
    FileText,
    GraduationCap,
    Eye,
    BookOpen
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'

// Interfaces
interface DosenWorkload {
    _id: string
    name: string
    nim_nip: string
    email: string
    status: 'aktif' | 'nonaktif'
    avatar?: string
    whatsapp?: string
    workload: {
        pembimbing1: number
        pembimbing2: number
        penguji1: number
        penguji2: number
        totalPembimbing: number
        totalPenguji: number
        total: number
    }
}

interface MahasiswaData {
    _id: string
    name: string
    nim_nip: string
    prodi?: string
    statusMahasiswa?: string
}

interface MahasiswaBimbingan {
    _id: string
    name: string
    nim_nip: string
    prodi?: string
    currentProgress?: string
    judulTA?: string
    dosenRelation: 'pembimbing' | 'penguji'
}

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/admin/dashboard' },
]

const managementItems = [
    { label: 'Manajemen User', icon: Users, path: '/admin/users' },
    { label: 'Manajemen Dosen', icon: GraduationCap, active: true, path: '/admin/plotting' },
    { label: 'Kelola Bimbingan', icon: FileText, path: '/admin/bimbingan' },
    { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
]

const reportItems = [
    { label: 'Laporan', icon: FileText, path: '/admin/laporan' },
]

export const KelolaPlottingDosen = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    // Data States
    const [lecturers, setLecturers] = useState<DosenWorkload[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch Dosen Workloads
    const fetchWorkloads = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await api.get('/users/dosen-workloads')
            setLecturers(response.data.data || [])
        } catch (err) {
            console.error('Failed to fetch workloads:', err)
            setError(getApiErrorMessage(err, 'Gagal memuat data beban kerja dosen.'))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWorkloads()
    }, [])

    // View Detail Dosen
    const handleViewDetail = (dosen: DosenWorkload) => {
        navigate(`/admin/users/dosen/${dosen._id}`)
    }

    // Filtered Lecturers List
    const filteredLecturers = lecturers.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.nim_nip.includes(searchQuery)
    )

    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } }
    }

    const sidebarVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
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
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 256 200" className="w-full h-auto" preserveAspectRatio="none">
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(254, 215, 170, 0.5)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(253, 186, 116, 0.4)" />
                    </svg>
                </div>

                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <img src="/LOGO-ITEBA-TOPBAR.png" alt="ITEBA Logo" className="h-12 w-auto" />
                        <div>
                            <h1 className="text-xl font-bold tracking-wider text-gray-800">SIMTA</h1>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-6 relative z-10">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-medium"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Kelola Data</p>
                        <ul className="space-y-1">
                            {managementItems.map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Laporan</p>
                        <ul className="space-y-1">
                            {reportItems.map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-medium"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className="p-4 relative z-10">
                    <p className="text-xs text-orange-700 font-medium text-center">
                        Institut Teknologi Batam 2025
                    </p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header
                    className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Manajemen Dosen</h1>
                        <p className="text-sm text-gray-500">Kelola detail dosen, monitoring beban kerja, dan plotting pembimbing/penguji</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-all">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                                            {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>{user?.name || 'Administrator'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                                    <User className="w-4 h-4 mr-2" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/')
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Dashboard View */}
                <main className="flex-1 p-6 overflow-auto">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <FeedbackAlert message={error} onClose={() => setError(null)} />

                        {/* Search & Actions */}
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari NIP atau nama dosen..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 rounded-xl"
                                />
                            </div>
                        </motion.div>

                        {/* Workload Table */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Memuat data dosen dan beban kerja...</p>
                                </div>
                            ) : filteredLecturers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Dosen tidak ditemukan</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-gray-50/75">
                                        <TableRow>
                                            <TableHead className="font-semibold text-gray-700">Dosen</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Pembimbing 1</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Pembimbing 2</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Penguji 1</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Penguji 2</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Total Bimbingan</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Total Pengujian</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Total Beban</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLecturers.map((lecturer) => (
                                            <TableRow key={lecturer._id} className="hover:bg-gray-50/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10 border border-gray-100">
                                                            <AvatarImage src={lecturer.avatar} />
                                                            <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-xs">
                                                                {lecturer.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 leading-tight">{lecturer.name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">NIP: {lecturer.nim_nip}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">{lecturer.workload.pembimbing1}</TableCell>
                                                <TableCell className="text-center font-medium">{lecturer.workload.pembimbing2}</TableCell>
                                                <TableCell className="text-center font-medium">{lecturer.workload.penguji1}</TableCell>
                                                <TableCell className="text-center font-medium">{lecturer.workload.penguji2}</TableCell>
                                                <TableCell className="text-center font-semibold text-blue-600">{lecturer.workload.totalPembimbing}</TableCell>
                                                <TableCell className="text-center font-semibold text-purple-600">{lecturer.workload.totalPenguji}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={`border-0 font-semibold px-2 py-0.5 ${lecturer.workload.total > 6 ? 'bg-red-100 text-red-700 hover:bg-red-100' : lecturer.workload.total > 3 ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' : 'bg-green-100 text-green-700 hover:bg-green-100'}`}>
                                                        {lecturer.workload.total} Mahasiswa
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewDetail(lecturer)}
                                                            className="rounded-lg h-8 gap-1.5 text-gray-600 hover:text-gray-900"
                                                        >
                                                            <Eye className="w-4 h-4" /> Detail
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}

export default KelolaPlottingDosen
