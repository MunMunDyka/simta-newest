/**
 * ===========================================
 * Sidebar Configuration
 * ===========================================
 * Konfigurasi menu sidebar untuk setiap role
 */

import {
    LayoutDashboard,
    Users,
    Calendar,
    CalendarCheck,
    FileEdit,
    Settings,
    type LucideIcon,
} from 'lucide-react'

// Types
export interface MenuItem {
    label: string
    icon: LucideIcon
    path: string
    active?: boolean
}

export interface SidebarConfig {
    mainMenu: MenuItem[]
    aktivitas: MenuItem[]
    history: MenuItem[]
    historyLabel: string
    aktivitasLabel: string
}

// ===== MAHASISWA SIDEBAR =====
export const mahasiswaSidebar: SidebarConfig = {
    mainMenu: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/mahasiswa' },
    ],
    aktivitasLabel: 'Aktivitas Bimbingan',
    aktivitas: [
        { label: 'Bimbingan', icon: FileEdit, path: '/bimbingan/mahasiswa' },
        { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
    ],
    historyLabel: 'Akun',
    history: [
        { label: 'Profil', icon: Settings, path: '/profile/mahasiswa' },
    ],
}

// ===== DOSEN SIDEBAR =====
export const dosenSidebar: SidebarConfig = {
    mainMenu: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/dosen' },
    ],
    aktivitasLabel: 'Aktivitas Bimbingan',
    aktivitas: [
        { label: 'Mahasiswa Bimbingan', icon: Users, path: '/dosen/mahasiswa' },
        { label: 'Jadwal Penguji', icon: CalendarCheck, path: '/dosen/jadwal-penguji' },
        { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
    ],
    historyLabel: 'Akun',
    history: [
        { label: 'Profil', icon: Settings, path: '/profile/dosen' },
    ],
}

// ===== ADMIN SIDEBAR =====
export const adminSidebar: SidebarConfig = {
    mainMenu: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ],
    aktivitasLabel: 'Manajemen',
    aktivitas: [
        { label: 'Manajemen User', icon: Users, path: '/admin/users' },
        { label: 'Manajemen Dosen', icon: Users, path: '/admin/plotting' },
        { label: 'Kelola Bimbingan', icon: FileEdit, path: '/admin/bimbingan' },
        { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
        { label: 'Verifikasi Dokumen', icon: CalendarCheck, path: '/admin/wisuda' },
    ],
    historyLabel: 'Laporan dan Akun',
    history: [
        { label: 'Laporan', icon: FileEdit, path: '/admin/laporan' },
        { label: 'Profil', icon: Settings, path: '/admin/profile' },
    ],
}

// Helper function to get sidebar config based on role
export const getSidebarConfig = (role: string | undefined): SidebarConfig => {
    switch (role) {
        case 'dosen':
            return dosenSidebar
        case 'admin':
            return adminSidebar
        case 'mahasiswa':
        default:
            return mahasiswaSidebar
    }
}

// Helper to set active state based on current path
export const setActiveMenuItem = (
    items: MenuItem[],
    currentPath: string
): MenuItem[] => {
    return items.map(item => ({
        ...item,
        active: item.path === currentPath || currentPath.startsWith(item.path + '/'),
    }))
}
