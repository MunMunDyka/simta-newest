import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    LayoutDashboard, Users, Calendar, ChevronDown, LogOut, GraduationCap,
    FileText, CheckCircle2, XCircle, Search, Award, Download, Eye,
    CheckSquare,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'
import { verifikasiWisuda } from '@/services/wisudaService'
import { type User as UserType } from '@/services/authService'

// Sidebar config matching other Admin pages
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
]

const managementItems = [
    { label: 'Manajemen User', icon: Users, path: '/admin/users' },
    { label: 'Manajemen Dosen', icon: GraduationCap, path: '/admin/plotting' },
    { label: 'Kelola Bimbingan', icon: FileText, path: '/admin/bimbingan' },
    { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
    { label: 'Verifikasi Wisuda', icon: CheckSquare, active: true, path: '/admin/wisuda' },
]

const reportItems = [
    { label: 'Laporan', icon: FileText, path: '/admin/laporan' },
]

export const VerifikasiWisuda = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user: currentUser } = useAppSelector((state) => state.auth)

    // State
    const [students, setStudents] = useState<UserType[]>([])
    const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'semua' | 'menunggu_verifikasi' | 'disetujui' | 'ditolak' | 'selesai'>('semua')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Verification Form State
    const [showModal, setShowModal] = useState(false)
    const [decision, setDecision] = useState<'disetujui' | 'ditolak'>('disetujui')
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Fetch students
    const fetchStudents = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            // Build query params
            let url = '/users?role=mahasiswa&limit=100'
            
            // If filtering by "selesai" (lulus), query statusMahasiswa=selesai
            if (statusFilter === 'selesai') {
                url += '&statusMahasiswa=selesai'
            } else {
                url += '&statusMahasiswa=persiapan_wisuda'
                if (statusFilter !== 'semua') {
                    url += `&statusVerifikasi=${statusFilter}`
                }
            }

            if (search) {
                url += `&search=${encodeURIComponent(search)}`
            }

            const response = await api.get(url)
            if (response.data && response.data.success) {
                // If we're looking at persiapan_wisuda, we might want to also exclude students who haven't uploaded anything
                // unless we want to see all students currently in the stage. Let's show all of them.
                setStudents(response.data.data)
            } else {
                setStudents([])
            }
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Gagal mengambil data berkas wisuda.'))
        } finally {
            setIsLoading(false)
        }
    }, [search, statusFilter])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchStudents()
    }

    const handleOpenVerify = (student: UserType) => {
        setSelectedStudent(student)
        setDecision(student.dokumenWisuda?.statusVerifikasi === 'disetujui' ? 'disetujui' : 'disetujui')
        setNotes(student.dokumenWisuda?.catatanAdmin || '')
        setShowModal(true)
    }

    const handleSaveVerification = async () => {
        if (!selectedStudent) return
        if (decision === 'ditolak' && !notes.trim()) {
            alert('Catatan evaluasi wajib diisi jika dokumen ditolak')
            return
        }

        setIsSaving(true)
        setError(null)
        setSuccessMessage(null)
        try {
            await verifikasiWisuda(selectedStudent._id, decision, notes)
            setSuccessMessage(`Berhasil memverifikasi berkas wisuda mahasiswa ${selectedStudent.name}.`)
            setShowModal(false)
            setSelectedStudent(null)
            fetchStudents()
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Gagal menyimpan hasil verifikasi.'))
        } finally {
            setIsSaving(false)
        }
    }

    // Helpers
    const getFileUrl = (path: string) => {
        if (!path) return ''
        const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'
        if (path.startsWith('uploads/wisuda/')) {
            const fileName = path.split('/').pop()
            return `${apiBaseUrl}/users/wisuda-download/${fileName}`
        }
        const assetBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
        return `${assetBaseUrl}/${path.replace(/\\/g, '/')}`
    }

    const getStatusLabel = (status: string | undefined) => {
        switch (status) {
            case 'belum_upload': return 'Belum Upload'
            case 'menunggu_verifikasi': return 'Menunggu Verifikasi'
            case 'disetujui': return 'Disetujui'
            case 'ditolak': return 'Ditolak'
            default: return 'Belum Upload'
        }
    }

    const getStatusBadge = (status: string | undefined) => {
        switch (status) {
            case 'belum_upload': return 'bg-gray-100 text-gray-700 border-gray-200'
            case 'menunggu_verifikasi': return 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse'
            case 'disetujui': return 'bg-green-100 text-green-800 border-green-200'
            case 'ditolak': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    // Animation variants
    const sidebarVariants: Variants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
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

                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <img src="/LOGO-ITEBA-TOPBAR.png" alt="ITEBA Logo" className="h-12 w-auto" />
                        <div>
                            <h1 className="text-xl font-bold tracking-wider text-gray-800">SIMTA</h1>
                            <p className="text-xs text-gray-500">Admin Panel</p>
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
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Manajemen</p>
                        <ul className="space-y-1">
                            {managementItems.map((item) => (
                                <li key={item.label}>
                                    <button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                            item.active
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
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
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className="p-4 relative z-10 text-center">
                    <p className="text-xs text-orange-600 font-medium">Institut Teknologi Batam</p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                    <h2 className="text-xl font-bold text-gray-800">Verifikasi Dokumen Wisuda</h2>
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="bg-gradient-to-br from-orange-50 to-orange-600 text-white text-sm font-semibold">
                                            {currentUser?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>{currentUser?.name || 'Administrator'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => { dispatch(logout()); navigate('/') }}>
                                    <LogOut className="w-4 h-4 mr-2" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <FeedbackAlert message={error} onClose={() => setError(null)} />
                        {successMessage && (
                            <FeedbackAlert message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
                        )}

                        {/* Top Filters & Search */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={statusFilter === 'semua' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('semua')}
                                    className={statusFilter === 'semua' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                                >
                                    Semua
                                </Button>
                                <Button
                                    variant={statusFilter === 'menunggu_verifikasi' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('menunggu_verifikasi')}
                                    className={statusFilter === 'menunggu_verifikasi' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                                >
                                    Menunggu Verifikasi
                                </Button>
                                <Button
                                    variant={statusFilter === 'disetujui' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('disetujui')}
                                    className={statusFilter === 'disetujui' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                                >
                                    Disetujui
                                </Button>
                                <Button
                                    variant={statusFilter === 'ditolak' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('ditolak')}
                                    className={statusFilter === 'ditolak' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                                >
                                    Ditolak
                                </Button>
                                <Button
                                    variant={statusFilter === 'selesai' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('selesai')}
                                    className={statusFilter === 'selesai' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                                >
                                    Selesai (Lulus)
                                </Button>
                            </div>

                            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari NIM atau nama..."
                                    className="pl-9 pr-4 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </form>
                        </motion.div>

                        {/* Student List Table */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {isLoading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Memuat data berkas wisuda...</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">Tidak ada mahasiswa yang ditemukan dalam kriteria ini.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Mahasiswa</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Judul TA</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">Berkas Wisuda</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">Status Verifikasi</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((stud) => {
                                            const doc = stud.dokumenWisuda
                                            const totalFiles = [
                                                doc?.skripsiFull?.fileName,
                                                doc?.pptSkripsi?.fileName,
                                                doc?.halamanPengesahan?.fileName,
                                                doc?.formBimbingan?.fileName
                                            ].filter(Boolean).length

                                            return (
                                                <TableRow key={stud._id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-bold text-gray-800">{stud.name}</p>
                                                            <p className="text-xs text-gray-500">{stud.nim_nip} &middot; Semester {stud.semester || '8'}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate font-medium text-gray-600">
                                                        {stud.judulTA || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-gray-700">
                                                        <Badge variant="outline" className="border-gray-200">
                                                            {totalFiles}/4 Terunggah
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={`${getStatusBadge(doc?.statusVerifikasi)} border hover:bg-transparent shadow-none font-medium`}>
                                                            {getStatusLabel(doc?.statusVerifikasi)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            size="sm"
                                                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 hover:border-orange-300 font-semibold flex items-center gap-1 mx-auto"
                                                            onClick={() => handleOpenVerify(stud)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Periksa Berkas
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </motion.div>
                    </motion.div>
                </main>
            </div>

            {/* Verification Detail Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-800">Detail Evaluasi Berkas Wisuda</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Periksa kelayakan 4 file PDF mahasiswa berikut sebelum memberikan keputusan persetujuan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-6 my-4">
                            {/* Student summary */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800">{selectedStudent.name}</h4>
                                    <p className="text-xs text-gray-500">{selectedStudent.nim_nip} &middot; {selectedStudent.prodi || 'Sistem Informasi'}</p>
                                </div>
                                <Badge className={`${getStatusBadge(selectedStudent.dokumenWisuda?.statusVerifikasi)}`}>
                                    {getStatusLabel(selectedStudent.dokumenWisuda?.statusVerifikasi)}
                                </Badge>
                            </div>

                            {/* File list */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">File Dokumen Wisuda</h4>

                                {/* 1. Skripsi Lengkap */}
                                <div className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-red-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">1. File Skripsi Lengkap (Full)</p>
                                            <p className="text-xs text-gray-400">
                                                {selectedStudent.dokumenWisuda?.skripsiFull?.fileOriginalName || 'Belum diunggah'} &middot; {selectedStudent.dokumenWisuda?.skripsiFull?.fileSize || ''}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedStudent.dokumenWisuda?.skripsiFull?.filePath && (
                                        <div className="flex gap-2">
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.skripsiFull.filePath)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                                                title="Pratinjau File"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.skripsiFull.filePath)}
                                                download={selectedStudent.dokumenWisuda.skripsiFull.fileOriginalName}
                                                className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                title="Unduh File"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* 2. PPT Skripsi */}
                                <div className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">2. PPT Presentasi Skripsi</p>
                                            <p className="text-xs text-gray-400">
                                                {selectedStudent.dokumenWisuda?.pptSkripsi?.fileOriginalName || 'Belum diunggah'} &middot; {selectedStudent.dokumenWisuda?.pptSkripsi?.fileSize || ''}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedStudent.dokumenWisuda?.pptSkripsi?.filePath && (
                                        <div className="flex gap-2">
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.pptSkripsi.filePath)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                                                title="Pratinjau File"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.pptSkripsi.filePath)}
                                                download={selectedStudent.dokumenWisuda.pptSkripsi.fileOriginalName}
                                                className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                title="Unduh File"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Halaman Pengesahan */}
                                <div className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">3. Halaman Pengesahan (Tanda Tangan)</p>
                                            <p className="text-xs text-gray-400">
                                                {selectedStudent.dokumenWisuda?.halamanPengesahan?.fileOriginalName || 'Belum diunggah'} &middot; {selectedStudent.dokumenWisuda?.halamanPengesahan?.fileSize || ''}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedStudent.dokumenWisuda?.halamanPengesahan?.filePath && (
                                        <div className="flex gap-2">
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.halamanPengesahan.filePath)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                                                title="Pratinjau File"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.halamanPengesahan.filePath)}
                                                download={selectedStudent.dokumenWisuda.halamanPengesahan.fileOriginalName}
                                                className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                title="Unduh File"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Form Bimbingan */}
                                <div className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-green-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">4. Form Logbook Bimbingan</p>
                                            <p className="text-xs text-gray-400">
                                                {selectedStudent.dokumenWisuda?.formBimbingan?.fileOriginalName || 'Belum diunggah'} &middot; {selectedStudent.dokumenWisuda?.formBimbingan?.fileSize || ''}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedStudent.dokumenWisuda?.formBimbingan?.filePath && (
                                        <div className="flex gap-2">
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.formBimbingan.filePath)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                                                title="Pratinjau File"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={getFileUrl(selectedStudent.dokumenWisuda.formBimbingan.filePath)}
                                                download={selectedStudent.dokumenWisuda.formBimbingan.fileOriginalName}
                                                className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                title="Unduh File"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decision inputs */}
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Hasil Verifikasi</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 font-bold transition-all ${
                                            decision === 'disetujui'
                                                ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setDecision('disetujui')}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Setujui Berkas
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 font-bold transition-all ${
                                            decision === 'ditolak'
                                                ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setDecision('ditolak')}
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Tolak Berkas
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="catatanAdmin" className="block text-sm font-bold text-gray-700">
                                        Catatan Evaluasi {decision === 'ditolak' && <span className="text-red-500">*</span>}
                                    </label>
                                    <textarea
                                        id="catatanAdmin"
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={
                                            decision === 'disetujui'
                                                ? 'Catatan selamat atau info pengambilan ijazah (opsional)...'
                                                : 'Sebutkan berkas mana yang salah/belum sesuai dan alasan penolakannya (wajib)...'
                                        }
                                        className="w-full rounded-2xl border border-gray-200 p-4 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-shadow hover:shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setShowModal(false); setSelectedStudent(null) }} className="rounded-xl">
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveVerification}
                            disabled={isSaving}
                            className={`rounded-xl font-semibold text-white ${
                                decision === 'disetujui' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Verifikasi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
