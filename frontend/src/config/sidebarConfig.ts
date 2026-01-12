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
    historyLabel: '',
    history: [],
}

// ===== DOSEN SIDEBAR =====
export const dosenSidebar: SidebarConfig = {
    mainMenu: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/dosen' },
    ],
    aktivitasLabel: 'Aktivitas Bimbingan',
    aktivitas: [
        { label: 'Mahasiswa Bimbingan', icon: Users, path: '/dosen/mahasiswa' },
        { label: 'Jadwal Sidang', icon: Calendar, path: '/jadwal-sidang' },
    ],
    historyLabel: '',
    history: [],
}

// ===== ADMIN SIDEBAR =====
export const adminSidebar: SidebarConfig = {
    mainMenu: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ],
    aktivitasLabel: 'Manajemen',
    aktivitas: [
        { label: 'Manajemen User', icon: Users, path: '/admin/users' },
        { label: 'Kelola Jadwal', icon: Calendar, path: '/admin/jadwal' },
    ],
    historyLabel: 'Pengaturan',
    history: [
        { label: 'Pengaturan Sistem', icon: Settings, path: '#' },
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
