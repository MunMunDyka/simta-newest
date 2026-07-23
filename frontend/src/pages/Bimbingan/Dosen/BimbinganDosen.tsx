import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
    CalendarCheck,
    ChevronDown,
    LogOut,
    User,
    FileText,
    Send,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    MessageSquare,
    Download,
    Eye,
    Paperclip,
    ArrowLeft,
    GraduationCap,
    Upload,
    AlertCircle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { RoleSwitchMenuItem } from '@/components/RoleSwitchMenuItem'
import { getApiErrorMessage } from '@/lib/errorMessage'
import { downloadWisudaFile, previewWisudaFile } from '@/services/wisudaService'
import { type DokumenWisuda, type FileWisuda, type User as AuthUser } from '@/services/authService'
import {
    downloadPengajuanSeminarFile,
    getPengajuanSeminar,
    previewPengajuanSeminarFile,
    type PengajuanSeminar,
} from '@/services/pengajuanSeminarService'

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/dashboard/dosen' },
]

const managementItems = [
    { label: 'Mahasiswa Bimbingan', icon: Users, path: '/dosen/mahasiswa' },
    { label: 'Jadwal Penguji', icon: CalendarCheck, path: '/dosen/jadwal-penguji' },
    { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
]

type FeedbackFieldErrors = {
    status?: string
    feedback?: string
    feedbackFile?: string
}

type FeedbackStatus = 'revisi' | 'acc' | 'lanjut_bab' | 'acc_sempro'

type MahasiswaDetail = Pick<AuthUser, '_id' | 'name' | 'nim_nip' | 'prodi' | 'currentProgress' | 'judulTA' | 'statusMahasiswa' | 'dokumenWisuda'>
type WisudaFileLike = Partial<FileWisuda> | null | undefined
type BimbinganReply = {
    _id: string
    id?: string
    senderRole: 'mahasiswa' | 'dosen'
    message: string
    timestamp?: string
    formattedTime?: string
    createdAt?: string
}

const finalStageStatuses = ['persiapan_wisuda', 'selesai']

const isFinalStage = (status?: string) => finalStageStatuses.includes(status || '')

const getDisplayedProgress = (mahasiswa?: MahasiswaDetail | null) => {
    if (!mahasiswa) return '-'
    if (isFinalStage(mahasiswa.statusMahasiswa)) return 'Selesai'
    return mahasiswa.currentProgress || 'BAB I'
}

const getSeminarTarget = (statusMahasiswa?: string) => {
    const seminarHasilStatuses = ['bimbingan_lanjut', 'menunggu_semhas', 'revisi_semhas']

    if (seminarHasilStatuses.includes(statusMahasiswa || '')) {
        return {
            label: 'Seminar Hasil',
            accLabel: 'ACC Seminar Hasil',
            description: 'Mahasiswa disetujui untuk mengajukan Seminar Hasil'
        }
    }

    return {
        label: 'Seminar Proposal',
        accLabel: 'ACC Seminar Proposal',
        description: 'Mahasiswa disetujui untuk mengajukan Seminar Proposal'
    }
}

const getFeedbackOptions = (
    statusMahasiswa: string | undefined,
    currentProgress: string | undefined,
    relation: string | undefined,
    bimbinganCount: number,
    minBimbingan: number
) => {
    const status = statusMahasiswa || 'pra_sempro'
    const isPenguji = relation === 'penguji_1' || relation === 'penguji_2'
    const options: FeedbackStatus[] = ['revisi', 'acc']

    if (isPenguji || ['revisi_sempro', 'revisi_semhas', 'revisi_sidang'].includes(status)) {
        return options
    }

    const blocksSemproBoundary = ['pra_sempro', 'menunggu_sempro'].includes(status) && currentProgress === 'BAB III'
    const blocksSemhasBoundary = ['bimbingan_lanjut', 'menunggu_semhas'].includes(status) && currentProgress === 'BAB V'
    const canMoveToNextBab = !blocksSemproBoundary && !blocksSemhasBoundary
    if (canMoveToNextBab && currentProgress !== 'BAB VI' && currentProgress !== 'Selesai') {
        options.push('lanjut_bab')
    }

    const isSeminarProposalPhase = ['pra_sempro', 'menunggu_sempro'].includes(status)
    const isSeminarHasilPhase = ['bimbingan_lanjut', 'menunggu_semhas'].includes(status)
    const canAccSeminar = (isSeminarProposalPhase || isSeminarHasilPhase) && bimbinganCount >= minBimbingan

    if (canAccSeminar) {
        options.push('acc_sempro')
    }

    return options
}

const hasWisudaFile = (file?: WisudaFileLike) => Boolean(file?.filePath || file?.fileName)

const hasAnyWisudaFile = (dokumenWisuda?: DokumenWisuda) => Boolean(dokumenWisuda && [
    dokumenWisuda.skripsiFull,
    dokumenWisuda.pptSkripsi,
    dokumenWisuda.halamanPengesahan,
    dokumenWisuda.formBimbingan,
].some(hasWisudaFile))

const getWisudaStatusBadge = (status?: DokumenWisuda['statusVerifikasi']) => {
    switch (status) {
        case 'disetujui':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Disetujui</Badge>
        case 'menunggu_verifikasi':
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">Menunggu Verifikasi</Badge>
        case 'ditolak':
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Ditolak</Badge>
        default:
            return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Belum Upload</Badge>
    }
}

const getPengajuanStatusBadge = (status?: string) => {
    switch (status) {
        case 'disetujui':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Disetujui</Badge>
        case 'menunggu_verifikasi':
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">Menunggu Verifikasi</Badge>
        case 'ditolak':
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Ditolak</Badge>
        default:
            return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Belum Upload</Badge>
    }
}

const getPengajuanLabel = (jenis?: string) => {
    if (jenis === 'seminar_hasil') return 'Seminar Hasil'
    return 'Seminar Proposal'
}

export const BimbinganDosen = () => {
    const { mahasiswaId } = useParams()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [status, setStatus] = useState<string>('')
    const [feedback, setFeedback] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [draftFileName, setDraftFileName] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [formSuccess, setFormSuccess] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<FeedbackFieldErrors>({})
    const [minBimbinganSempro, setMinBimbinganSempro] = useState(5)
    const [mahasiswaDetail, setMahasiswaDetail] = useState<MahasiswaDetail | null>(null)
    const [wisudaError, setWisudaError] = useState<string | null>(null)
    const [pengajuanSeminar, setPengajuanSeminar] = useState<PengajuanSeminar[]>([])
    const [pengajuanError, setPengajuanError] = useState<string | null>(null)
    const [bimbinganData, setBimbinganData] = useState<{
        id: string
        mahasiswa: MahasiswaDetail
        version: string
        judul: string
        fileName: string
        fileSize: string
        catatan: string
        status: string
        createdAt: string
        dosenType?: string
        kategoriBimbingan?: string
    } | null>(null)
    // State for bimbingan history
    const [bimbinganHistory, setBimbinganHistory] = useState<Array<{
        id: string
        version: string
        judul: string
        fileName: string
        fileSize: string
        catatan: string
        status: string
        feedback: string
        feedbackDate: string
        feedbackFile?: string
        feedbackFileName?: string
        createdAt: string
        dosenType?: string
        kategoriBimbingan?: string
        replies?: BimbinganReply[]
    }>>([]);
    const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const displayMahasiswa = mahasiswaDetail || bimbinganData?.mahasiswa || null
    const seminarTarget = getSeminarTarget(displayMahasiswa?.statusMahasiswa)
    const feedbackOptions = getFeedbackOptions(
        displayMahasiswa?.statusMahasiswa,
        displayMahasiswa?.currentProgress,
        bimbinganData?.dosenType,
        bimbinganHistory.length,
        minBimbinganSempro
    )
    const showWisudaCard = Boolean(displayMahasiswa && (isFinalStage(displayMahasiswa.statusMahasiswa) || hasAnyWisudaFile(displayMahasiswa.dokumenWisuda)))
    const showPengajuanCard = pengajuanSeminar.length > 0
    const wisudaDocuments = displayMahasiswa?.dokumenWisuda ? [
        { key: 'skripsiFull', label: 'Skripsi Lengkap', file: displayMahasiswa.dokumenWisuda.skripsiFull },
        { key: 'pptSkripsi', label: 'PPT Presentasi Skripsi', file: displayMahasiswa.dokumenWisuda.pptSkripsi },
        { key: 'halamanPengesahan', label: 'Halaman Pengesahan', file: displayMahasiswa.dokumenWisuda.halamanPengesahan },
        { key: 'formBimbingan', label: 'Form/Logbook Bimbingan', file: displayMahasiswa.dokumenWisuda.formBimbingan },
    ] : []

    useEffect(() => {
        if (status && !feedbackOptions.includes(status as FeedbackStatus)) {
            setStatus('')
            setFieldErrors((current) => ({ ...current, status: undefined }))
        }
    }, [feedbackOptions, status])

    // Fetch bimbingan data
    useEffect(() => {
        const fetchBimbingan = async () => {
            if (!mahasiswaId) return

            try {
                setIsLoading(true)
                setLoadError(null)
                setWisudaError(null)
                setPengajuanError(null)
                // Fetch ALL bimbingan for this mahasiswa (no limit - for history)
                const [response, mahasiswaResponse, pengajuanResponse] = await Promise.all([
                    api.get(`/bimbingan`, {
                        params: {
                            mahasiswaId: mahasiswaId
                        }
                    }),
                    api.get(`/users/${mahasiswaId}`),
                    getPengajuanSeminar({ mahasiswaId, limit: 10 })
                ])

                const bimbinganList = response.data.data
                const mahasiswaFromApi = mahasiswaResponse.data.data as MahasiswaDetail
                setMahasiswaDetail(mahasiswaFromApi)
                setPengajuanSeminar(pengajuanResponse.data || [])
                console.log('Bimbingan API Response:', bimbinganList)

                try {
                    const semproResponse = await api.get(`/bimbingan/sempro-status/${mahasiswaId}`)
                    const semproData = semproResponse.data.data
                    const currentDosenType = bimbinganList?.[0]?.dosenType
                    const requiredByDosen = currentDosenType === 'dospem_2'
                        ? semproData.dospem2?.required
                        : semproData.dospem1?.required
                    setMinBimbinganSempro(requiredByDosen || semproData.minRequired || 5)
                } catch (semproError) {
                    console.warn('Failed to fetch sempro requirement:', semproError)
                }

                if (bimbinganList && bimbinganList.length > 0) {
                    // Set the latest bimbingan as primary data
                    const data = bimbinganList[0]
                    console.log('Mahasiswa data:', data.mahasiswa)
                    console.log('judulTA:', data.mahasiswa?.judulTA)
                    console.log('Bimbingan STATUS:', data.status)
                    setBimbinganData({
                        id: data._id,
                        mahasiswa: mahasiswaFromApi || data.mahasiswa,
                        version: `V${data.version}`,
                        judul: data.judul,
                        fileName: data.fileOriginalName || data.fileName,
                        fileSize: data.fileSize ? `${(parseInt(data.fileSize) / 1024 / 1024).toFixed(2)} MB` : '-',
                        catatan: data.catatan || '',
                        status: data.status,
                        createdAt: new Date(data.createdAt).toLocaleString('id-ID'),
                        dosenType: data.dosenType,
                        kategoriBimbingan: data.kategoriBimbingan
                    })

                    // Auto-fill draft if available
                    if (data.status === 'menunggu' && data.hasDraft) {
                        setStatus(data.draftStatus || '')
                        setFeedback(data.draftFeedback || '')
                        setDraftFileName(data.draftFeedbackFileName || null)
                    } else {
                        setStatus('')
                        setFeedback('')
                        setDraftFileName(null)
                    }

                    // Set all bimbingan as history (including current)
                    const history = bimbinganList.map((item: any) => ({
                        id: item._id,
                        version: `V${item.version}`,
                        judul: item.judul,
                        fileName: item.fileOriginalName || item.fileName,
                        fileSize: item.fileSize ? `${(parseInt(item.fileSize) / 1024 / 1024).toFixed(2)} MB` : '-',
                        catatan: item.catatan || '',
                        status: item.status,
                        feedback: item.feedback || '',
                        feedbackDate: item.feedbackDate ? new Date(item.feedbackDate).toLocaleString('id-ID') : '-',
                        feedbackFile: item.feedbackFile || '',
                        feedbackFileName: item.feedbackFileName || '',
                        createdAt: new Date(item.createdAt).toLocaleString('id-ID'),
                        dosenType: item.dosenType,
                        kategoriBimbingan: item.kategoriBimbingan,
                        replies: item.replies || []
                    }));
                    setBimbinganHistory(history);
                } else {
                    console.log('No bimbingan found for this mahasiswa')
                    setBimbinganData(null)
                    setBimbinganHistory([]);
                }
            } catch (error) {
                console.error('Failed to fetch bimbingan:', error)
                setLoadError(getApiErrorMessage(error, 'Gagal memuat data bimbingan mahasiswa. Silakan refresh halaman.'))
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
        if (!file) {
            setSelectedFile(null)
            setFieldErrors((current) => ({ ...current, feedbackFile: undefined }))
            return
        }

        if (file.type !== 'application/pdf') {
            setSelectedFile(null)
            setFormSuccess(null)
            setFieldErrors((current) => ({ ...current, feedbackFile: 'Lampiran harus berformat PDF.' }))
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        setSelectedFile(file)
        setFieldErrors((current) => ({ ...current, feedbackFile: undefined }))
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
            setFormSuccess(null)
            setFormError('Gagal mendownload file')
        }
    }

    const handleDownloadFeedbackFile = async (bimbinganId: string, fileName?: string) => {
        if (!bimbinganId) return

        try {
            const response = await api.get(`/bimbingan/download-feedback/${bimbinganId}`, {
                responseType: 'blob'
            })

            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName || 'lampiran-feedback.pdf'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download lampiran feedback failed:', error)
            setFormSuccess(null)
            setFormError('Gagal mendownload lampiran feedback')
        }
    }

    const getWisudaFilePath = (file?: WisudaFileLike) => file?.filePath || file?.fileName || ''

    const handlePreviewWisudaFile = async (file?: WisudaFileLike) => {
        const filePath = getWisudaFilePath(file)
        if (!filePath) return

        try {
            setWisudaError(null)
            await previewWisudaFile(filePath)
        } catch (error) {
            console.error('Preview wisuda file failed:', error)
            setWisudaError(getApiErrorMessage(error, 'Gagal membuka berkas wisuda. Silakan coba lagi.'))
        }
    }

    const handleDownloadWisudaFile = async (file?: WisudaFileLike) => {
        const filePath = getWisudaFilePath(file)
        if (!filePath) return

        try {
            setWisudaError(null)
            await downloadWisudaFile(filePath, file?.fileOriginalName || file?.fileName || 'dokumen-wisuda.pdf')
        } catch (error) {
            console.error('Download wisuda file failed:', error)
            setWisudaError(getApiErrorMessage(error, 'Gagal mengunduh berkas wisuda. Silakan coba lagi.'))
        }
    }

    const handlePreviewPengajuanFile = async (pengajuan: PengajuanSeminar) => {
        if (!pengajuan.filePath) return

        try {
            setPengajuanError(null)
            await previewPengajuanSeminarFile(pengajuan.filePath)
        } catch (error) {
            setPengajuanError(getApiErrorMessage(error, 'Gagal membuka berkas pengajuan seminar. Silakan coba lagi.'))
        }
    }

    const handleDownloadPengajuanFile = async (pengajuan: PengajuanSeminar) => {
        if (!pengajuan.filePath) return

        try {
            setPengajuanError(null)
            await downloadPengajuanSeminarFile(
                pengajuan.filePath,
                pengajuan.fileOriginalName || pengajuan.fileName || 'pengajuan-seminar.pdf'
            )
        } catch (error) {
            setPengajuanError(getApiErrorMessage(error, 'Gagal mengunduh berkas pengajuan seminar. Silakan coba lagi.'))
        }
    }

    const getKategoriBadge = (kategori?: string) => {
        if (!kategori || kategori === 'bimbingan_dospem') return null;
        const config: Record<string, { label: string; className: string }> = {
            revisi_sempro: {
                label: 'Revisi Sempro',
                className: 'bg-orange-100 text-orange-700 border-0 hover:bg-orange-100'
            },
            revisi_semhas: {
                label: 'Revisi Semhas',
                className: 'bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-100'
            },
            revisi_sidang: {
                label: 'Revisi Sidang Akhir',
                className: 'bg-purple-100 text-purple-700 border-0 hover:bg-purple-100'
            }
        }
        const item = config[kategori];
        if (!item) return null;
        return (
            <Badge className={`${item.className} text-xs font-semibold py-1 px-3.5 rounded-full`}>
                {item.label}
            </Badge>
        )
    }

    const validateFeedbackForm = () => {
        const nextErrors: FeedbackFieldErrors = {}
        const cleanFeedback = feedback.trim()

        if (!status) {
            nextErrors.status = 'Status bimbingan wajib dipilih.'
        } else if (!feedbackOptions.includes(status as FeedbackStatus)) {
            nextErrors.status = 'Status bimbingan tidak sesuai dengan tahap mahasiswa saat ini.'
        }

        if (!cleanFeedback) {
            nextErrors.feedback = 'Komentar atau feedback wajib diisi.'
        } else if (cleanFeedback.length < 5) {
            nextErrors.feedback = 'Feedback minimal 5 karakter.'
        } else if (cleanFeedback.length > 2000) {
            nextErrors.feedback = 'Feedback maksimal 2000 karakter.'
        }

        if (selectedFile && selectedFile.type !== 'application/pdf') {
            nextErrors.feedbackFile = 'Lampiran harus berformat PDF.'
        }

        if (!bimbinganData?.id) {
            setFormError('Data bimbingan tidak ditemukan.')
        }

        setFieldErrors(nextErrors)
        return Object.keys(nextErrors).length === 0 && Boolean(bimbinganData?.id)
    }

    const mapBackendValidationErrors = (errors: Array<{ field?: string; message?: string }> = []) => {
        const nextErrors: FeedbackFieldErrors = {}

        errors.forEach((item) => {
            if (!item.field || !item.message) return

            if (item.field === 'status') nextErrors.status = item.message
            if (item.field === 'feedback') nextErrors.feedback = item.message
            if (item.field === 'feedbackFile') nextErrors.feedbackFile = item.message
        })

        setFieldErrors(nextErrors)
        return Object.keys(nextErrors).length > 0
    }

    const validateDraftForm = () => {
        const nextErrors: FeedbackFieldErrors = {}
        const cleanFeedback = feedback.trim()

        if (cleanFeedback && cleanFeedback.length > 2000) {
            nextErrors.feedback = 'Draft feedback maksimal 2000 karakter.'
        }

        if (selectedFile && selectedFile.type !== 'application/pdf') {
            nextErrors.feedbackFile = 'Lampiran harus berformat PDF.'
        }

        if (!bimbinganData?.id) {
            setFormError('Data bimbingan tidak ditemukan.')
        }

        setFieldErrors(nextErrors)
        return Object.keys(nextErrors).length === 0 && Boolean(bimbinganData?.id)
    }

    const handleSaveDraft = async () => {
        setFormError(null)
        setFormSuccess(null)

        if (!validateDraftForm()) {
            return
        }

        setIsSubmitting(true)
        const bimbinganId = bimbinganData?.id

        try {
            const formData = new FormData()
            if (status) {
                formData.append('status', status)
            }
            if (feedback) {
                formData.append('feedback', feedback.trim())
            }
            if (selectedFile) {
                formData.append('feedbackFile', selectedFile)
            }

            await api.put(`/bimbingan/${bimbinganId}/draft-feedback`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            setFormSuccess('Draft feedback berhasil disimpan.')
            setFieldErrors({})
            
            if (selectedFile) {
                setDraftFileName(selectedFile.name)
                setSelectedFile(null)
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } } }
            const hasFieldError = mapBackendValidationErrors(err.response?.data?.errors || [])
            setFormError(hasFieldError ? null : err.response?.data?.message || 'Gagal menyimpan draft feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async () => {
        setFormError(null)
        setFormSuccess(null)

        if (!validateFeedbackForm()) {
            return
        }

        setIsSubmitting(true)
        const bimbinganId = bimbinganData?.id

        try {
            // Create FormData for file upload
            const formData = new FormData()
            formData.append('status', status)
            formData.append('feedback', feedback.trim())
            if (selectedFile) {
                formData.append('feedbackFile', selectedFile)
            }

            // Submit feedback via API
            await api.put(`/bimbingan/${bimbinganId}/feedback`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            setFormSuccess('Feedback berhasil dikirim. Mahasiswa akan menerima notifikasi jika email tersedia.')
            setFieldErrors({})
            navigate('/dosen/mahasiswa')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } } }
            const hasFieldError = mapBackendValidationErrors(err.response?.data?.errors || [])
            setFormError(hasFieldError ? null : err.response?.data?.message || 'Gagal mengirim feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSendReply = async (bimbinganId: string) => {
        if (!replyText.trim()) return

        try {
            setFormError(null)
            setFormSuccess(null)
            await api.post(`/bimbingan/${bimbinganId}/reply`, { message: replyText.trim() })
            setReplyText('')
            setFormSuccess('Balasan berhasil dikirim.')

            const response = await api.get(`/bimbingan`, {
                params: {
                    mahasiswaId
                }
            })

            const bimbinganList = response.data.data
            const history = bimbinganList.map((item: any) => ({
                id: item._id,
                version: `V${item.version}`,
                judul: item.judul,
                fileName: item.fileOriginalName || item.fileName,
                fileSize: item.fileSize ? `${(parseInt(item.fileSize) / 1024 / 1024).toFixed(2)} MB` : '-',
                catatan: item.catatan || '',
                status: item.status,
                feedback: item.feedback || '',
                feedbackDate: item.feedbackDate ? new Date(item.feedbackDate).toLocaleString('id-ID') : '-',
                feedbackFile: item.feedbackFile || '',
                feedbackFileName: item.feedbackFileName || '',
                createdAt: new Date(item.createdAt).toLocaleString('id-ID'),
                dosenType: item.dosenType,
                kategoriBimbingan: item.kategoriBimbingan,
                replies: item.replies || []
            }))
            setBimbinganHistory(history)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            setFormSuccess(null)
            setFormError(err.response?.data?.message || 'Gagal mengirim balasan')
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
            case 'acc_sempro':
                return <GraduationCap className="w-5 h-5 text-purple-500" />
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
                    {displayMahasiswa && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Detail Mahasiswa</p>
                            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl mx-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                        {displayMahasiswa.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'MH'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{displayMahasiswa.name}</p>
                                        <p className="text-xs text-gray-500">{displayMahasiswa.nim_nip}</p>
                                    </div>
                                </div>
                                <div className="text-xs space-y-1">
                                    <p className="text-gray-600"><span className="font-medium">Prodi:</span> {displayMahasiswa.prodi || '-'}</p>
                                    <p className="text-gray-600"><span className="font-medium">Progress:</span> {getDisplayedProgress(displayMahasiswa)}</p>
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
                                <RoleSwitchMenuItem />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => navigate('/profile/dosen')}
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
                        <FeedbackAlert message={loadError} onClose={() => setLoadError(null)} />

                        {/* Mahasiswa Info Card - Read Only */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-16 h-16 border-2 border-blue-100">
                                    <AvatarImage src={undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                                        {displayMahasiswa?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'MH'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-800">{displayMahasiswa?.name || 'Loading...'}</h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                                            <GraduationCap className="w-3 h-3 mr-1" />
                                            {displayMahasiswa?.nim_nip || '-'}
                                        </Badge>
                                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0">
                                            {displayMahasiswa?.prodi || '-'}
                                        </Badge>
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                            {getDisplayedProgress(displayMahasiswa)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs font-medium text-gray-500 mb-1">Judul Tugas Akhir:</p>
                                <p className="text-sm text-gray-800 font-medium leading-relaxed">{displayMahasiswa?.judulTA || '-'}</p>
                            </div>
                        </motion.div>

                        {showPengajuanCard && (
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Berkas Pengajuan Seminar</h3>
                                            <p className="text-sm text-gray-500">Softcopy pengajuan seminar yang diunggah mahasiswa.</p>
                                        </div>
                                    </div>
                                </div>

                                <FeedbackAlert message={pengajuanError} onClose={() => setPengajuanError(null)} className="mb-4" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pengajuanSeminar.map((item) => (
                                        <div key={item._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <FileText className={`w-8 h-8 flex-shrink-0 ${item.filePath ? 'text-red-500' : 'text-gray-300'}`} />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-bold text-gray-800">{getPengajuanLabel(item.jenisPengajuan)}</p>
                                                        {getPengajuanStatusBadge(item.statusVerifikasi)}
                                                    </div>
                                                    {item.filePath ? (
                                                        <>
                                                            <p className="mt-1 truncate text-sm font-medium text-gray-700" title={item.fileOriginalName || item.fileName || ''}>
                                                                {item.fileOriginalName || item.fileName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{item.fileSize || '-'}</p>
                                                        </>
                                                    ) : (
                                                        <p className="mt-1 text-sm text-gray-400">Belum ada file diunggah</p>
                                                    )}
                                                    {item.catatanAdmin && (
                                                        <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-600 border border-gray-100">
                                                            Catatan admin: {item.catatanAdmin}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {item.filePath && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePreviewPengajuanFile(item)}
                                                        className="rounded-lg border-blue-100 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadPengajuanFile(item)}
                                                        className="rounded-lg border-green-100 text-green-600 hover:bg-green-50"
                                                    >
                                                        <Download className="w-4 h-4 mr-1.5" />
                                                        Download
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {showWisudaCard && (
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Berkas Wisuda Mahasiswa</h3>
                                            <p className="text-sm text-gray-500">Dokumen administrasi kelulusan akhir yang diunggah mahasiswa.</p>
                                        </div>
                                    </div>
                                    {getWisudaStatusBadge(displayMahasiswa?.dokumenWisuda?.statusVerifikasi)}
                                </div>

                                <FeedbackAlert message={wisudaError} onClose={() => setWisudaError(null)} className="mb-4" />

                                {displayMahasiswa?.dokumenWisuda?.catatanAdmin && (
                                    <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                                        <p className="font-semibold mb-1">Catatan Admin</p>
                                        <p>{displayMahasiswa.dokumenWisuda.catatanAdmin}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {wisudaDocuments.map((item) => {
                                        const hasFile = hasWisudaFile(item.file)

                                        return (
                                            <div key={item.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                                <div className="flex items-start gap-3">
                                                    <FileText className={`w-8 h-8 flex-shrink-0 ${hasFile ? 'text-red-500' : 'text-gray-300'}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                                                        {hasFile ? (
                                                            <>
                                                                <p className="mt-1 truncate text-sm font-medium text-gray-700" title={item.file?.fileOriginalName || item.file?.fileName}>
                                                                    {item.file?.fileOriginalName || item.file?.fileName}
                                                                </p>
                                                                <p className="text-xs text-gray-400">{item.file?.fileSize || '-'}</p>
                                                            </>
                                                        ) : (
                                                            <p className="mt-1 text-sm text-gray-400">Belum ada file diunggah</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {hasFile && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePreviewWisudaFile(item.file)}
                                                            className="rounded-lg border-blue-100 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1.5" />
                                                            Preview
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadWisudaFile(item.file)}
                                                            className="rounded-lg border-green-100 text-green-600 hover:bg-green-50"
                                                        >
                                                            <Download className="w-4 h-4 mr-1.5" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {bimbinganData && (
                            <>
                        {/* Submission Detail - Read Only */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bimbinganData?.status === 'menunggu'
                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                                    : bimbinganData?.status === 'revisi'
                                        ? 'bg-gradient-to-br from-red-400 to-red-500'
                                        : bimbinganData?.status === 'acc'
                                            ? 'bg-gradient-to-br from-green-400 to-green-500'
                                            : bimbinganData?.status === 'acc_sempro'
                                                ? 'bg-gradient-to-br from-purple-400 to-purple-500'
                                                : 'bg-gradient-to-br from-blue-400 to-blue-500'
                                    }`}>
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {bimbinganData?.status === 'menunggu' && 'Menunggu Review'}
                                            {bimbinganData?.status === 'revisi' && 'Revisi'}
                                            {bimbinganData?.status === 'acc' && 'ACC ✓'}
                                            {bimbinganData?.status === 'lanjut_bab' && 'Lanjut BAB ✓'}
                                            {bimbinganData?.status === 'acc_sempro' && `${seminarTarget.accLabel} ✓`}
                                            {!bimbinganData?.status && 'Loading...'}
                                        </h3>
                                        {getKategoriBadge(bimbinganData?.kategoriBimbingan)}
                                    </div>
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
                            </>
                        )}

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

                                {(formError || formSuccess) && (
                                    <div className={`mb-4 flex items-center gap-3 rounded-xl border p-4 ${formError
                                        ? 'border-red-200 bg-red-50 text-red-700'
                                        : 'border-green-200 bg-green-50 text-green-700'
                                        }`}>
                                        {formError ? (
                                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        ) : (
                                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                        )}
                                        <p className="text-sm font-medium">{formError || formSuccess}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Status Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Bimbingan *</label>
                                        <Select
                                            value={status}
                                            onValueChange={(value) => {
                                                setStatus(value)
                                                setFieldErrors((current) => ({ ...current, status: undefined }))
                                            }}
                                        >
                                            <SelectTrigger className={`w-full h-12 rounded-xl ${fieldErrors.status ? 'border-red-300 bg-red-50 focus:ring-red-200' : ''}`}>
                                                <SelectValue placeholder="Pilih status..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {feedbackOptions.includes('revisi') && (
                                                    <SelectItem value="revisi">
                                                        <div className="flex items-center gap-2">
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                            <span>Revisi - Perlu diperbaiki</span>
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                {feedbackOptions.includes('acc') && (
                                                    <SelectItem value="acc">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <span>ACC - Disetujui</span>
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                {feedbackOptions.includes('lanjut_bab') && (
                                                    <SelectItem value="lanjut_bab">
                                                        <div className="flex items-center gap-2">
                                                            <ChevronRight className="w-4 h-4 text-blue-500" />
                                                            <span>Lanjut BAB - Silakan lanjut ke bab berikutnya</span>
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                {feedbackOptions.includes('acc_sempro') && (
                                                    <SelectItem value="acc_sempro">
                                                        <div className="flex items-center gap-2">
                                                            <GraduationCap className="w-4 h-4 text-purple-500" />
                                                            <span>{seminarTarget.accLabel} - Disetujui mengajukan {seminarTarget.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldErrors.status && (
                                            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {fieldErrors.status}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Preview */}
                                    {status && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-3 rounded-xl flex items-center gap-2 ${status === 'revisi' ? 'bg-red-50 border border-red-200' :
                                                status === 'acc' ? 'bg-green-50 border border-green-200' :
                                                    status === 'acc_sempro' ? 'bg-purple-50 border border-purple-200' :
                                                        'bg-blue-50 border border-blue-200'
                                                }`}
                                        >
                                            {getStatusIcon(status)}
                                            <span className={`text-sm font-medium ${status === 'revisi' ? 'text-red-700' :
                                                status === 'acc' ? 'text-green-700' :
                                                    status === 'acc_sempro' ? 'text-purple-700' : 'text-blue-700'
                                                }`}>
                                                {status === 'revisi' ? 'Mahasiswa akan diminta untuk merevisi' :
                                                    status === 'acc' ? 'Dokumen akan disetujui' :
                                                        status === 'acc_sempro' ? seminarTarget.description :
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
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                setFeedback(e.target.value)
                                                setFieldErrors((current) => ({ ...current, feedback: undefined }))
                                            }}
                                            className={`rounded-xl min-h-[150px] ${fieldErrors.feedback ? 'border-red-300 bg-red-50 focus-visible:ring-red-200' : ''}`}
                                        />
                                        <div className="mt-1.5 flex items-center justify-between gap-2">
                                            {fieldErrors.feedback ? (
                                                <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    {fieldErrors.feedback}
                                                </p>
                                            ) : (
                                                <span />
                                            )}
                                            <p className={`text-xs ${feedback.length > 2000 ? 'text-red-600' : 'text-gray-400'}`}>
                                                {feedback.length}/2000
                                            </p>
                                        </div>
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
                                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${fieldErrors.feedbackFile
                                                ? 'border-red-300 bg-red-50 hover:border-red-400'
                                                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                                                }`}
                                        >
                                            {selectedFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <Paperclip className="w-5 h-5 text-blue-500" />
                                                    <span className="font-medium text-gray-800">{selectedFile.name}</span>
                                                    <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                            ) : draftFileName ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <Paperclip className="w-5 h-5 text-blue-500" />
                                                    <span className="font-medium text-gray-800">{draftFileName}</span>
                                                    <span className="text-xs text-blue-500">(Tersimpan di draft)</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                                    <Upload className="w-5 h-5" />
                                                    <span>Klik untuk upload file</span>
                                                </div>
                                            )}
                                        </div>
                                        {fieldErrors.feedbackFile && (
                                            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {fieldErrors.feedbackFile}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit & Draft Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                            <Button
                                                onClick={handleSaveDraft}
                                                disabled={isSubmitting}
                                                variant="outline"
                                                className="w-full border-blue-200 hover:border-blue-400 text-blue-600 rounded-xl py-6 text-lg font-semibold"
                                            >
                                                {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                                            </Button>
                                        </motion.div>
                                        <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-6 text-lg font-semibold"
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
                                    </div>

                                    {/* Info */}
                                    <p className="text-xs text-gray-400 text-center">
                                        * Setelah mengirim feedback, mahasiswa akan menerima notifikasi email jika alamat email tersedia.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* No Bimbingan Submitted Yet */}
                        {!bimbinganData && !showWisudaCard && (
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

                        {/* ===== RIWAYAT BIMBINGAN SECTION ===== */}
                        {bimbinganHistory.length > 0 && (
                            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Riwayat Bimbingan</h3>
                                        <p className="text-sm text-gray-500">Total {bimbinganHistory.length} bimbingan</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {bimbinganHistory.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`border rounded-xl overflow-hidden ${item.status === 'menunggu' ? 'border-yellow-200 bg-yellow-50/50' :
                                                item.status === 'revisi' ? 'border-red-200 bg-red-50/50' :
                                                    item.status === 'acc' ? 'border-green-200 bg-green-50/50' :
                                                        item.status === 'acc_sempro' ? 'border-purple-200 bg-purple-50/50' :
                                                            'border-blue-200 bg-blue-50/50'
                                                }`}
                                        >
                                            {/* Header - Clickable */}
                                            <button
                                                onClick={() => {
                                                    setExpandedHistory(expandedHistory === item.id ? null : item.id)
                                                    setReplyText('')
                                                }}
                                                className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.status === 'menunggu' ? 'bg-yellow-100' :
                                                        item.status === 'revisi' ? 'bg-red-100' :
                                                            item.status === 'acc' ? 'bg-green-100' :
                                                                item.status === 'acc_sempro' ? 'bg-purple-100' :
                                                                    'bg-blue-100'
                                                        }`}>
                                                        {getStatusIcon(item.status)}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-medium text-gray-800">{item.version} - {item.judul}</p>
                                                            {getKategoriBadge(item.kategoriBimbingan)}
                                                        </div>
                                                        <p className="text-xs text-gray-500">{item.createdAt}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${item.status === 'menunggu' ? 'bg-yellow-100 text-yellow-700' :
                                                        item.status === 'revisi' ? 'bg-red-100 text-red-700' :
                                                            item.status === 'acc' ? 'bg-green-100 text-green-700' :
                                                                item.status === 'acc_sempro' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                        } border-0`}>
                                                        {item.status === 'menunggu' ? 'Menunggu' :
                                                            item.status === 'revisi' ? 'Revisi' :
                                                                item.status === 'acc' ? 'ACC' :
                                                                    item.status === 'acc_sempro' ? seminarTarget.accLabel : 'Lanjut BAB'}
                                                    </Badge>
                                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedHistory === item.id ? 'rotate-180' : ''
                                                        }`} />
                                                </div>
                                            </button>

                                            {/* Expanded Content */}
                                            {expandedHistory === item.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-200 p-4 bg-white/80"
                                                >
                                                    <div className="space-y-3">
                                                        {/* File Info */}
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-600">{item.fileName}</span>
                                                            <span className="text-gray-400">({item.fileSize})</span>
                                                        </div>

                                                        {/* Catatan Mahasiswa */}
                                                        {item.catatan && (
                                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                                <p className="text-xs font-medium text-blue-600 mb-1">Catatan Mahasiswa:</p>
                                                                <p className="text-sm text-gray-700">{item.catatan}</p>
                                                            </div>
                                                        )}

                                                        {/* Feedback Dosen */}
                                                        {item.feedback && (
                                                            <div className={`p-3 rounded-lg ${item.status === 'revisi' ? 'bg-red-50' :
                                                                item.status === 'acc' ? 'bg-green-50' :
                                                                    item.status === 'acc_sempro' ? 'bg-purple-50' :
                                                                        'bg-blue-50'
                                                                }`}>
                                                                <p className={`text-xs font-medium mb-1 ${item.status === 'revisi' ? 'text-red-600' :
                                                                    item.status === 'acc' ? 'text-green-600' :
                                                                        item.status === 'acc_sempro' ? 'text-purple-600' :
                                                                            'text-blue-600'
                                                                    }`}>Feedback Dosen ({item.feedbackDate}):</p>
                                                                <p className="text-sm text-gray-700">{item.feedback}</p>

                                                                {item.feedbackFile && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDownloadFeedbackFile(item.id, item.feedbackFileName)}
                                                                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" />
                                                                        Lampiran: {item.feedbackFileName || 'Unduh lampiran'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {item.replies && item.replies.length > 0 && (
                                                            <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                                                {item.replies.map((reply) => (
                                                                    <div key={reply._id || reply.id} className={`p-3 rounded-xl ${reply.senderRole === 'dosen' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className={`text-xs font-medium ${reply.senderRole === 'dosen' ? 'text-blue-600' : 'text-gray-600'}`}>
                                                                                {reply.senderRole === 'dosen' ? 'Anda' : 'Mahasiswa'}
                                                                            </span>
                                                                            <span className="text-xs text-gray-400">
                                                                                {reply.timestamp || reply.formattedTime || (reply.createdAt ? new Date(reply.createdAt).toLocaleString('id-ID') : '')}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-700">{reply.message}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="Tulis balasan..."
                                                                value={expandedHistory === item.id ? replyText : ''}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                className="flex-1 rounded-xl"
                                                            />
                                                            <Button
                                                                onClick={() => handleSendReply(item.id)}
                                                                disabled={!replyText.trim()}
                                                                className="rounded-xl bg-blue-500 hover:bg-blue-600"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        {/* Status menunggu indicator */}
                                                        {item.status === 'menunggu' && (
                                                            <div className="flex items-center gap-2 text-yellow-600 text-sm">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Menunggu review dari dosen</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                </main>
            </div>
        </div>
    )
}
