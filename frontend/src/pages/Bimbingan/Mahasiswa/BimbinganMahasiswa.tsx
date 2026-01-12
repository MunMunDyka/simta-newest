import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
    FileText,
    ChevronDown,
    LogOut,
    Settings,
    User,
    Upload,
    FileEdit,
    Send,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    MessageSquare,
    Download,
    Paperclip,
    AlertCircle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import * as bimbinganService from '@/services/bimbinganService'
import type { Bimbingan } from '@/services/bimbinganService'

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/dashboard/mahasiswa' },
]

const aktivitasItems = [
    { label: 'Bimbingan', icon: FileEdit, active: true, path: '/bimbingan/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

export const BimbinganMahasiswa = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useAppSelector((state) => state.auth)

    // Get tab from URL query parameter
    const tabFromUrl = searchParams.get('tab') as 'dospem1' | 'dospem2' | null
    const [activeTab, setActiveTab] = useState<'dospem1' | 'dospem2'>(tabFromUrl || 'dospem1')
    const [judulBimbingan, setJudulBimbingan] = useState('')
    const [catatan, setCatatan] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // API states
    const [bimbinganList, setBimbinganList] = useState<Bimbingan[]>([])
    const [, setIsLoading] = useState(true)
    const [, setIsSubmitting] = useState(false)
    const [, setError] = useState<string | null>(null)
    const [, setSuccessMessage] = useState<string | null>(null)

    // Dospem info from user (handle both string and object types)
    const dospem1Name = typeof user?.dospem_1 === 'object' ? user.dospem_1?.name : 'Dosen Pembimbing 1'
    const dospem2Name = typeof user?.dospem_2 === 'object' ? user.dospem_2?.name : 'Dosen Pembimbing 2'

    // Fetch bimbingan data
    const fetchBimbingan = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await bimbinganService.getBimbinganList({
                dosenType: activeTab === 'dospem1' ? 'dospem_1' : 'dospem_2',
                limit: 50
            })
            setBimbinganList(response.data || [])
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Gagal memuat data bimbingan')
        } finally {
            setIsLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        fetchBimbingan()
    }, [fetchBimbingan])

    const currentHistory = bimbinganList
    const latestStatus = currentHistory[0]?.status
    const isFormDisabled = latestStatus === 'menunggu'

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file)
        } else {
            alert('Hanya file PDF yang diperbolehkan!')
        }
    }

    const handleSubmit = async () => {
        if (!judulBimbingan || !selectedFile) {
            setError('Mohon lengkapi judul dan file!')
            return
        }

        setIsSubmitting(true)
        setError(null)
        setSuccessMessage(null)

        try {
            await bimbinganService.createBimbingan({
                judul: judulBimbingan,
                dosenType: activeTab === 'dospem1' ? 'dospem_1' : 'dospem_2',
                catatan: catatan || undefined,
                file: selectedFile
            })

            setSuccessMessage('Bimbingan berhasil dikirim! Menunggu feedback dari dosen.')
            setJudulBimbingan('')
            setCatatan('')
            setSelectedFile(null)

            // Refresh list
            await fetchBimbingan()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Gagal mengirim bimbingan. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSendReply = async (bimbinganId: string) => {
        if (!replyText.trim()) return

        try {
            await bimbinganService.addReply(bimbinganId, { message: replyText })
            setReplyText('')
            // Refresh to show new reply
            await fetchBimbingan()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Gagal mengirim balasan')
        }
    }

    const handleDownload = async (bimbinganId: string, fileName: string) => {
        try {
            const blob = await bimbinganService.downloadFile(bimbinganId)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName || 'document.pdf'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed:', error)
            setError('Gagal mendownload file')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'menunggu':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0"><Clock className="w-3 h-3 mr-1" />Menunggu Review</Badge>
            case 'revisi':
                return <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0"><XCircle className="w-3 h-3 mr-1" />Revisi</Badge>
            case 'acc':
                return <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0"><CheckCircle className="w-3 h-3 mr-1" />ACC</Badge>
            case 'lanjut_bab':
                return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-0"><ChevronRight className="w-3 h-3 mr-1" />Lanjut BAB</Badge>
            default:
                return <Badge>{status}</Badge>
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
                        <h1 className="text-xl font-bold text-gray-800">Bimbingan Skripsi</h1>
                        <p className="text-sm text-gray-500">Kirim progres dan lihat feedback dosen</p>
                    </div>

                    <div className="flex items-center gap-4">

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                                            {user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'MH'}
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
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-4xl mx-auto">

                        {/* Tab Selection */}
                        <motion.div variants={itemVariants} className="flex gap-2">
                            <motion.button
                                onClick={() => setActiveTab('dospem1')}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeTab === 'dospem1' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <User className="w-4 h-4" />
                                    Dosen Pembimbing 1
                                </div>
                                <p className="text-xs mt-1 opacity-80">{dospem1Name}</p>
                            </motion.button>
                            <motion.button
                                onClick={() => setActiveTab('dospem2')}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeTab === 'dospem2' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <User className="w-4 h-4" />
                                    Dosen Pembimbing 2
                                </div>
                                <p className="text-xs mt-1 opacity-80">{dospem2Name}</p>
                            </motion.button>
                        </motion.div>

                        {/* Upload Form */}
                        <motion.div variants={itemVariants} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${isFormDisabled ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Kirim Bimbingan Baru</h2>
                                    <p className="text-sm text-gray-500">Upload file revisi atau progres terbaru</p>
                                </div>
                            </div>

                            {isFormDisabled && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <p className="text-sm text-yellow-700">Anda masih memiliki bimbingan yang menunggu review. Harap tunggu feedback dosen sebelum mengirim yang baru.</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bimbingan</label>
                                    <Input
                                        placeholder="Contoh: Revisi BAB III - Metodologi Penelitian"
                                        value={judulBimbingan}
                                        onChange={(e) => setJudulBimbingan(e.target.value)}
                                        disabled={isFormDisabled}
                                        className="rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF)</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        disabled={isFormDisabled}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => !isFormDisabled && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isFormDisabled ? 'border-gray-200 bg-gray-50' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'}`}
                                    >
                                        {selectedFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="w-8 h-8 text-blue-500" />
                                                <div className="text-left">
                                                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                                                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-600">Klik atau drag file PDF ke sini</p>
                                                <p className="text-xs text-gray-400 mt-1">Maksimal 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                                    <Textarea
                                        placeholder="Jelaskan apa saja yang sudah diperbaiki atau ditambahkan..."
                                        value={catatan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCatatan(e.target.value)}
                                        disabled={isFormDisabled}
                                        className="rounded-xl min-h-[100px]"
                                    />
                                </div>

                                <motion.div whileHover={{ scale: isFormDisabled ? 1 : 1.01 }} whileTap={{ scale: isFormDisabled ? 1 : 0.99 }}>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isFormDisabled}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-6"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Kirim Bimbingan
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* History Section */}
                        <motion.div variants={itemVariants}>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Bimbingan</h3>
                            <div className="space-y-3">
                                {currentHistory.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                <FileText className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-700 mb-1">Belum ada riwayat bimbingan</h3>
                                            <p className="text-sm text-gray-500">
                                                Mulai kirim bimbingan pertama Anda dengan mengisi form di atas
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    currentHistory.map((item, index) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                        >
                                            {/* Header */}
                                            <div
                                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                            <span className="font-bold text-gray-600 text-sm">{item.version}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{item.judul}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <Paperclip className="w-3 h-3" />
                                                                <span>{item.fileName}</span>
                                                                <span>•</span>
                                                                <span>{item.fileSize}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {getStatusBadge(item.status)}
                                                        <motion.div animate={{ rotate: expandedId === item.id ? 90 : 0 }}>
                                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                                        </motion.div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">Dikirim: {item.tanggalKirim}</p>
                                            </div>

                                            {/* Expanded Content */}
                                            <AnimatePresence>
                                                {expandedId === item.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-gray-100"
                                                    >
                                                        <div className="p-4 space-y-4">
                                                            {/* Catatan Mahasiswa */}
                                                            <div className="bg-blue-50 rounded-xl p-3">
                                                                <p className="text-xs font-medium text-blue-600 mb-1">Catatan Anda:</p>
                                                                <p className="text-sm text-gray-700">{item.catatan}</p>
                                                            </div>

                                                            {/* Feedback Dosen */}
                                                            {item.feedback && (
                                                                <div className="bg-gray-50 rounded-xl p-3">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <MessageSquare className="w-4 h-4 text-gray-500" />
                                                                        <p className="text-xs font-medium text-gray-600">Feedback Dosen ({item.tanggalFeedback}):</p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700">{item.feedback}</p>
                                                                </div>
                                                            )}

                                                            {/* Replies */}
                                                            {item.replies && item.replies.length > 0 && (
                                                                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                                                    {item.replies.map((reply) => (
                                                                        <div key={reply._id || reply.id} className={`p-3 rounded-xl ${reply.senderRole === 'mahasiswa' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className={`text-xs font-medium ${reply.senderRole === 'mahasiswa' ? 'text-blue-600' : 'text-gray-600'}`}>
                                                                                    {reply.senderRole === 'mahasiswa' ? 'Anda' : 'Dosen'}
                                                                                </span>
                                                                                <span className="text-xs text-gray-400">{reply.timestamp || reply.formattedTime}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-700">{reply.message}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Reply Input */}
                                                            {item.status !== 'menunggu' && (
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder="Tulis balasan..."
                                                                        value={replyText}
                                                                        onChange={(e) => setReplyText(e.target.value)}
                                                                        className="flex-1 rounded-xl"
                                                                    />
                                                                    <Button onClick={() => handleSendReply(item._id)} className="rounded-xl bg-blue-500 hover:bg-blue-600">
                                                                        <Send className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {/* Download Button */}
                                                            <Button
                                                                variant="outline"
                                                                className="w-full rounded-xl"
                                                                onClick={() => handleDownload(item.id || item._id, item.fileName)}
                                                            >
                                                                <Download className="w-4 h-4 mr-2" />
                                                                Download {item.fileName}
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                    </motion.div>
                </main>
            </div>
        </div>
    )
}
