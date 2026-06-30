import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
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
    Calendar,
    FileText,
    ChevronDown,
    LogOut,
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

type UploadFieldErrors = {
    bab?: string
    judul?: string
    dosenType?: string
    file?: string
    catatan?: string
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/dashboard/mahasiswa' },
]

const aktivitasItems = [
    { label: 'Bimbingan', icon: FileEdit, active: true, path: '/bimbingan/mahasiswa' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

const babOptions = ['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'BAB VI'] as const
type BabOption = typeof babOptions[number]

const semproLimitedStatuses = ['pra_sempro', 'menunggu_sempro', 'revisi_sempro']

const getAllowedBabOptions = (statusMahasiswa?: string): BabOption[] => {
    if (semproLimitedStatuses.includes(statusMahasiswa || 'pra_sempro')) {
        return [...babOptions.slice(0, 3)]
    }

    return [...babOptions]
}

const getInitialBab = (currentProgress?: string, statusMahasiswa?: string): BabOption => {
    const allowed = getAllowedBabOptions(statusMahasiswa)
    return allowed.includes(currentProgress as BabOption)
        ? currentProgress as BabOption
        : allowed[0]
}

export const BimbinganMahasiswa = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useAppSelector((state) => state.auth)
    const allowedBabOptions = getAllowedBabOptions(user?.statusMahasiswa)
    const allowedBabKey = allowedBabOptions.join('|')

    // Check if in revision phase
    const isRevisionPhase = ['revisi_sempro', 'revisi_semhas', 'revisi_sidang'].includes(user?.statusMahasiswa || 'pra_sempro')

    // Sub-navigation tabs: Pembimbing vs. Penguji
    const [activeCategory, setActiveCategory] = useState<'pembimbing' | 'penguji'>(
        isRevisionPhase ? 'penguji' : 'pembimbing'
    )

    // Sub-tab: dospem1 | dospem2 | penguji1 | penguji2
    const tabFromUrl = searchParams.get('tab') as 'dospem1' | 'dospem2' | 'penguji1' | 'penguji2' | null
    const [activeSubTab, setActiveSubTab] = useState<'dospem1' | 'dospem2' | 'penguji1' | 'penguji2'>(
        tabFromUrl || (isRevisionPhase ? 'penguji1' : 'dospem1')
    )

    const [selectedBab, setSelectedBab] = useState<BabOption>(() => getInitialBab(user?.currentProgress, user?.statusMahasiswa))
    const [judulBimbingan, setJudulBimbingan] = useState('')
    const [catatan, setCatatan] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // API states
    const [bimbinganList, setBimbinganList] = useState<Bimbingan[]>([])
    const [, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isUploadFormOpen, setIsUploadFormOpen] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<UploadFieldErrors>({})

    // Dospem info from user (handle both string and object types)
    const dospem1Name = typeof user?.dospem_1 === 'object' ? user.dospem_1?.name : 'Dosen Pembimbing 1'
    const dospem2Name = typeof user?.dospem_2 === 'object' ? user.dospem_2?.name : 'Dosen Pembimbing 2'
    const penguji1Name = typeof user?.penguji_1 === 'object' ? user.penguji_1?.name : 'Dosen Penguji 1'
    const penguji2Name = typeof user?.penguji_2 === 'object' ? user.penguji_2?.name : 'Dosen Penguji 2'

    const getDosenTypeFromSubTab = (subTab: string) => {
        switch (subTab) {
            case 'dospem1': return 'dospem_1';
            case 'dospem2': return 'dospem_2';
            case 'penguji1': return 'penguji_1';
            case 'penguji2': return 'penguji_2';
            default: return 'dospem_1';
        }
    }

    const handleCategoryChange = (category: 'pembimbing' | 'penguji') => {
        setActiveCategory(category)
        if (category === 'pembimbing') {
            setActiveSubTab('dospem1')
        } else {
            setActiveSubTab('penguji1')
        }
    }

    // Fetch bimbingan data
    const fetchBimbingan = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await bimbinganService.getBimbinganList({
                dosenType: getDosenTypeFromSubTab(activeSubTab),
                limit: 50
            })
            setBimbinganList(response.data || [])
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Gagal memuat data bimbingan')
        } finally {
            setIsLoading(false)
        }
    }, [activeSubTab])

    useEffect(() => {
        fetchBimbingan()
    }, [fetchBimbingan])

    const currentDosenType = getDosenTypeFromSubTab(activeSubTab)
    const currentHistory = bimbinganList.filter((item) => item.dosenType === currentDosenType)
    const latestStatus = currentHistory[0]?.status
    const isFormDisabled = latestStatus === 'menunggu'
    const hasHistory = currentHistory.length > 0
    const shouldShowUploadForm = (!hasHistory || isUploadFormOpen) && !isFormDisabled

    useEffect(() => {
        const allowed = allowedBabKey.split('|') as BabOption[]
        if (!allowed.includes(selectedBab)) {
            setSelectedBab(allowed[0])
        }
    }, [allowedBabKey, selectedBab])

    useEffect(() => {
        setExpandedId(null)
        setReplyText('')
        setIsUploadFormOpen(false)
        setSelectedBab(getInitialBab(user?.currentProgress, user?.statusMahasiswa))
        setJudulBimbingan('')
        setCatatan('')
        setSelectedFile(null)
        setError(null)
        setSuccessMessage(null)
        setFieldErrors({})
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [activeSubTab])

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
            setError(null)
            setFieldErrors((current) => ({ ...current, file: undefined }))
            setSelectedFile(file)
        } else {
            setSelectedFile(null)
            setSuccessMessage(null)
            setFieldErrors((current) => ({
                ...current,
                file: file ? 'File harus berformat PDF.' : 'File PDF wajib diunggah.'
            }))
        }
    }

    const validateUploadForm = () => {
        const nextErrors: UploadFieldErrors = {}
        const judul = judulBimbingan.trim()
        const finalJudul = `${selectedBab} - ${judul}`
        const currentDosenType = getDosenTypeFromSubTab(activeSubTab)

        if (!allowedBabOptions.includes(selectedBab)) {
            nextErrors.bab = 'BAB tidak sesuai dengan tahap bimbingan saat ini.'
        }

        if (!judul) {
            nextErrors.judul = 'Judul bimbingan wajib diisi.'
        } else if (judul.length < 5) {
            nextErrors.judul = 'Judul bimbingan minimal 5 karakter.'
        } else if (finalJudul.length > 200) {
            nextErrors.judul = 'Judul bimbingan maksimal 200 karakter.'
        }

        if (!currentDosenType) {
            nextErrors.dosenType = 'Pilih dosen terlebih dahulu.'
        }

        if (!selectedFile) {
            nextErrors.file = 'File PDF wajib diunggah.'
        } else if (selectedFile.type !== 'application/pdf') {
            nextErrors.file = 'File harus berformat PDF.'
        }

        if (catatan.length > 1000) {
            nextErrors.catatan = 'Catatan maksimal 1000 karakter.'
        }

        setFieldErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const buildJudulBimbingan = () => `${selectedBab} - ${judulBimbingan.trim()}`

    const mapBackendValidationErrors = (errors: Array<{ field?: string; message?: string }> = []) => {
        const nextErrors: UploadFieldErrors = {}

        errors.forEach((item) => {
            if (!item.field || !item.message) return

            if (item.field === 'judul') nextErrors.judul = item.message
            if (item.field === 'dosenType') nextErrors.dosenType = item.message
            if (item.field === 'catatan') nextErrors.catatan = item.message
            if (item.field === 'file') nextErrors.file = item.message
        })

        setFieldErrors(nextErrors)
        return Object.keys(nextErrors).length > 0
    }

    const handleSubmit = async () => {
        if (!validateUploadForm()) {
            setSuccessMessage(null)
            setError(null)
            return
        }

        setIsSubmitting(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const fileToUpload = selectedFile as File

            await bimbinganService.createBimbingan({
                judul: buildJudulBimbingan(),
                dosenType: getDosenTypeFromSubTab(activeSubTab) as any,
                catatan: catatan.trim() || undefined,
                file: fileToUpload
            })

            setSuccessMessage('Bimbingan berhasil dikirim! Menunggu feedback dari dosen.')
            setJudulBimbingan('')
            setCatatan('')
            setSelectedFile(null)
            setIsUploadFormOpen(false)
            setFieldErrors({})
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            // Refresh list
            await fetchBimbingan()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } } }
            const hasFieldError = mapBackendValidationErrors(error.response?.data?.errors || [])
            setError(hasFieldError ? null : error.response?.data?.message || 'Gagal mengirim bimbingan. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSendReply = async (bimbinganId: string) => {
        if (!replyText.trim()) return

        try {
            setError(null)
            setSuccessMessage(null)
            await bimbinganService.addReply(bimbinganId, { message: replyText })
            setReplyText('')
            setSuccessMessage('Balasan berhasil dikirim.')
            // Refresh to show new reply
            await fetchBimbingan()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setSuccessMessage(null)
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
            case 'acc_sempro':
                return <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-100 border-0"><CheckCircle className="w-3 h-3 mr-1" />ACC Sidang</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const handleToggleUploadForm = () => {
        setIsUploadFormOpen((current) => {
            const nextOpen = !current
            return nextOpen
        })
    }

    const renderProgressTimeline = () => {
        const status = user?.statusMahasiswa || 'pra_sempro';

        const getStepStatus = (step: 'sempro' | 'semhas' | 'sidang') => {
            if (step === 'sempro') {
                if (['pra_sempro', 'menunggu_sempro'].includes(status)) return 'active';
                if (status === 'revisi_sempro') return 'revision';
                return 'completed';
            }
            if (step === 'semhas') {
                if (['pra_sempro', 'menunggu_sempro', 'revisi_sempro', 'bimbingan_lanjut'].includes(status)) return 'upcoming';
                if (status === 'menunggu_semhas') return 'active';
                if (status === 'revisi_semhas') return 'revision';
                return 'completed';
            }
            if (step === 'sidang') {
                if (['menunggu_sidang'].includes(status)) return 'active';
                if (status === 'revisi_sidang') return 'revision';
                if (['persiapan_wisuda', 'selesai'].includes(status)) return 'completed';
                return 'upcoming';
            }
            return 'upcoming';
        };

        const steps = [
            { key: 'sempro', label: 'Seminar Proposal', desc: ['revisi_sempro'].includes(status) ? 'Revisi Penguji' : ['menunggu_sempro'].includes(status) ? 'Menunggu Jadwal' : 'Bimbingan Dospem' },
            { key: 'semhas', label: 'Seminar Hasil', desc: ['revisi_semhas'].includes(status) ? 'Revisi Penguji' : ['menunggu_semhas'].includes(status) ? 'Menunggu Jadwal' : 'Bimbingan Dospem' },
            { key: 'sidang', label: 'Sidang Akhir', desc: ['revisi_sidang'].includes(status) ? 'Revisi Penguji' : ['menunggu_sidang'].includes(status) ? 'Menunggu Jadwal' : ['persiapan_wisuda', 'selesai'].includes(status) ? 'Selesai' : 'Bimbingan Dospem' }
        ];

        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Timeline Progres Tugas Akhir</h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-center md:text-left">
                    {steps.map((step, idx) => {
                        const stepStatus = getStepStatus(step.key as any);
                        let circleClass = 'bg-gray-100 text-gray-400';
                        let textClass = 'text-gray-500';
                        let descClass = 'text-gray-400';

                        if (stepStatus === 'completed') {
                            circleClass = 'bg-green-500 text-white shadow-md shadow-green-500/20';
                            textClass = 'text-green-700 font-semibold';
                            descClass = 'text-green-500 font-medium';
                        } else if (stepStatus === 'active') {
                            circleClass = 'bg-blue-500 text-white shadow-md shadow-blue-500/20 animate-pulse';
                            textClass = 'text-blue-700 font-bold';
                            descClass = 'text-blue-500 font-medium';
                        } else if (stepStatus === 'revision') {
                            circleClass = 'bg-red-500 text-white shadow-md shadow-red-500/20';
                            textClass = 'text-red-700 font-bold';
                            descClass = 'text-red-500 font-medium';
                        }

                        return (
                            <div key={step.key} className="flex-1 flex flex-col md:flex-row items-center w-full relative">
                                <div className="flex flex-col items-center text-center md:text-left md:items-start z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${circleClass}`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-sm ${textClass}`}>{step.label}</span>
                                    <span className={`text-xs ${descClass}`}>{step.desc}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`hidden md:block absolute left-10 right-0 top-5 h-0.5 -z-0 ${
                                        getStepStatus(steps[idx+1].key as any) !== 'upcoming' ? 'bg-green-500' : 'bg-gray-100'
                                    }`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderHistoryAndForm = () => {
        return (
            <>
                <AnimatePresence>
                    {(error || successMessage) && (
                        <motion.div
                            variants={itemVariants}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className={`flex items-center gap-3 rounded-xl border p-4 ${error
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-green-200 bg-green-50 text-green-700'
                                }`}
                        >
                            {error ? (
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            ) : (
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            )}
                            <p className="text-sm font-medium">{error || successMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                        Mulai kirim bimbingan pertama Anda dengan mengisi form di bawah
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
                                                        <span>-</span>
                                                        <span>{item.fileSize}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(item.status)}
                                                <motion.div animate={{ rotate: expandedId === item._id ? 90 : 0 }}>
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                </motion.div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">Dikirim: {item.tanggalKirim}</p>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === item._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100"
                                            >
                                                <div className="p-4 space-y-4">
                                                    <div className="bg-blue-50 rounded-xl p-3">
                                                        <p className="text-xs font-medium text-blue-600 mb-1">Catatan Anda:</p>
                                                        <p className="text-sm text-gray-700">{item.catatan}</p>
                                                    </div>

                                                    {item.feedback && (
                                                        <div className="bg-gray-50 rounded-xl p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                                                <p className="text-xs font-medium text-gray-600">Feedback Dosen ({item.tanggalFeedback}):</p>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{item.feedback}</p>
                                                        </div>
                                                    )}

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

                    {hasHistory && !isFormDisabled && (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleToggleUploadForm}
                                style={{
                                    backgroundColor: isUploadFormOpen ? '#ffffff' : '#2563eb',
                                    borderColor: isUploadFormOpen ? '#93c5fd' : '#2563eb',
                                    color: isUploadFormOpen ? '#2563eb' : '#ffffff',
                                }}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
                            >
                                <Upload className="w-4 h-4" />
                                {isUploadFormOpen ? 'Tutup Form' : 'Kirim Bimbingan Baru'}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Upload Form */}
                <AnimatePresence initial={false}>
                    {shouldShowUploadForm && (
                        <motion.div
                            variants={itemVariants}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${isFormDisabled ? 'opacity-60' : ''}`}
                        >
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

                            {fieldErrors.dosenType && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <p className="text-sm font-medium text-red-700">{fieldErrors.dosenType}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Topik Bimbingan</label>
                                    <div
                                        className={`flex h-11 items-center overflow-hidden rounded-xl border bg-white shadow-xs transition-[color,box-shadow] focus-within:border-blue-400 focus-within:ring-[3px] focus-within:ring-blue-100 ${
                                            fieldErrors.bab || fieldErrors.judul
                                                ? 'border-red-300 bg-red-50 focus-within:border-red-300 focus-within:ring-red-100'
                                                : 'border-input'
                                        } ${isFormDisabled ? 'bg-gray-50 opacity-70' : ''}`}
                                    >
                                        <div className="w-32 shrink-0 border-r border-gray-200">
                                            <Select
                                                value={selectedBab}
                                                onValueChange={(value) => {
                                                    setSelectedBab(value as BabOption)
                                                    setFieldErrors((current) => ({ ...current, bab: undefined, judul: undefined }))
                                                }}
                                                disabled={isFormDisabled}
                                            >
                                                <SelectTrigger className="h-11 w-full rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:border-transparent focus-visible:ring-0">
                                                    <SelectValue placeholder="Pilih BAB" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allowedBabOptions.map((bab) => (
                                                        <SelectItem key={bab} value={bab}>{bab}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Input
                                            placeholder="Contoh: Metodologi Penelitian"
                                            value={judulBimbingan}
                                            onChange={(e) => {
                                                setJudulBimbingan(e.target.value)
                                                setFieldErrors((current) => ({ ...current, judul: undefined }))
                                            }}
                                            disabled={isFormDisabled}
                                            className="h-11 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
                                        />
                                    </div>
                                    {(fieldErrors.bab || fieldErrors.judul) && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {fieldErrors.bab || fieldErrors.judul}
                                        </p>
                                    )}
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
                                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${fieldErrors.file
                                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                                            : isFormDisabled ? 'border-gray-200 bg-gray-50' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                                            }`}
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
                                    {fieldErrors.file && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {fieldErrors.file}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                                    <Textarea
                                        placeholder="Jelaskan apa saja yang sudah diperbaiki atau ditambahkan..."
                                        value={catatan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                            setCatatan(e.target.value)
                                            setFieldErrors((current) => ({ ...current, catatan: undefined }))
                                        }}
                                        disabled={isFormDisabled}
                                        className={`rounded-xl min-h-[100px] ${fieldErrors.catatan ? 'border-red-300 bg-red-50 focus-visible:ring-red-200' : ''}`}
                                    />
                                    <div className="mt-1.5 flex items-center justify-between gap-2">
                                        {fieldErrors.catatan ? (
                                            <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {fieldErrors.catatan}
                                            </p>
                                        ) : (
                                            <span />
                                        )}
                                        <p className={`text-xs ${catatan.length > 1000 ? 'text-red-600' : 'text-gray-400'}`}>
                                            {catatan.length}/1000
                                        </p>
                                    </div>
                                </div>

                                <motion.div whileHover={{ scale: isFormDisabled ? 1 : 1.01 }} whileTap={{ scale: isFormDisabled ? 1 : 0.99 }}>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isFormDisabled || isSubmitting}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-6"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        {isSubmitting ? 'Mengirim...' : 'Kirim Bimbingan'}
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    };

    const isPembimbingLocked = isRevisionPhase;
    const isPengujiLocked = !isRevisionPhase;
    const currentPenguji = activeSubTab === 'penguji1' ? user?.penguji_1 : user?.penguji_2;
    const hasCurrentPenguji = typeof currentPenguji === 'object' ? Boolean((currentPenguji as any)?._id) : Boolean(currentPenguji);

    const renderContent = () => {
        const isGraduated = ['persiapan_wisuda', 'selesai'].includes(user?.statusMahasiswa || '');
        if (isGraduated) {
            return (
                <motion.div
                    key="graduated_locked"
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center"
                >
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Seluruh Tahap Bimbingan Selesai</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        Selamat! Anda telah menyelesaikan seluruh rangkaian bimbingan dan revisi skripsi.
                        Silakan buka halaman <strong>Dashboard</strong> untuk mengunggah dokumen persiapan wisuda Anda.
                    </p>
                </motion.div>
            );
        }

        if (activeCategory === 'pembimbing') {
            if (isPembimbingLocked) {
                return (
                    <motion.div
                        key="pembimbing_locked"
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Bimbingan Pembimbing Dikunci Sementara</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                            Anda sedang dalam fase revisi pasca ujian. Silakan selesaikan bimbingan revisi dengan <strong>Dosen Penguji</strong> terlebih dahulu hingga mendapatkan ACC dari kedua penguji untuk membuka kembali bimbingan pembimbing.
                        </p>
                    </motion.div>
                );
            }

            return (
                <motion.div
                    key={`pembimbing_${activeSubTab}`}
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-6"
                >
                    <motion.div variants={itemVariants} className="flex gap-2">
                        <motion.button
                            onClick={() => setActiveSubTab('dospem1')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeSubTab === 'dospem1' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
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
                            onClick={() => setActiveSubTab('dospem2')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeSubTab === 'dospem2' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
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

                    {renderHistoryAndForm()}
                </motion.div>
            );
        }

        if (isPengujiLocked) {
            return (
                <motion.div
                    key="penguji_locked"
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center"
                >
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Bimbingan Penguji Belum Dibuka</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        Bimbingan revisi dengan Dosen Penguji belum aktif. Tahap ini hanya akan terbuka secara otomatis setelah Anda selesai melaksanakan ujian (Seminar Proposal, Seminar Hasil, atau Sidang Akhir).
                    </p>
                </motion.div>
            );
        }

        if (!hasCurrentPenguji) {
            return (
                <motion.div
                    key={`penguji_unassigned_${activeSubTab}`}
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-6"
                >
                    <motion.div variants={itemVariants} className="flex gap-2">
                        <motion.button
                            onClick={() => setActiveSubTab('penguji1')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeSubTab === 'penguji1' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <User className="w-4 h-4" />
                                Dosen Penguji 1
                            </div>
                            <p className="text-xs mt-1 opacity-80">{penguji1Name}</p>
                        </motion.button>
                        <motion.button
                            onClick={() => setActiveSubTab('penguji2')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeSubTab === 'penguji2' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <User className="w-4 h-4" />
                                Dosen Penguji 2
                            </div>
                            <p className="text-xs mt-1 opacity-80">{penguji2Name}</p>
                        </motion.button>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center mt-6"
                    >
                        <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Dosen Penguji Belum Ditentukan</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                            Dosen penguji untuk sesi revisi Anda belum di-assign oleh Admin. Silakan hubungi admin program studi untuk menugaskan penguji Anda.
                        </p>
                    </motion.div>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={`penguji_${activeSubTab}`}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
            >
                <motion.div variants={itemVariants} className="flex gap-2">
                    <motion.button
                        onClick={() => setActiveSubTab('penguji1')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeSubTab === 'penguji1' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <User className="w-4 h-4" />
                            Dosen Penguji 1
                        </div>
                        <p className="text-xs mt-1 opacity-80">{penguji1Name}</p>
                    </motion.button>
                    <motion.button
                        onClick={() => setActiveSubTab('penguji2')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${activeSubTab === 'penguji2' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <User className="w-4 h-4" />
                            Dosen Penguji 2
                        </div>
                        <p className="text-xs mt-1 opacity-80">{penguji2Name}</p>
                    </motion.button>
                </motion.div>

                {renderHistoryAndForm()}
            </motion.div>
        );
    };



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
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-4xl mx-auto">

                        {/* Timeline Progres */}
                        {renderProgressTimeline()}

                        {/* Kategori Bimbingan Tabs */}
                        <motion.div variants={itemVariants} className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
                            <button
                                type="button"
                                onClick={() => handleCategoryChange('pembimbing')}
                                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                                    activeCategory === 'pembimbing'
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Bimbingan Pembimbing
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCategoryChange('penguji')}
                                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                                    activeCategory === 'penguji'
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Bimbingan Penguji
                            </button>
                        </motion.div>

                        {renderContent()}

                    </motion.div>
                </main>
            </div>
        </div>
    )
}
