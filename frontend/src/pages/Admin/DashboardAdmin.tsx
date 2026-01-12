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
    Users,
    Calendar,
    ChevronDown,
    LogOut,
    Settings,
    User,
    GraduationCap,
    UserCheck,
    FileText,
    TrendingUp,
    Clock,
    Activity,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

// Types
interface StatCard {
    title: string
    value: string | number
    subtitle: string
    icon: React.ElementType
    color: string
    trend?: string
}

interface RecentActivity {
    id: string
    action: string
    user: string
    time: string
    type: 'add' | 'edit' | 'delete' | 'approve'
}

const recentActivities: RecentActivity[] = [
    { id: '1', action: 'Menambahkan mahasiswa baru', user: 'Admin', time: '5 menit lalu', type: 'add' },
    { id: '2', action: 'Mengupdate jadwal sidang', user: 'Admin', time: '15 menit lalu', type: 'edit' },
    { id: '3', action: 'Approve pendaftaran dosen', user: 'Admin', time: '1 jam lalu', type: 'approve' },
    { id: '4', action: 'Menghapus data mahasiswa lama', user: 'Admin', time: '2 jam lalu', type: 'delete' },
    { id: '5', action: 'Menambahkan dosen pembimbing', user: 'Admin', time: '3 jam lalu', type: 'add' },
]

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true, path: '/admin/dashboard' },
]

const managementItems = [
    { label: 'Manajemen User', icon: Users, path: '/admin/users' },
    { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
]

const reportItems = [
    { label: 'Laporan', icon: FileText, path: '/admin/laporan' },
]

export const DashboardAdmin = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    // Stats from database
    const [stats, setStats] = useState({
        totalMahasiswa: 0,
        totalDosen: 0,
        jadwalSidang: 0,
        menungguApproval: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    // Fetch stats from database
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true)
                // Fetch user stats
                const userResponse = await api.get('/users/statistics')
                const userData = userResponse.data.data

                // Fetch jadwal sidang count
                let jadwalCount = 0
                try {
                    const jadwalResponse = await api.get('/jadwal')
                    const jadwalData = jadwalResponse.data.data || []
                    // Count jadwal this month
                    const now = new Date()
                    const thisMonth = now.getMonth()
                    const thisYear = now.getFullYear()
                    jadwalCount = jadwalData.filter((j: { tanggal: string }) => {
                        const jadwalDate = new Date(j.tanggal)
                        return jadwalDate.getMonth() === thisMonth && jadwalDate.getFullYear() === thisYear
                    }).length
                } catch {
                    // If jadwal endpoint fails, use total count
                    jadwalCount = 0
                }

                setStats({
                    totalMahasiswa: userData.totalMahasiswa || 0,
                    totalDosen: userData.totalDosen || 0,
                    jadwalSidang: jadwalCount,
                    menungguApproval: 0 // TODO: fetch pending approvals
                })
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    // Dynamic stats data
    const statsData: StatCard[] = [
        {
            title: 'Total Mahasiswa',
            value: isLoading ? '...' : stats.totalMahasiswa,
            subtitle: 'Aktif bimbingan',
            icon: GraduationCap,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Total Dosen',
            value: isLoading ? '...' : stats.totalDosen,
            subtitle: 'Dosen pembimbing',
            icon: UserCheck,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Jadwal Sidang',
            value: isLoading ? '...' : stats.jadwalSidang,
            subtitle: 'Bulan ini',
            icon: Calendar,
            color: 'from-orange-500 to-orange-600',
        },
        {
            title: 'Menunggu Approval',
            value: isLoading ? '...' : stats.menungguApproval,
            subtitle: 'Perlu ditinjau',
            icon: Clock,
            color: 'from-red-500 to-red-600',
        },
    ]

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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'add':
                return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            case 'edit':
                return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            case 'delete':
                return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            case 'approve':
                return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            default:
                return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
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
                {/* Wave decoration at bottom */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 256 200" className="w-full h-auto" preserveAspectRatio="none">
                        <path
                            d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z"
                            fill="rgba(254, 215, 170, 0.5)"
                        />
                        <path
                            d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z"
                            fill="rgba(253, 186, 116, 0.4)"
                        />
                        <path
                            d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z"
                            fill="rgba(251, 146, 60, 0.3)"
                        />
                        <path
                            d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z"
                            fill="rgba(249, 115, 22, 0.2)"
                        />
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
                            <p className="text-xs text-gray-500">Admin Panel</p>
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
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30'
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

                    {/* Management */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                            Manajemen
                        </p>
                        <ul className="space-y-1">
                            {managementItems.map((item, index) => (
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

                    {/* Reports */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                            Laporan
                        </p>
                        <ul className="space-y-1">
                            {reportItems.map((item, index) => (
                                <motion.li
                                    key={item.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
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
                        className="text-xs text-orange-700 font-medium text-center drop-shadow-sm"
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
                    className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
                        <p className="text-sm text-gray-500">Selamat datang, Administrator</p>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                                            {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'AD'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => navigate('/admin/profile')}
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {statsData.map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    variants={cardVariants}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
                                    whileHover={{ y: -3 }}
                                >
                                    {/* Decorative gradient */}
                                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${stat.color} opacity-10 rounded-bl-full`}></div>

                                    <div className="flex items-start justify-between relative z-10">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                            <motion.h3
                                                className="text-3xl font-bold text-gray-800"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2 + index * 0.1, type: 'spring' as const }}
                                            >
                                                {stat.value}
                                            </motion.h3>
                                            <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {stat.trend && (
                                        <div className="mt-4 flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
                                            <span className="text-xs text-gray-400">dari bulan lalu</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Quick Actions & Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Quick Actions */}
                            <motion.div
                                variants={itemVariants}
                                className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Aksi Cepat</h3>
                                <div className="space-y-3">
                                    <motion.button
                                        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl text-blue-700 hover:from-blue-100 hover:to-blue-200/50 transition-all"
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/admin/users?add=mahasiswa')}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="font-medium">Tambah Mahasiswa</span>
                                    </motion.button>
                                    <motion.button
                                        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl text-green-700 hover:from-green-100 hover:to-green-200/50 transition-all"
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/admin/users?add=dosen')}
                                    >
                                        <UserCheck className="w-5 h-5" />
                                        <span className="font-medium">Tambah Dosen</span>
                                    </motion.button>
                                    <motion.button
                                        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl text-orange-700 hover:from-orange-100 hover:to-orange-200/50 transition-all"
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/admin/jadwal')}
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span className="font-medium">Buat Jadwal Sidang</span>
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Recent Activity */}
                            <motion.div
                                variants={itemVariants}
                                className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Aktivitas Terbaru</h3>
                                    <Activity className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                        >
                                            {getActivityIcon(activity.type)}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-700">{activity.action}</p>
                                                <p className="text-xs text-gray-400">{activity.user}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{activity.time}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* System Status */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-2xl p-6 shadow-lg"
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-white">
                                    <h3 className="text-xl font-bold mb-1">Sistem Berjalan Normal</h3>
                                    <p className="text-orange-100 text-sm">Semua layanan aktif dan berfungsi dengan baik</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-white text-sm font-medium">Online</span>
                                    </div>
                                    <motion.button
                                        className="bg-white text-orange-600 font-semibold px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Lihat Detail
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
