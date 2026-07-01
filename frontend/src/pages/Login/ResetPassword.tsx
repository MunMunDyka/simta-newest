import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { AlertCircle, GraduationCap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/services/authService'

export const ResetPassword = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(token ? null : 'Link reset password tidak valid.')
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)

        if (!token) {
            setError('Link reset password tidak valid.')
            return
        }

        if (!newPassword || !confirmPassword) {
            setError('Password baru dan konfirmasi password wajib diisi.')
            return
        }

        if (newPassword.length < 6) {
            setError('Password baru minimal 6 karakter.')
            return
        }

        if (!/\d/.test(newPassword)) {
            setError('Password baru harus mengandung minimal 1 angka.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.')
            return
        }

        setIsLoading(true)
        try {
            const response = await resetPassword({
                token,
                newPassword,
                confirmPassword,
            })

            setMessage(response.message || 'Password berhasil diubah. Silakan login dengan password baru.')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            const validationMessage = err.response?.data?.errors?.find((item: { message?: string }) => item.message)?.message
            setError(validationMessage || err.response?.data?.message || 'Gagal mengubah password.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
            <motion.div
                className="w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                        <GraduationCap className="h-11 w-11" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Reset Password SIMTA</h1>
                    <p className="mt-2 text-sm text-gray-500">Buat password baru untuk akun Anda.</p>
                </motion.div>

                <motion.form onSubmit={handleSubmit} variants={itemVariants} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-600">
                            Password Baru
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Masukkan password baru"
                                className="h-12 rounded-xl border-gray-200 bg-white pl-10"
                                disabled={Boolean(message)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-600">
                            Konfirmasi Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Konfirmasi password baru"
                                className="h-12 rounded-xl border-gray-200 bg-white pl-10"
                                disabled={Boolean(message)}
                            />
                        </div>
                    </div>

                    {!message && (
                        <Button
                            type="submit"
                            disabled={isLoading || !token}
                            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-gray-600 font-semibold text-white shadow-lg shadow-blue-500/30 disabled:opacity-70"
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </Button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                        Kembali ke Login
                    </button>
                </motion.form>
            </motion.div>
        </div>
    )
}
