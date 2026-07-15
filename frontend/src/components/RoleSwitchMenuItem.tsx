import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleActiveRole } from '@/store/slices/authSlice'

export const RoleSwitchMenuItem = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    if (!user?.canAccessAdmin || user.role !== 'dosen') {
        return null
    }

    const activeRole = user.activeRole || user.role
    const targetRole = activeRole === 'admin' ? 'dosen' : 'admin'
    const targetDashboard = targetRole === 'admin' ? '/admin/dashboard' : '/dashboard/dosen'

    return (
        <>
            <DropdownMenuItem
                className={`cursor-pointer font-medium ${targetRole === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}
                onClick={() => {
                    dispatch(toggleActiveRole())
                    navigate(targetDashboard)
                }}
            >
                <Shield className="mr-2 h-4 w-4" />
                Masuk Mode {targetRole === 'admin' ? 'Admin' : 'Dosen'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        </>
    )
}

export default RoleSwitchMenuItem
