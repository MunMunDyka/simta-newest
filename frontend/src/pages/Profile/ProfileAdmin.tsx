import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { KeyRound, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setUser } from '@/store/slices/authSlice'
import { changePassword } from '@/services/authService'
import api from '@/lib/api'

type Section = 'info' | 'password'

export const ProfileAdmin = () => {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const [activeSection, setActiveSection] = useState<Section>('info')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSavingInfo, setIsSavingInfo] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    useEffect(() => {
        setName(user?.name || '')
        setEmail(user?.email || '')
    }, [user])

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0 },
    }

    const handleSaveInfo = async () => {
        if (!name.trim() || !email.trim()) {
            alert('Nama dan email wajib diisi!')
            return
        }

        setIsSavingInfo(true)
        try {
            const response = await api.put('/users/profile', {
                name: name.trim(),
                email: email.trim(),
            })
            const updatedUser = {
                ...response.data.data,
                activeRole: user?.activeRole || user?.role,
            }
            dispatch(setUser(updatedUser))
            localStorage.setItem('user', JSON.stringify(updatedUser))
            alert('Info akun berhasil diperbarui!')
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert(err.response?.data?.message || 'Gagal memperbarui info akun')
        } finally {
            setIsSavingInfo(false)
        }
    }

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Password lama, password baru, dan konfirmasi password wajib diisi!')
            return
        }
        if (newPassword.length < 6) {
            alert('Password baru minimal 6 karakter!')
            return
        }
        if (!/\d/.test(newPassword)) {
            alert('Password baru harus mengandung minimal 1 angka!')
            return
        }
        if (newPassword !== confirmPassword) {
            alert('Password baru tidak cocok!')
            return
        }

        setIsSavingPassword(true)
        try {
            const response = await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            })
            localStorage.setItem('accessToken', response.data.accessToken)
            localStorage.setItem('refreshToken', response.data.refreshToken)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            alert(response.message || 'Password berhasil diubah!')
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { message?: string; errors?: Array<{ message?: string }> } }
            }
            const validationMessage = err.response?.data?.errors?.find((item) => item.message)?.message
            alert(validationMessage || err.response?.data?.message || 'Gagal mengubah password')
        } finally {
            setIsSavingPassword(false)
        }
    }

    const initials = user?.name
        ?.split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'AD'

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 items-center border-b border-gray-100 bg-white px-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Akun Saya</h1>
                        <p className="text-sm text-gray-500">Kelola profil dan keamanan akun admin</p>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <motion.div
                        className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.section variants={itemVariants} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-28 w-28 border-4 border-orange-100">
                                    <AvatarImage src={user?.avatar || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-3xl text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="mt-4 text-lg font-bold text-gray-800">{user?.name || 'Administrator'}</h2>
                                <p className="mt-1 text-sm text-gray-500">{user?.nim_nip || '-'}</p>
                                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {user?.role === 'dosen' ? 'Dosen & Admin' : 'Administrator'}
                                </span>
                            </div>

                            <div className="mt-6 space-y-2 border-t border-gray-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('info')}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-colors ${
                                        activeSection === 'info' ? 'border border-orange-200 bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <UserRound className="h-5 w-5" />
                                    Informasi Akun
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('password')}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-colors ${
                                        activeSection === 'password' ? 'border border-orange-200 bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <KeyRound className="h-5 w-5" />
                                    Ubah Password
                                </button>
                            </div>
                        </motion.section>

                        <motion.section variants={itemVariants} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                            {activeSection === 'info' ? (
                                <div className="space-y-5">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Informasi Akun</h2>
                                        <p className="mt-1 text-sm text-gray-500">Informasi ini digunakan pada identitas akun SIMTA.</p>
                                    </div>
                                    <label className="block space-y-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><UserRound className="h-4 w-4" />Nama</span>
                                        <Input value={name} onChange={(event) => setName(event.target.value)} />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><Mail className="h-4 w-4" />Email</span>
                                        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Username / NIP</span>
                                        <Input value={user?.nim_nip || ''} readOnly className="bg-gray-50" />
                                    </label>
                                    <div className="flex justify-end pt-2">
                                        <Button onClick={handleSaveInfo} disabled={isSavingInfo} className="bg-orange-500 hover:bg-orange-600">
                                            <Save className="mr-2 h-4 w-4" />
                                            {isSavingInfo ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Ubah Password</h2>
                                        <p className="mt-1 text-sm text-gray-500">Masukkan password saat ini sebelum membuat password baru.</p>
                                    </div>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Password Saat Ini</span>
                                        <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Password Baru</span>
                                        <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                                        <p className="text-xs text-gray-400">Minimal 6 karakter dan mengandung sedikitnya 1 angka.</p>
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</span>
                                        <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                                    </label>
                                    <div className="flex justify-end pt-2">
                                        <Button onClick={handleChangePassword} disabled={isSavingPassword} className="bg-orange-500 hover:bg-orange-600">
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            {isSavingPassword ? 'Menyimpan...' : 'Ubah Password'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}

export default ProfileAdmin
