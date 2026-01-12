import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
    FileText,
    Send,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    MessageSquare,
    Download,
    Paperclip,
    ArrowLeft,
    GraduationCap,
    Upload,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/dashboard/dosen' },
]

const managementItems = [
    { label: 'Mahasiswa Bimbingan', icon: Users, path: '/dosen/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

export const BimbinganDosen = () => {
    const { mahasiswaId } = useParams()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [status, setStatus] = useState<string>('')
    const [feedback, setFeedback] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [, setIsLoading] = useState(true)
    const [bimbinganData, setBimbinganData] = useState<{
        id: string
        mahasiswa: { name: string; nim_nip: string; prodi: string; currentProgress: string; judulTA: string }
        version: string
        judul: string
        fileName: string
        fileSize: string
        catatan: string
        status: string
        createdAt: string
    } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)


    // Fetch bimbingan data
    useEffect(() => {
        const fetchBimbingan = async () => {
            if (!mahasiswaId) return

            try {
                setIsLoading(true)
                // Fetch latest bimbingan for this mahasiswa (any status)
                const response = await api.get(`/bimbingan`, {
                    params: {
                        mahasiswaId: mahasiswaId,
                        limit: 1
                    }
                })

                const bimbinganList = response.data.data
                console.log('Bimbingan API Response:', bimbinganList)
                if (bimbinganList && bimbinganList.length > 0) {
                    const data = bimbinganList[0]
                    console.log('Mahasiswa data:', data.mahasiswa)
                    console.log('judulTA:', data.mahasiswa?.judulTA)
                    console.log('Bimbingan STATUS:', data.status) // Debug status
                    console.log('Status === menunggu ?:', data.status === 'menunggu')
                    setBimbinganData({
                        id: data._id,
                        mahasiswa: data.mahasiswa,
                        version: `V${data.version}`,
                        judul: data.judul,
                        fileName: data.fileOriginalName || data.fileName,
                        fileSize: data.fileSize ? `${(parseInt(data.fileSize) / 1024 / 1024).toFixed(2)} MB` : '-',
                        catatan: data.catatan || '',
                        status: data.status,
                        createdAt: new Date(data.createdAt).toLocaleString('id-ID')
                    })
                } else {
                    console.log('No pending bimbingan found for this mahasiswa')
                }
            } catch (error) {
                console.error('Failed to fetch bimbingan:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBimbingan()
    }, [mahasiswaId])

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
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleDownload = async () => {
        if (!bimbinganData?.id) return

        try {
            const response = await api.get(`/bimbingan/download/${bimbinganData.id}`, {
                responseType: 'blob'
            })

            // Create blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = bimbinganData.fileName || 'document.pdf'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed:', error)
            alert('Gagal mendownload file')
        }
    }

    const handleSubmit = async () => {
        if (!status) {
            alert('Mohon pilih status!')
            return
        }
        if (!feedback.trim()) {
            alert('Mohon isi feedback!')
            return
        }
        if (!bimbinganData?.id) {
            alert('Data bimbingan tidak ditemukan')
            return
        }

        setIsSubmitting(true)

        try {
            // Create FormData for file upload
            const formData = new FormData()
            formData.append('status', status)
            formData.append('feedback', feedback)
            if (selectedFile) {
                formData.append('feedbackFile', selectedFile)
            }

            // Submit feedback via API
            await api.put(`/bimbingan/${bimbinganData.id}/feedback`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            alert('Feedback berhasil dikirim!')
            navigate('/dosen/mahasiswa')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert(err.response?.data?.message || 'Gagal mengirim feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'revisi':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'acc':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'lanjut_bab':
                return <ChevronRight className="w-5 h-5 text-blue-500" />
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Bimbingan</p>
                        <ul className="space-y-1">
                            {managementItems.map((item) => (
                                <motion.li key={item.label}>
                                    <motion.button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-50"
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

                    {/* Detail Mahasiswa - Only on this page */}
                    {bimbinganData?.mahasiswa && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Detail Mahasiswa</p>
                            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl mx-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                        {bimbinganData.mahasiswa.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'MH'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{bimbinganData.mahasiswa.name}</p>
                                        <p className="text-xs text-gray-500">{bimbinganData.mahasiswa.nim_nip}</p>
                                    </div>
                                </div>
                                <div className="text-xs space-y-1">
                                    <p className="text-gray-600"><span className="font-medium">Prodi:</span> {bimbinganData.mahasiswa.prodi}</p>
                                    <p className="text-gray-600"><span className="font-medium">Progress:</span> {bimbinganData.mahasiswa.currentProgress}</p>
                                </div>
                            </div>
                        </div>
                    )}
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
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </motion.button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Review Bimbingan</h1>
                            <p className="text-sm text-gray-500">Berikan feedback untuk mahasiswa</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                                            {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'DS'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name || 'Dosen'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => navigate('/profile/dosen')}
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

                        {/* Mahasiswa Info Card - Read Only */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-16 h-16 border-2 border-blue-100">
                                    <AvatarImage src={undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                                        {bimbinganData?.mahasiswa?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'MH'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-800">{bimbinganData?.mahasiswa?.name || 'Loading...'}</h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                                            <GraduationCap className="w-3 h-3 mr-1" />
                                            {bimbinganData?.mahasiswa?.nim_nip || '-'}
                                        </Badge>
                                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0">
                                            {bimbinganData?.mahasiswa?.prodi || '-'}
                                        </Badge>
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                            {bimbinganData?.mahasiswa?.currentProgress || '-'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-medium text-gray-500 mb-1">Judul Tugas Akhir:</p>
                                <p className="text-sm text-gray-800 font-medium leading-relaxed">{bimbinganData?.mahasiswa?.judulTA || '-'}</p>
                            </div>
                        </motion.div>

                        {/* Submission Detail - Read Only */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bimbinganData?.status === 'menunggu'
                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                                    : bimbinganData?.status === 'revisi'
                                        ? 'bg-gradient-to-br from-red-400 to-red-500'
                                        : bimbinganData?.status === 'acc'
                                            ? 'bg-gradient-to-br from-green-400 to-green-500'
                                            : 'bg-gradient-to-br from-blue-400 to-blue-500'
                                    }`}>
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {bimbinganData?.status === 'menunggu' && 'Menunggu Review'}
                                        {bimbinganData?.status === 'revisi' && 'Revisi'}
                                        {bimbinganData?.status === 'acc' && 'ACC ✓'}
                                        {bimbinganData?.status === 'lanjut_bab' && 'Lanjut BAB ✓'}
                                        {!bimbinganData?.status && 'Loading...'}
                                    </h3>
                                    <p className="text-sm text-gray-500">{bimbinganData?.version || '-'} - {bimbinganData?.judul || '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* File Info */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-10 h-10 text-red-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">{bimbinganData?.fileName || '-'}</p>
                                            <p className="text-xs text-gray-500">{bimbinganData?.fileSize || '-'} • Dikirim {bimbinganData?.createdAt || '-'}</p>
                                        </div>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl"
                                            onClick={handleDownload}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download File
                                        </Button>
                                    </motion.div>
                                </div>

                                {/* Catatan Mahasiswa */}
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-700">Pesan dari Mahasiswa:</p>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{bimbinganData?.catatan || '-'}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Form - Only show if status is 'menunggu' */}
                        {bimbinganData && bimbinganData.status === 'menunggu' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                        <Send className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Berikan Feedback</h3>
                                        <p className="text-sm text-gray-500">Tentukan status dan berikan masukan</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Status Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Bimbingan *</label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="w-full h-12 rounded-xl">
                                                <SelectValue placeholder="Pilih status..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="revisi">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                        <span>Revisi - Perlu diperbaiki</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="acc">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                        <span>ACC - Disetujui</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="lanjut_bab">
                                                    <div className="flex items-center gap-2">
                                                        <ChevronRight className="w-4 h-4 text-blue-500" />
                                                        <span>Lanjut BAB - Silakan lanjut ke bab berikutnya</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status Preview */}
                                    {status && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-3 rounded-xl flex items-center gap-2 ${status === 'revisi' ? 'bg-red-50 border border-red-200' :
                                                status === 'acc' ? 'bg-green-50 border border-green-200' :
                                                    'bg-blue-50 border border-blue-200'
                                                }`}
                                        >
                                            {getStatusIcon(status)}
                                            <span className={`text-sm font-medium ${status === 'revisi' ? 'text-red-700' :
                                                status === 'acc' ? 'text-green-700' : 'text-blue-700'
                                                }`}>
                                                {status === 'revisi' ? 'Mahasiswa akan diminta untuk merevisi' :
                                                    status === 'acc' ? 'Dokumen akan disetujui' :
                                                        'Mahasiswa bisa lanjut ke BAB berikutnya'}
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* Feedback Text */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Komentar / Feedback *</label>
                                        <Textarea
                                            placeholder="Tuliskan feedback, masukan, atau catatan revisi untuk mahasiswa..."
                                            value={feedback}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                                            className="rounded-xl min-h-[150px]"
                                        />
                                    </div>

                                    {/* Optional File Attachment */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lampiran File (Opsional)
                                            <span className="text-gray-400 font-normal ml-1">- Jika ada file coretan/catatan</span>
                                        </label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                                        >
                                            {selectedFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <Paperclip className="w-5 h-5 text-blue-500" />
                                                    <span className="font-medium text-gray-800">{selectedFile.name}</span>
                                                    <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                                    <Upload className="w-5 h-5" />
                                                    <span>Klik untuk upload file</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-6 text-lg"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Kirim Feedback
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>

                                    {/* Info */}
                                    <p className="text-xs text-gray-400 text-center">
                                        * Setelah mengirim feedback, mahasiswa akan menerima notifikasi WhatsApp secara otomatis
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* No Bimbingan Submitted Yet */}
                        {!bimbinganData && (
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-1">Belum ada bimbingan</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Mahasiswa ini belum mengirim file bimbingan
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/dosen/mahasiswa')}
                                        className="rounded-xl"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Kembali ke Daftar Mahasiswa
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Already Reviewed Message */}
                        {bimbinganData?.status && bimbinganData.status !== 'menunggu' && (
                            <motion.div variants={itemVariants} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-green-800">Sudah Direview ✓</h3>
                                        <p className="text-sm text-green-600">Bimbingan ini sudah diberikan feedback. Tunggu mahasiswa untuk mengirim revisi baru.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                </main>
            </div>
        </div>
    )
}
