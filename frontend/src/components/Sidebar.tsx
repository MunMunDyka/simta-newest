/**
 * ===========================================
 * Sidebar Component - Reusable
 * ===========================================
 * Komponen sidebar yang menggunakan konfigurasi berdasarkan role
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { getSidebarConfig, setActiveMenuItem } from '@/config/sidebarConfig'

export const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    // Get sidebar config based on role
    const config = getSidebarConfig(user?.role)

    // Set active states
    const mainMenu = setActiveMenuItem(config.mainMenu, location.pathname)
    const aktivitas = setActiveMenuItem(config.aktivitas, location.pathname)
    const history = setActiveMenuItem(config.history, location.pathname)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    const sidebarVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
        },
    }

    return (
        <motion.aside
            className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm relative overflow-hidden"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Wave decoration at bottom */}
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
                <motion.div
                    className="flex items-center gap-3 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring' as const, stiffness: 300 }}
                    onClick={() => navigate(mainMenu[0]?.path || '/')}
                >
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
                {/* Main Menu */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                        Main Menu
                    </p>
                    <ul className="space-y-1">
                        {mainMenu.map((item, index) => (
                            <motion.li
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <motion.button
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
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

                {/* Aktivitas */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                        {config.aktivitasLabel}
                    </p>
                    <ul className="space-y-1">
                        {aktivitas.map((item, index) => (
                            <motion.li
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <motion.button
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
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

                {/* History/Arsip */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                        {config.historyLabel}
                    </p>
                    <ul className="space-y-1">
                        {history.map((item, index) => (
                            <motion.li
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                <motion.button
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => item.path !== '#' && navigate(item.path)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </motion.button>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Logout Button */}
                <div className="pt-4 border-t border-gray-100">
                    <motion.button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </motion.button>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 relative z-10">
                <motion.p
                    className="text-xs text-blue-700 font-medium text-center drop-shadow-sm"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    Institut Teknologi Batam 2025
                </motion.p>
            </div>
        </motion.aside>
    )
}

export default Sidebar
