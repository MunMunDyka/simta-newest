/**
 * usePageTitle
 * Mengubah judul tab browser (document.title) mengikuti route yang aktif,
 * karena aplikasi ini SPA sehingga judul di index.html tidak berubah sendiri.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const APP_NAME = 'SIMTA'

// Pemetaan judul berdasarkan awalan path. Urutan lebih spesifik didahulukan.
const TITLE_RULES: { match: (path: string) => boolean; title: string }[] = [
    { match: (p) => p === '/', title: 'Login' },
    { match: (p) => p.startsWith('/reset-password'), title: 'Reset Password' },

    // Mahasiswa
    { match: (p) => p.startsWith('/dashboard/mahasiswa'), title: 'Dashboard Mahasiswa' },
    { match: (p) => p.startsWith('/bimbingan/mahasiswa'), title: 'Bimbingan' },
    { match: (p) => p.startsWith('/profile/mahasiswa'), title: 'Profil' },

    // Dosen
    { match: (p) => p.startsWith('/dashboard/dosen'), title: 'Dashboard Dosen' },
    { match: (p) => p.startsWith('/dosen/mahasiswa'), title: 'Mahasiswa Bimbingan' },
    { match: (p) => p.startsWith('/dosen/jadwal-penguji'), title: 'Jadwal Penguji' },
    { match: (p) => p.startsWith('/bimbingan/dosen'), title: 'Review Bimbingan' },
    { match: (p) => p.startsWith('/profile/dosen'), title: 'Profil' },

    // Admin
    { match: (p) => p.startsWith('/admin/dashboard'), title: 'Dashboard Admin' },
    { match: (p) => p.startsWith('/admin/users/mahasiswa'), title: 'Detail Mahasiswa' },
    { match: (p) => p.startsWith('/admin/users/dosen'), title: 'Detail Dosen' },
    { match: (p) => p.includes('/edit'), title: 'Edit User' },
    { match: (p) => p.startsWith('/admin/users'), title: 'Manajemen User' },
    { match: (p) => p.startsWith('/admin/plotting'), title: 'Manajemen Dosen' },
    { match: (p) => p.startsWith('/admin/bimbingan'), title: 'Kelola Bimbingan' },
    { match: (p) => p.startsWith('/admin/jadwal'), title: 'Kelola Jadwal' },
    { match: (p) => p.startsWith('/admin/laporan'), title: 'Laporan' },
    { match: (p) => p.startsWith('/admin/wisuda'), title: 'Verifikasi Dokumen' },
    { match: (p) => p.startsWith('/admin/profile'), title: 'Profil' },

    // Umum
    { match: (p) => p.startsWith('/jadwal-sidang'), title: 'Jadwal Sidang' },
]

const getTitleForPath = (pathname: string): string => {
    const rule = TITLE_RULES.find((r) => r.match(pathname))
    return rule ? `${rule.title} — ${APP_NAME}` : APP_NAME
}

export const usePageTitle = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        document.title = getTitleForPath(pathname)
    }, [pathname])
}
