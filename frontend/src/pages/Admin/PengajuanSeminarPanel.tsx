import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CheckCircle2, Download, Eye, FileText, Search, XCircle } from 'lucide-react'
import { FeedbackAlert } from '@/components/FeedbackAlert'
import { getApiErrorMessage } from '@/lib/errorMessage'
import {
    downloadPengajuanSeminarFile,
    getPengajuanSeminar,
    previewPengajuanSeminarFile,
    verifikasiPengajuanSeminar,
    type JenisPengajuanSeminar,
    type PengajuanSeminar,
    type StatusVerifikasiPengajuan,
} from '@/services/pengajuanSeminarService'

type FilterStatus = StatusVerifikasiPengajuan | 'semua'
type FilterJenis = JenisPengajuanSeminar | 'semua'

const getJenisLabel = (jenis?: string) => {
    if (jenis === 'seminar_proposal') return 'Seminar Proposal'
    if (jenis === 'seminar_hasil') return 'Seminar Hasil'
    return 'Seminar'
}

const getStatusLabel = (status?: string) => {
    switch (status) {
        case 'belum_upload': return 'Belum Upload'
        case 'menunggu_verifikasi': return 'Menunggu Verifikasi'
        case 'disetujui': return 'Disetujui'
        case 'ditolak': return 'Ditolak'
        default: return 'Belum Upload'
    }
}

