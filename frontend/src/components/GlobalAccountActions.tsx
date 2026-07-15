import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BriefcaseBusiness, Shield, UserRound } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleActiveRole } from '@/store/slices/authSlice'

const profileRoutes = {
    mahasiswa: '/profile/mahasiswa',
    dosen: '/profile/dosen',
    admin: '/admin/profile',
} as const

const dashboardRoutes = {
    mahasiswa: '/dashboard/mahasiswa',
    dosen: '/dashboard/dosen',
    admin: '/admin/dashboard',
} as const

export const GlobalAccountActions = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    const { isAuthenticated, user } = useAppSelector((state) => state.auth)

    const isPublicAuthPage = location.pathname === '/' || location.pathname === '/reset-password'
    const isWireframePage = location.pathname.startsWith('/wireframe')

    if (!isAuthenticated || !user || isPublicAuthPage || isWireframePage) {
        return null
    }

    const activeRole = user.activeRole || user.role
    const targetRole = activeRole === 'admin' ? 'dosen' : 'admin'

    const handleSwitchRole = () => {
        dispatch(toggleActiveRole())
        navigate(dashboardRoutes[targetRole])
    }

    return (
        <div className="fixed right-16 top-3 z-50 flex items-center gap-1 sm:right-20 sm:gap-2">
            <motion.button
                type="button"
                onClick={() => navigate(profileRoutes[activeRole])}
                className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Buka profil dan ubah password"
            >
                <UserRound className="h-4 w-4" />
                <span className="hidden lg:inline">Profil</span>
            </motion.button>

            {user.canAccessAdmin && user.role === 'dosen' && (
                <motion.button
                    type="button"
                    onClick={handleSwitchRole}
                    className={`flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-sm font-semibold shadow-sm transition-colors ${
                        targetRole === 'admin'
                            ? 'border-purple-200 text-purple-700 hover:bg-purple-50'
                            : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title={`Beralih ke mode ${targetRole === 'admin' ? 'Admin' : 'Dosen'}`}
                >
                    {targetRole === 'admin' ? <Shield className="h-4 w-4" /> : <BriefcaseBusiness className="h-4 w-4" />}
                    <span className="hidden lg:inline">Mode {targetRole === 'admin' ? 'Admin' : 'Dosen'}</span>
                </motion.button>
            )}
        </div>
    )
}

export default GlobalAccountActions
