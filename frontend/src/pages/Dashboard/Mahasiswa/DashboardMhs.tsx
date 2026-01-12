/**
 * ===========================================
 * Dashboard Mahasiswa - Integrated with API
 * ===========================================
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
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
    Settings,
    User,
    MessageCircle,
    TrendingUp,
    TrendingDown,
    Clock,
    GraduationCap,
    FileEdit,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

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
    dospem_1?: DosenInfo
    dospem_2?: DosenInfo
}

interface BimbinganStats {
    lastStatus: 'menunggu' | 'revisi' | 'acc' | 'lanjut_bab' | null
    totalBimbingan: number
    pendingCount: number
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true, path: '/dashboard/mahasiswa' },
]

const aktivitasItems = [
    { label: 'Bimbingan', icon: FileEdit, path: '/bimbingan/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

export const DashboardMhs = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    // State for data from API
    const [mahasiswaData, setMahasiswaData] = useState<MahasiswaData | null>(null)
    const [bimbinganStats, setBimbinganStats] = useState<BimbinganStats>({
        lastStatus: null,
        totalBimbingan: 0,
        pendingCount: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    // Calculate deadline (dummy for now - can be set by admin later)
    const deadline = '13-03-2025'
    const daysRemaining = 30

    // Fetch mahasiswa data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)

                // Get user data with dosen pembimbing populated
                const userResponse = await api.get('/auth/me')
                const userData = userResponse.data.data
                setMahasiswaData(userData)

                // Get bimbingan stats
                try {
                    const bimbinganResponse = await api.get('/bimbingan')
                    const bimbinganList = bimbinganResponse.data.data || []

                    // Calculate stats
                    const pendingCount = bimbinganList.filter((b: { status: string }) => b.status === 'menunggu').length
                    const lastBimbingan = bimbinganList[0]

                    setBimbinganStats({
                        lastStatus: lastBimbingan?.status || null,
                        totalBimbingan: bimbinganList.length,
                        pendingCount
                    })
                } catch {
                    // Bimbingan endpoint might not have data yet
                    console.log('No bimbingan data yet')
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
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

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'revisi':
                return 'from-red-500 to-red-600'
            case 'acc':
                return 'from-green-500 to-green-600'
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
            case 'menunggu':
                return 'MENUNGGU'
            case 'lanjut_bab':
                return 'LANJUT BAB'
            default:
                return 'BELUM ADA'
        }
    }

    // Navigate to bimbingan with specific dospem tab
    const handleChatDospem = (dospemNumber: 1 | 2) => {
        navigate(`/bimbingan/mahasiswa?tab=dospem${dospemNumber}`)
    }

    // Navigate to bimbingan page
    const handleStartBimbingan = () => {
        navigate('/bimbingan/mahasiswa')
    }

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
                                    onClick={() => navigate('/profile/mahasiswa')}
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
                        {/* Stats Cards */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {/* Card 1 - Progress */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <p className="text-sm text-gray-500 font-medium mb-3 text-center">PROGRESS</p>
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 flex items-center justify-between">
                                    <motion.span
                                        className="text-xl font-bold text-white"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {mahasiswaData?.currentProgress || 'BAB I'}
                                    </motion.span>
                                    <motion.div
                                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                                        whileHover={{ scale: 1.1, rotate: 45 }}
                                    >
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Card 2 - Status */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <p className="text-sm text-gray-500 font-medium mb-3 text-center">STATUS</p>
                                <div className={`bg-gradient-to-r ${getStatusColor(bimbinganStats.lastStatus)} rounded-xl p-4 flex items-center justify-between`}>
                                    <motion.span
                                        className="text-xl font-bold text-white"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {getStatusText(bimbinganStats.lastStatus)}
                                    </motion.span>
                                    <motion.div
                                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                                        animate={{
                                            scale: bimbinganStats.lastStatus === 'revisi' ? [1, 1.1, 1] : 1,
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <TrendingDown className="w-4 h-4 text-white" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Card 3 - Deadline */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                whileHover={{ y: -2 }}
                            >
                                <p className="text-sm text-gray-500 font-medium mb-3 text-center">DEADLINE</p>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 bg-gray-100 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 font-medium">DEADLINE</p>
                                        <p className="text-sm font-bold text-gray-700">{deadline}</p>
                                    </div>
                                    <motion.div
                                        className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl px-4 py-4 text-center shadow-lg shadow-red-500/25"
                                        animate={{ scale: [1, 1.02, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <div className="flex items-center gap-1 text-white">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-bold text-sm">{daysRemaining} Hari Lagi</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Student Greeting Card */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden relative"
                        >
                            <div className="flex items-center gap-5">
                                {/* Avatar/Mascot */}
                                <motion.div
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg border-2 border-amber-200 flex-shrink-0"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: 'spring' as const, stiffness: 300 }}
                                >
                                    <div className="relative">
                                        <GraduationCap className="w-10 h-10 text-amber-600" />
                                        <motion.div
                                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Greeting Text */}
                                <div className="flex-1">
                                    <motion.h2
                                        className="text-xl font-bold text-gray-800 mb-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Hi, {mahasiswaData?.name || user?.name} ({mahasiswaData?.nim_nip || 'NIM'})
                                    </motion.h2>
                                    <motion.p
                                        className="text-gray-600 mb-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Saat ini kamu berada di semester <span className="font-semibold text-blue-600">{mahasiswaData?.semester || '8'} Ganjil</span> (Minggu #12).
                                    </motion.p>
                                    <motion.p
                                        className="text-sm text-blue-600 font-medium italic"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Tetap semangat dan teruslah belajar! 💪
                                    </motion.p>
                                </div>

                                {/* Prodi Badge */}
                                <motion.div
                                    className="hidden md:flex flex-col items-end gap-1"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md">
                                        {mahasiswaData?.prodi || 'Program Studi'}
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Judul Tugas Akhir Section */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">JUDUL TUGAS AKHIR</h3>
                            <motion.p
                                className="text-center text-gray-700 font-medium leading-relaxed px-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {mahasiswaData?.judulTA || 'Judul Tugas Akhir belum diset'}
                            </motion.p>
                        </motion.div>

                        {/* Dosen Pembimbing Section */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Dosen Pembimbing 1 */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
                                whileHover={{ y: -3, scale: 1.01 }}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-60"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-gray-50 to-transparent rounded-tr-full opacity-50"></div>

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex items-start gap-4 flex-1">
                                        <Avatar className="w-14 h-14 border-2 border-blue-100 shadow-sm">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                {mahasiswaData?.dospem_1?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'D1'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-blue-600 mb-1">
                                                Dosen Pembimbing 1 :
                                            </p>
                                            <h4 className="font-bold text-gray-800 text-base mb-1">
                                                {mahasiswaData?.dospem_1?.name || 'Belum ditentukan'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                NIP : <span className="font-semibold text-gray-700">{mahasiswaData?.dospem_1?.nim_nip || '-'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Chat Button */}
                                    <motion.button
                                        className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-md hover:from-gray-800 hover:to-gray-900 transition-all flex-shrink-0"
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleChatDospem(1)}
                                    >
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Dosen Pembimbing 2 */}
                            <motion.div
                                variants={cardVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
                                whileHover={{ y: -3, scale: 1.01 }}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-60"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-gray-50 to-transparent rounded-tr-full opacity-50"></div>

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex items-start gap-4 flex-1">
                                        <Avatar className="w-14 h-14 border-2 border-blue-100 shadow-sm">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                {mahasiswaData?.dospem_2?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'D2'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-blue-600 mb-1">
                                                Dosen Pembimbing 2 :
                                            </p>
                                            <h4 className="font-bold text-gray-800 text-base mb-1">
                                                {mahasiswaData?.dospem_2?.name || 'Belum ditentukan'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                NIP : <span className="font-semibold text-gray-700">{mahasiswaData?.dospem_2?.nim_nip || '-'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Chat Button */}
                                    <motion.button
                                        className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-md hover:from-gray-800 hover:to-gray-900 transition-all flex-shrink-0"
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleChatDospem(2)}
                                    >
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Quick Actions */}
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
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
