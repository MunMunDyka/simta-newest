import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    LayoutDashboard,
    Users,
    Calendar,
    ChevronDown,
    LogOut,
    Settings,
    User,
    Search,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    GraduationCap,
    UserCheck,
    FileText,
    ChevronLeft,
    ChevronRight,
    Filter,
    Eye,
    X,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

// Types
interface UserData {
    _id: string
    id?: string
    name: string
    nim_nip: string
    email: string
    role: 'mahasiswa' | 'dosen' | 'admin'
    status: 'aktif' | 'nonaktif'
    prodi?: string
    avatar?: string
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/admin/dashboard' },
]

const managementItems = [
    { label: 'Manajemen User', icon: Users, active: true, path: '/admin/users' },
    { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
]

const reportItems = [
    { label: 'Laporan', icon: FileText, path: '/admin/laporan' },
]

export const ManajemenUser = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState('')
    const [entriesPerPage, setEntriesPerPage] = useState('10')
    const [roleFilter, setRoleFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [usersData, setUsersData] = useState<UserData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [dosenList, setDosenList] = useState<{ _id: string, name: string }[]>([])

    // Form state for Add User
    const [newUser, setNewUser] = useState({
        nim_nip: '',
        name: '',
        email: '',
        password: '',
        role: 'mahasiswa' as 'mahasiswa' | 'dosen',
        prodi: 'Sistem Informasi',
        judulTA: '',
    })

    // Form state for Edit Dospem
    const [editDospem, setEditDospem] = useState({
        dospem_1: '',
        dospem_2: ''
    })

    // Fetch users from database
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true)
                // Fetch ALL users (max limit is 100)
                const response = await api.get('/users?limit=100')
                const users = response.data.data || []
                setUsersData(users)

                // Get dosen list for dropdown
                const dosenUsers = users.filter((u: UserData) => u.role === 'dosen')
                setDosenList(dosenUsers.map((d: UserData) => ({ _id: d._id, name: d.name })))
            } catch (error) {
                console.error('Failed to fetch users:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUsers()
    }, [])

    // Refetch users after changes
    const refetchUsers = async () => {
        try {
            const response = await api.get('/users?limit=100')
            const users = response.data.data || []
            setUsersData(users)
        } catch (error) {
            console.error('Failed to refetch users:', error)
        }
    }

    // Handle Add User
    const handleAddUser = async () => {
        try {
            await api.post('/users', newUser)
            setShowAddModal(false)
            setNewUser({
                nim_nip: '',
                name: '',
                email: '',
                password: '',
                role: 'mahasiswa',
                prodi: 'Sistem Informasi',
                judulTA: '',
            })
            refetchUsers()
            alert('User berhasil ditambahkan!')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal menambahkan user: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

    // Handle Edit Dospem
    const handleEditDospem = async () => {
        if (!selectedUser) return
        try {
            await api.put(`/users/${selectedUser._id}/assign-dospem`, editDospem)
            setShowEditModal(false)
            setSelectedUser(null)
            refetchUsers()
            alert('Dosen pembimbing berhasil diupdate!')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal mengupdate dospem: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

    // Handle Delete (soft delete)
    const handleDeleteUser = async () => {
        if (!selectedUser) return
        try {
            await api.delete(`/users/${selectedUser._id}`)
            setShowDeleteModal(false)
            setSelectedUser(null)
            refetchUsers()
            alert('User berhasil dinonaktifkan!')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal menghapus user: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

    // Handle Permanent Delete (hard delete)
    const handlePermanentDelete = async () => {
        if (!selectedUser) return
        if (!confirm(`PERINGATAN: User "${selectedUser.name}" akan DIHAPUS PERMANEN dan tidak dapat dikembalikan! Lanjutkan?`)) {
            return
        }
        try {
            await api.delete(`/users/${selectedUser._id}/permanent`)
            setShowDeleteModal(false)
            setSelectedUser(null)
            refetchUsers()
            alert('User berhasil dihapus permanen!')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert('Gagal menghapus user: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }


    // Open Edit Modal
    const openEditModal = (userData: UserData) => {
        setSelectedUser(userData)
        setEditDospem({
            dospem_1: '',
            dospem_2: ''
        })
        setShowEditModal(true)
    }

    // Open Delete Modal
    const openDeleteModal = (userData: UserData) => {
        setSelectedUser(userData)
        setShowDeleteModal(true)
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

    const filteredUsers = usersData.filter(userData => {
        const matchesSearch = userData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            userData.nim_nip.includes(searchQuery) ||
            userData.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === 'all' || userData.role === roleFilter
        return matchesSearch && matchesRole
    })

    const totalPages = Math.ceil(filteredUsers.length / parseInt(entriesPerPage))

    // Pagination slice
    const startIndex = (currentPage - 1) * parseInt(entriesPerPage)
    const endIndex = startIndex + parseInt(entriesPerPage)
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Generate page numbers dinamis
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        let end = Math.min(totalPages, start + maxVisible - 1)

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages
    }

    const getStatusBadge = (status: string) => {
        if (status === 'aktif') {
            return <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0">Aktif</Badge>
        }
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">Nonaktif</Badge>
    }

    const getRoleBadge = (role: string) => {
        if (role === 'mahasiswa') {
            return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">Mahasiswa</Badge>
        }
        return <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-100 border-0">Dosen</Badge>
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
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(254, 215, 170, 0.5)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(253, 186, 116, 0.4)" />
                        <path d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z" fill="rgba(251, 146, 60, 0.3)" />
                        <path d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z" fill="rgba(249, 115, 22, 0.2)" />
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Manajemen</p>
                        <ul className="space-y-1">
                            {managementItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Laporan</p>
                        <ul className="space-y-1">
                            {reportItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Manajemen User</h1>
                        <p className="text-sm text-gray-500">Kelola data mahasiswa dan dosen</p>
                    </div>

                    <div className="flex items-center gap-4">

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                                            {user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'AD'}
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
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/profile')}>
                                    <User className="w-4 h-4 mr-2" />Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                        {/* Summary Cards */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{usersData.filter(u => u.role === 'mahasiswa').length}</p>
                                        <p className="text-sm text-gray-500">Total Mahasiswa</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <UserCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{usersData.filter(u => u.role === 'dosen').length}</p>
                                        <p className="text-sm text-gray-500">Total Dosen</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{usersData.filter(u => u.status === 'aktif').length}</p>
                                        <p className="text-sm text-gray-500">User Aktif</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Table Section */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Table Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-4">
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
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-gray-400" />
                                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                                <SelectTrigger className="w-32 h-9 bg-gray-50 border-gray-200">
                                                    <SelectValue placeholder="Filter Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua</SelectItem>
                                                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                                                    <SelectItem value="dosen">Dosen</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Cari nama, NIM, email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 h-9 w-64 bg-gray-50 border-gray-200 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl"
                                            onClick={() => setShowAddModal(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Tambah User
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                        <span className="ml-3 text-gray-500">Memuat data...</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                                <TableHead className="font-semibold text-gray-700">Nama</TableHead>
                                                <TableHead className="font-semibold text-gray-700">NIM/NIDN</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-32">
                                                        <div className="flex flex-col items-center justify-center text-center py-8">
                                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                                <Users className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-gray-700 mb-1">Belum ada data user</h3>
                                                            <p className="text-sm text-gray-500 mb-4">
                                                                {searchQuery || roleFilter !== 'all'
                                                                    ? 'Tidak ada user yang sesuai dengan filter pencarian'
                                                                    : 'Klik tombol "Tambah User" untuk menambahkan mahasiswa atau dosen baru'}
                                                            </p>
                                                            {!searchQuery && roleFilter === 'all' && (
                                                                <Button
                                                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl"
                                                                    onClick={() => setShowAddModal(true)}
                                                                >
                                                                    <Plus className="w-4 h-4 mr-2" />Tambah User
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedUsers.map((userData, index) => (
                                                    <motion.tr
                                                        key={userData._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.05 * index }}
                                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="w-10 h-10">
                                                                    <AvatarImage src={userData.avatar} />
                                                                    <AvatarFallback className={`text-white text-sm ${userData.role === 'dosen' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                                                                        {userData.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-gray-800">{userData.name}</p>
                                                                    {userData.prodi && <p className="text-xs text-gray-400">{userData.prodi}</p>}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-700">{userData.nim_nip}</TableCell>
                                                        <TableCell className="text-gray-600">{userData.email}</TableCell>
                                                        <TableCell>{getRoleBadge(userData.role)}</TableCell>
                                                        <TableCell>{getStatusBadge(userData.status)}</TableCell>
                                                        <TableCell className="text-center">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer"
                                                                        onClick={() => navigate(userData.role === 'mahasiswa' ? `/admin/users/mahasiswa/${userData._id}` : `/admin/users/dosen/${userData._id}`)}
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-2" />Detail
                                                                    </DropdownMenuItem>
                                                                    {userData.role === 'mahasiswa' && (
                                                                        <DropdownMenuItem
                                                                            className="cursor-pointer"
                                                                            onClick={() => openEditModal(userData)}
                                                                        >
                                                                            <Edit className="w-4 h-4 mr-2" />Edit Dospem
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer text-red-600"
                                                                        onClick={() => openDeleteModal(userData)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />Hapus
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} dari {filteredUsers.length} data
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />Previous
                                    </Button>
                                    {getPageNumbers().map((page) => (
                                        <motion.button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg font-medium transition-all ${currentPage === page ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {page}
                                        </motion.button>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                        Next<ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div >
                </main >
            </div >

            {/* Add User Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                        <DialogDescription>
                            Masukkan data user yang akan ditambahkan
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(v: 'mahasiswa' | 'dosen') => setNewUser({ ...newUser, role: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                                    <SelectItem value="dosen">Dosen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nim_nip">NIM/NIP</Label>
                            <Input
                                id="nim_nip"
                                value={newUser.nim_nip}
                                onChange={(e) => setNewUser({ ...newUser, nim_nip: e.target.value })}
                                placeholder={newUser.role === 'mahasiswa' ? 'Contoh: 2321053' : 'Contoh: DOSEN003'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Nama lengkap"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="user@iteba.ac.id"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Minimal 6 karakter"
                            />
                        </div>
                        {newUser.role === 'mahasiswa' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="prodi">Program Studi</Label>
                                    <Select
                                        value={newUser.prodi}
                                        onValueChange={(v) => setNewUser({ ...newUser, prodi: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Matematika">Matematika</SelectItem>
                                            <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
                                            <SelectItem value="Teknik Komputer">Teknik Komputer</SelectItem>
                                            <SelectItem value="Desain Komunikasi Visual">Desain Komunikasi Visual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="judulTA">Judul Tugas Akhir (Opsional)</Label>
                                    <Input
                                        id="judulTA"
                                        value={newUser.judulTA}
                                        onChange={(e) => setNewUser({ ...newUser, judulTA: e.target.value })}
                                        placeholder="Judul tugas akhir"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
                        <Button onClick={handleAddUser} className="bg-orange-500 hover:bg-orange-600">Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dospem Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Dosen Pembimbing</DialogTitle>
                        <DialogDescription>
                            Pilih dosen pembimbing untuk {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Dosen Pembimbing 1</Label>
                            <Select
                                value={editDospem.dospem_1}
                                onValueChange={(v) => setEditDospem({ ...editDospem, dospem_1: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih dosen pembimbing 1" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dosenList.map((d) => (
                                        <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Dosen Pembimbing 2</Label>
                            <Select
                                value={editDospem.dospem_2}
                                onValueChange={(v) => setEditDospem({ ...editDospem, dospem_2: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih dosen pembimbing 2" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dosenList.map((d) => (
                                        <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>Batal</Button>
                        <Button onClick={handleEditDospem} className="bg-orange-500 hover:bg-orange-600">Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <X className="w-5 h-5 text-red-500" />
                            Hapus User
                        </DialogTitle>
                        <DialogDescription>
                            Pilih aksi untuk user <strong>{selectedUser?.name}</strong>:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800 font-medium">Nonaktifkan</p>
                            <p className="text-xs text-yellow-600">User tidak bisa login tapi data tetap tersimpan</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-800 font-medium">Hapus Permanen</p>
                            <p className="text-xs text-red-600">Data user akan dihapus dari database dan tidak bisa dikembalikan!</p>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Batal</Button>
                        <Button onClick={handleDeleteUser} className="bg-yellow-500 hover:bg-yellow-600">Nonaktifkan</Button>
                        <Button onClick={handlePermanentDelete} variant="destructive">Hapus Permanen</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
