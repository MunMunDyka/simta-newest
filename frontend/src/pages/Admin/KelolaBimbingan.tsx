import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    LayoutDashboard, Users, Calendar, ChevronDown, LogOut, User,
    FileText, BookOpen, Trash2, AlertTriangle, CheckCircle2, Clock, XCircle,
    ArrowRight, RotateCcw, Search, BarChart3,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'
import {
    getAdminBimbinganSummary, clearBimbinganHistory,
    type AdminBimbinganSummary, type Bimbingan,
} from '@/services/bimbinganService'

interface MahasiswaOption { _id: string; name: string; nim_nip: string }

const progressOptions = ['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'Selesai']

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
]
const managementItems = [
    { label: 'Manajemen User', icon: Users, path: '/admin/users' },
    { label: 'Kelola Bimbingan', icon: FileText, active: true, path: '/admin/bimbingan' },
    { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
]
const reportItems = [
    { label: 'Laporan', icon: BarChart3, path: '/admin/laporan' },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    menunggu: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    revisi: { label: 'Revisi', color: 'bg-red-100 text-red-700', icon: XCircle },
    acc: { label: 'ACC', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    lanjut_bab: { label: 'Lanjut BAB', color: 'bg-blue-100 text-blue-700', icon: ArrowRight },
    acc_sempro: { label: 'ACC Sempro', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
}

export const KelolaBimbingan = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [mahasiswaList, setMahasiswaList] = useState<MahasiswaOption[]>([])
    const [selectedMhs, setSelectedMhs] = useState<string>('')
    const [summary, setSummary] = useState<AdminBimbinganSummary | null>(null)
    const [activeTab, setActiveTab] = useState<'dospem_1' | 'dospem_2'>('dospem_1')
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingList, setIsFetchingList] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [listError, setListError] = useState<string | null>(null)

    // Clear modal state
    const [showClearModal, setShowClearModal] = useState(false)
    const [clearScope, setClearScope] = useState<'dospem_1' | 'dospem_2' | 'all'>('all')
    const [resetProgress, setResetProgress] = useState(false)
    const [resetProgressTo, setResetProgressTo] = useState('BAB I')
    const [isClearing, setIsClearing] = useState(false)

    // Fetch mahasiswa list
    useEffect(() => {
        const fetchList = async () => {
            try {
                setIsFetchingList(true)
                setListError(null)
                const res = await api.get('/users', { params: { role: 'mahasiswa', limit: 100 } })
                setMahasiswaList(res.data.data || [])
            } catch (e) {
                console.error(e)
                setListError(getApiErrorMessage(e, 'Gagal memuat daftar mahasiswa. Silakan refresh halaman.'))
            }
            finally { setIsFetchingList(false) }
        }
        fetchList()
    }, [])

    // Fetch bimbingan summary when mahasiswa selected
    useEffect(() => {
        if (!selectedMhs) { setSummary(null); setError(null); return }
        const fetchSummary = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const res = await getAdminBimbinganSummary(selectedMhs)
                setSummary(res.data)
            } catch (e: unknown) {
                console.error(e)
                setError(getApiErrorMessage(e, 'Gagal memuat data bimbingan mahasiswa. Silakan coba lagi.'))
                setSummary(null)
            }
            finally { setIsLoading(false) }
        }
        fetchSummary()
    }, [selectedMhs])

    const handleClear = async () => {
        if (!selectedMhs) return
        try {
            setIsClearing(true)
            const res = await clearBimbinganHistory(selectedMhs, clearScope, resetProgress, resetProgressTo)
            alert(`Berhasil: ${res.message}\n\nBimbingan dihapus: ${res.data.deletedBimbingan}\nReply dihapus: ${res.data.deletedReplies}\nFile dihapus: ${res.data.deletedFiles}${res.data.progressReset ? `\nProgress diatur ke ${res.data.progressResetTo || resetProgressTo}` : ''}`)
            setShowClearModal(false)
            setResetProgress(false)
            setResetProgressTo('BAB I')
            // Refresh
            const refreshRes = await getAdminBimbinganSummary(selectedMhs)
            setSummary(refreshRes.data)
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } }
            alert('Gagal: ' + (err.response?.data?.message || 'Unknown error'))
        } finally { setIsClearing(false) }
    }

    const openClearModal = (scope: 'dospem_1' | 'dospem_2' | 'all') => {
        setClearScope(scope)
        setResetProgress(false)
        setResetProgressTo('BAB I')
        setShowClearModal(true)
    }

    const currentData = summary ? (activeTab === 'dospem_1' ? summary.dospem1 : summary.dospem2) : null
    const currentDosen = summary?.mahasiswa ? (activeTab === 'dospem_1' ? summary.mahasiswa.dospem_1 : summary.mahasiswa.dospem_2) : null

    const getScopeLabel = () => clearScope === 'all' ? 'Semua Dospem' : clearScope === 'dospem_1' ? 'Dospem 1' : 'Dospem 2'
    const getClearCount = () => {
        if (!summary) return 0
        if (clearScope === 'all') return (summary.dospem1.stats.total + summary.dospem2.stats.total)
        return clearScope === 'dospem_1' ? summary.dospem1.stats.total : summary.dospem2.stats.total
    }

    const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
    const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 12 } } }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Sidebar */}
            <motion.aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm relative overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 256 200" className="w-full h-auto" preserveAspectRatio="none">
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(254, 215, 170, 0.5)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(253, 186, 116, 0.4)" />
                        <path d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z" fill="rgba(251, 146, 60, 0.3)" />
                        <path d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z" fill="rgba(249, 115, 22, 0.2)" />
                    </svg>
                </div>
                <div className="p-6 border-b border-gray-100">
                    <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                        <img src="/LOGO-ITEBA-TOPBAR.png" alt="ITEBA Logo" className="h-12 w-auto" />
                        <div><h1 className="text-xl font-bold tracking-wider text-gray-800">SIMTA</h1><p className="text-xs text-gray-500">Admin Panel</p></div>
                    </motion.div>
                </div>
                <nav className="flex-1 p-4 space-y-6 relative z-10">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <motion.li key={item.label}><motion.button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50" whileHover={{ scale: 1.02, x: 4 }} onClick={() => navigate(item.path)}><item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span></motion.button></motion.li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Manajemen</p>
                        <ul className="space-y-1">
                            {managementItems.map((item) => (
                                <motion.li key={item.label}><motion.button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${'active' in item && item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`} whileHover={{ scale: 1.02, x: 4 }} onClick={() => navigate(item.path)}><item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span></motion.button></motion.li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Laporan</p>
                        <ul className="space-y-1">
                            {reportItems.map((item) => (
                                <motion.li key={item.label}><motion.button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-600 hover:bg-gray-50" whileHover={{ scale: 1.02, x: 4 }} onClick={() => navigate(item.path)}><item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span></motion.button></motion.li>
                            ))}
                        </ul>
                    </div>
                </nav>
                <div className="p-4 relative z-10">
                    <motion.p className="text-xs text-orange-700 font-medium text-center" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>Institut Teknologi Batam 2025</motion.p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div><h1 className="text-xl font-bold text-gray-800">Kelola Bimbingan</h1><p className="text-sm text-gray-500">Lihat dan kelola riwayat bimbingan mahasiswa</p></div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50" whileHover={{ scale: 1.02 }}>
                                <Avatar className="w-8 h-8"><AvatarImage src={undefined} /><AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">{user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'AD'}</AvatarFallback></Avatar>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal"><div className="flex flex-col space-y-1"><p className="text-sm font-medium">{user?.name || 'Admin'}</p><p className="text-xs text-muted-foreground">{user?.email || ''}</p></div></DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/admin/profile')}><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => { dispatch(logout()); navigate('/') }}><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
                        <FeedbackAlert message={listError} onClose={() => setListError(null)} />

                        {/* Select Mahasiswa */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-orange-500" />Pilih Mahasiswa</h3>
                            <Select value={selectedMhs} onValueChange={setSelectedMhs} disabled={isFetchingList}>
                                <SelectTrigger className="w-full"><SelectValue placeholder={isFetchingList ? 'Memuat data...' : 'Pilih mahasiswa...'} /></SelectTrigger>
                                <SelectContent>
                                    {mahasiswaList.map((m) => (
                                        <SelectItem key={m._id} value={m._id}>{m.name} ({m.nim_nip})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </motion.div>

                        {isLoading && (
                            <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
                        )}

                        {summary && !isLoading && (
                            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
                                {/* Mahasiswa Info Card */}
                                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-16 h-16"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl">{summary.mahasiswa.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-800">{summary.mahasiswa.name}</h2>
                                            <p className="text-gray-500 text-sm">{summary.mahasiswa.nim_nip} • {summary.mahasiswa.prodi || 'Sistem Informasi'}</p>
                                            <p className="text-gray-600 text-sm mt-1"><BookOpen className="w-4 h-4 inline mr-1" />{summary.mahasiswa.judulTA || 'Belum ada judul'}</p>
                                            <Badge className="mt-2 bg-blue-100 text-blue-600">Progress: {summary.mahasiswa.currentProgress || 'BAB I'}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 bg-gray-50 rounded-xl"><p className="text-gray-500 text-xs">Dospem 1</p><p className="font-medium text-gray-800">{summary.mahasiswa.dospem_1?.name || '-'}</p></div>
                                            <div className="p-3 bg-gray-50 rounded-xl"><p className="text-gray-500 text-xs">Dospem 2</p><p className="font-medium text-gray-800">{summary.mahasiswa.dospem_2?.name || '-'}</p></div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Stats Cards */}
                                <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Bimbingan', value: summary.dospem1.stats.total + summary.dospem2.stats.total, color: 'from-blue-500 to-blue-600' },
                                        { label: 'ACC', value: summary.dospem1.stats.acc + summary.dospem2.stats.acc, color: 'from-green-500 to-green-600' },
                                        { label: 'ACC Sempro', value: (summary.dospem1.stats.acc_sempro || 0) + (summary.dospem2.stats.acc_sempro || 0), color: 'from-purple-500 to-purple-600' },
                                        { label: 'Revisi', value: summary.dospem1.stats.revisi + summary.dospem2.stats.revisi, color: 'from-red-500 to-red-600' },
                                        { label: 'Menunggu', value: summary.dospem1.stats.menunggu + summary.dospem2.stats.menunggu, color: 'from-yellow-500 to-yellow-600' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-xs text-gray-500">{s.label}</p>
                                            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Tabs + Table */}
                                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="flex border-b border-gray-100">
                                        {(['dospem_1', 'dospem_2'] as const).map(tab => (
                                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${activeTab === tab ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50' : 'text-gray-500 hover:text-gray-700'}`}>
                                                {tab === 'dospem_1' ? 'Dospem 1' : 'Dospem 2'} ({tab === 'dospem_1' ? summary.dospem1.stats.total : summary.dospem2.stats.total})
                                            </button>
                                        ))}
                                    </div>

                                    {currentDosen && (
                                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <p className="text-sm text-gray-600">Dosen: <strong>{currentDosen.name}</strong> ({currentDosen.nim_nip})</p>
                                            <div className="flex gap-2">
                                                <Badge className="bg-green-100 text-green-700">ACC: {currentData?.stats.acc || 0}</Badge>
                                                <Badge className="bg-purple-100 text-purple-700">ACC Sempro: {currentData?.stats.acc_sempro || 0}</Badge>
                                                <Badge className="bg-red-100 text-red-700">Revisi: {currentData?.stats.revisi || 0}</Badge>
                                                <Badge className="bg-yellow-100 text-yellow-700">Menunggu: {currentData?.stats.menunggu || 0}</Badge>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {currentData && currentData.bimbingan.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12">No</TableHead>
                                                        <TableHead className="w-16">Versi</TableHead>
                                                        <TableHead>Judul</TableHead>
                                                        <TableHead className="w-24">Status</TableHead>
                                                        <TableHead className="w-36">Tanggal Kirim</TableHead>
                                                        <TableHead className="w-36">Feedback</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentData.bimbingan.map((b: Bimbingan, i: number) => {
                                                        const sc = statusConfig[b.status] || statusConfig.menunggu
                                                        const StatusIcon = sc.icon
                                                        return (
                                                            <TableRow key={b._id}>
                                                                <TableCell>{i + 1}</TableCell>
                                                                <TableCell><Badge variant="outline">{b.version}</Badge></TableCell>
                                                                <TableCell className="font-medium">{b.judul}</TableCell>
                                                                <TableCell><Badge className={sc.color}><StatusIcon className="w-3 h-3 mr-1" />{sc.label}</Badge></TableCell>
                                                                <TableCell className="text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                                                                <TableCell className="text-sm text-gray-500">{b.feedbackDate ? new Date(b.feedbackDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-8 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>Belum ada data bimbingan</p></div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Clear Actions */}
                                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
                                    <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Clear Riwayat Bimbingan</h3>
                                    <p className="text-sm text-gray-500 mb-4">Menghapus riwayat bimbingan secara permanen (record, reply, dan file PDF). Aksi ini tidak dapat di-undo!</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => openClearModal('dospem_1')} disabled={summary.dospem1.stats.total === 0}>
                                            <Trash2 className="w-4 h-4 mr-2" />Clear Dospem 1 ({summary.dospem1.stats.total})
                                        </Button>
                                        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => openClearModal('dospem_2')} disabled={summary.dospem2.stats.total === 0}>
                                            <Trash2 className="w-4 h-4 mr-2" />Clear Dospem 2 ({summary.dospem2.stats.total})
                                        </Button>
                                        <Button variant="destructive" onClick={() => openClearModal('all')} disabled={(summary.dospem1.stats.total + summary.dospem2.stats.total) === 0}>
                                            <Trash2 className="w-4 h-4 mr-2" />Clear Semua Bimbingan ({summary.dospem1.stats.total + summary.dospem2.stats.total})
                                        </Button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {!selectedMhs && !isLoading && (
                            <motion.div variants={itemVariants} className="text-center py-16 text-gray-400">
                                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">Pilih mahasiswa untuk melihat riwayat bimbingan</p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                <p className="text-red-700 font-medium">Gagal memuat data bimbingan</p>
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </main>
            </div>

            {/* Clear Confirmation Modal */}
            <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" />Konfirmasi Hapus Bimbingan</DialogTitle>
                        <DialogDescription>Anda akan menghapus riwayat bimbingan <strong>{summary?.mahasiswa.name}</strong> secara PERMANEN.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <p className="font-semibold text-red-800 mb-2">Scope: {getScopeLabel()}</p>
                            <p className="text-sm text-red-600">Jumlah bimbingan yang akan dihapus: <strong>{getClearCount()}</strong></p>
                            <p className="text-xs text-red-500 mt-1">Termasuk semua reply dan file PDF terkait</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={resetProgress} onChange={(e) => setResetProgress(e.target.checked)} className="w-4 h-4 rounded border-orange-300 text-orange-500 focus:ring-orange-500" />
                                <div>
                                    <p className="text-sm font-medium text-orange-800 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Atur progress setelah hapus</p>
                                    <p className="text-xs text-orange-600">Progress saat ini: {summary?.mahasiswa.currentProgress || 'BAB I'}</p>
                                </div>
                            </label>

                            {resetProgress && (
                                <div className="pl-7 space-y-1">
                                    <p className="text-xs font-medium text-orange-700">Reset progress ke</p>
                                    <Select value={resetProgressTo} onValueChange={setResetProgressTo}>
                                        <SelectTrigger className="h-10 bg-white border-orange-200 text-orange-900">
                                            <SelectValue placeholder="Pilih progress" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {progressOptions.map((progress) => (
                                                <SelectItem key={progress} value={progress}>{progress}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowClearModal(false)} disabled={isClearing}>Batal</Button>
                        <Button variant="destructive" onClick={handleClear} disabled={isClearing}>{isClearing ? 'Menghapus...' : 'Hapus Permanen'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
