/**
 * ===========================================
 * Pengajuan Seminar Service
 * ===========================================
 */

import api, { type ApiResponse } from '../lib/api'

export type JenisPengajuanSeminar = 'seminar_proposal' | 'seminar_hasil'
export type StatusVerifikasiPengajuan = 'belum_upload' | 'menunggu_verifikasi' | 'disetujui' | 'ditolak'

export interface PengajuanSeminar {
    _id: string
    mahasiswa: {
        _id: string
        name: string
        nim_nip: string
        prodi?: string
        judulTA?: string
        statusMahasiswa?: string
    }
    jenisPengajuan: JenisPengajuanSeminar
    jenisPengajuanDisplay?: string
    fileName?: string | null
    filePath?: string | null
    fileSize?: string | null
    fileOriginalName?: string | null
    uploadedAt?: string | null
    statusVerifikasi: StatusVerifikasiPengajuan
    catatanAdmin?: string | null
    verifiedAt?: string | null
    verifiedBy?: {
        _id: string
        name: string
        nim_nip?: string
    } | null
    createdAt?: string
    updatedAt?: string
}

export interface PengajuanSeminarParams {
    page?: number
    limit?: number
    jenisPengajuan?: JenisPengajuanSeminar | 'semua'
    statusVerifikasi?: StatusVerifikasiPengajuan | 'semua'
    search?: string
    mahasiswaId?: string
}

export const getPengajuanSeminar = async (
    params: PengajuanSeminarParams = {}
): Promise<ApiResponse<PengajuanSeminar[]>> => {
    const requestParams = {
        ...params,
        jenisPengajuan: params.jenisPengajuan === 'semua' ? undefined : params.jenisPengajuan,
        statusVerifikasi: params.statusVerifikasi === 'semua' ? undefined : params.statusVerifikasi,
    }

    const response = await api.get<ApiResponse<PengajuanSeminar[]>>('/pengajuan-seminar', {
        params: requestParams,
    })
    return response.data
}

export const uploadPengajuanSeminar = async (
    jenisPengajuan: JenisPengajuanSeminar,
    formData: FormData
): Promise<ApiResponse<PengajuanSeminar>> => {
    const response = await api.post<ApiResponse<PengajuanSeminar>>(
        `/pengajuan-seminar/${jenisPengajuan}/upload`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    )
    return response.data
}

export const verifikasiPengajuanSeminar = async (
    pengajuanId: string,
    statusVerifikasi: 'disetujui' | 'ditolak',
    catatanAdmin?: string
): Promise<ApiResponse<PengajuanSeminar>> => {
    const response = await api.put<ApiResponse<PengajuanSeminar>>(
        `/pengajuan-seminar/${pengajuanId}/verifikasi`,
        { statusVerifikasi, catatanAdmin }
    )
    return response.data
}

const getPengajuanFileName = (filePath: string): string => {
    return filePath.replace(/\\/g, '/').split('/').pop() || filePath
}

const fetchPengajuanFileBlob = async (filePath: string): Promise<{ blob: Blob; fileName: string }> => {
    const fileName = getPengajuanFileName(filePath)
    const response = await api.get(`/pengajuan-seminar/download/${encodeURIComponent(fileName)}`, {
        responseType: 'blob',
    })

    return {
        blob: new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' }),
        fileName,
    }
}

export const downloadPengajuanSeminarFile = async (
    filePath: string,
    fallbackFileName?: string
): Promise<void> => {
    const { blob, fileName } = await fetchPengajuanFileBlob(filePath)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fallbackFileName || fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}

export const previewPengajuanSeminarFile = async (filePath: string): Promise<void> => {
    const { blob } = await fetchPengajuanFileBlob(filePath)
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
}