const getStatusBadge = (status?: string) => {
    switch (status) {
        case 'belum_upload': return 'bg-gray-100 text-gray-700 border-gray-200'
        case 'menunggu_verifikasi': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'disetujui': return 'bg-green-100 text-green-800 border-green-200'
        case 'ditolak': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

export const PengajuanSeminarPanel = () => {
    const [items, setItems] = useState<PengajuanSeminar[]>([])
    const [search, setSearch] = useState('')
    const [jenisFilter, setJenisFilter] = useState<FilterJenis>('semua')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('menunggu_verifikasi')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanSeminar | null>(null)
    const [decision, setDecision] = useState<'disetujui' | 'ditolak'>('disetujui')
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await getPengajuanSeminar({
                limit: 100,
                search: search || undefined,
                jenisPengajuan: jenisFilter,
                statusVerifikasi: statusFilter,
            })
            setItems(response.data || [])
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Gagal mengambil data pengajuan seminar.'))
        } finally {
            setIsLoading(false)
        }
    }, [jenisFilter, search, statusFilter])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleOpenVerify = (item: PengajuanSeminar) => {
        setSelectedPengajuan(item)
        setDecision(item.statusVerifikasi === 'ditolak' ? 'ditolak' : 'disetujui')
        setNotes(item.catatanAdmin || '')
    }

    const handleSave = async () => {
        if (!selectedPengajuan) return
        if (decision === 'ditolak' && !notes.trim()) {
            setError('Catatan evaluasi wajib diisi jika dokumen ditolak')
            return
        }

        setIsSaving(true)
        setError(null)
        setSuccessMessage(null)
        try {
            await verifikasiPengajuanSeminar(selectedPengajuan._id, decision, notes)
            setSuccessMessage(`Berkas pengajuan ${selectedPengajuan.mahasiswa.name} berhasil diverifikasi.`)
            setSelectedPengajuan(null)
            fetchData()
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Gagal menyimpan verifikasi pengajuan seminar.'))
        } finally {
            setIsSaving(false)
        }
    }

    const handlePreview = async (item: PengajuanSeminar) => {
        if (!item.filePath) return
        try {
            setError(null)
            await previewPengajuanSeminarFile(item.filePath)
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Gagal membuka pratinjau berkas pengajuan seminar.'))
        }
    }

    const handleDownload = async (item: PengajuanSeminar) => {
        if (!item.filePath) return
        try {
            setError(null)
            await downloadPengajuanSeminarFile(item.filePath, item.fileOriginalName || item.fileName || undefined)
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Gagal mengunduh berkas pengajuan seminar.'))
        }
    }

    return (
        <div className="space-y-6">
            <FeedbackAlert message={error} onClose={() => setError(null)} />
            {successMessage && (
                <FeedbackAlert message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {[
                        ['semua', 'Semua'],
                        ['menunggu_verifikasi', 'Menunggu'],
                        ['disetujui', 'Disetujui'],
                        ['ditolak', 'Ditolak'],
                    ].map(([value, label]) => (
                        <Button
                            key={value}
                            variant={statusFilter === value ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(value as FilterStatus)}
                            className={statusFilter === value ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <select
                        value={jenisFilter}
                        onChange={(e) => setJenisFilter(e.target.value as FilterJenis)}
                        className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                        <option value="semua">Semua Jenis</option>
                        <option value="seminar_proposal">Seminar Proposal</option>
                        <option value="seminar_hasil">Seminar Hasil</option>
                    </select>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            fetchData()
                        }}
                        className="relative w-full sm:w-80"
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari NIM atau nama..."
                            className="pl-9 pr-4 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        />
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mx-auto mb-4" />
                        <p className="text-gray-500">Memuat data pengajuan seminar...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Tidak ada pengajuan seminar pada kriteria ini.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-gray-700">Mahasiswa</TableHead>
                                <TableHead className="font-semibold text-gray-700">Jenis</TableHead>
                                <TableHead className="font-semibold text-gray-700">Softcopy</TableHead>
                                <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                                <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item._id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div>
                                            <p className="font-bold text-gray-800">{item.mahasiswa.name}</p>
                                            <p className="text-xs text-gray-500">{item.mahasiswa.nim_nip} &middot; {item.mahasiswa.prodi || 'Sistem Informasi'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                            {getJenisLabel(item.jenisPengajuan)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            type="button"
                                            onClick={() => handlePreview(item)}
                                            className="max-w-[260px] truncate text-left text-sm font-semibold text-blue-600 hover:underline"
                                            disabled={!item.filePath}
                                        >
                                            {item.fileOriginalName || item.fileName || 'Belum ada file'}
                                        </button>
                                        <p className="text-xs text-gray-400">{item.fileSize || '-'}</p>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={`${getStatusBadge(item.statusVerifikasi)} border shadow-none font-medium`}>
                                            {getStatusLabel(item.statusVerifikasi)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePreview(item)}
                                                disabled={!item.filePath}
                                                className="h-9 px-3"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(item)}
                                                disabled={!item.filePath}
                                                className="h-9 px-3"
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => handleOpenVerify(item)}
                                                disabled={!item.filePath}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                                            >
                                                Verifikasi
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Dialog open={Boolean(selectedPengajuan)} onOpenChange={(open) => !open && setSelectedPengajuan(null)}>
                <DialogContent className="max-w-xl bg-white rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-800">Verifikasi Pengajuan Seminar</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Periksa softcopy PDF mahasiswa sebelum jadwal seminar dibuat.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPengajuan && (
                        <div className="space-y-5 my-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-800">{selectedPengajuan.mahasiswa.name}</h4>
                                <p className="text-xs text-gray-500">{selectedPengajuan.mahasiswa.nim_nip} &middot; {getJenisLabel(selectedPengajuan.jenisPengajuan)}</p>
                                <button
                                    type="button"
                                    onClick={() => handlePreview(selectedPengajuan)}
                                    className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    {selectedPengajuan.fileOriginalName || selectedPengajuan.fileName}
                                </button>
                            </div>

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
                                    Setujui
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
                                    Tolak
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="catatanPengajuan" className="block text-sm font-bold text-gray-700">
                                    Catatan Evaluasi {decision === 'ditolak' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    id="catatanPengajuan"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={decision === 'ditolak' ? 'Tuliskan alasan penolakan berkas...' : 'Catatan opsional...'}
                                    className="w-full rounded-2xl border border-gray-200 p-4 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedPengajuan(null)} className="rounded-xl">
                            Batal
                        </Button>
                        <Button
                            onClick={handleSave}
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
