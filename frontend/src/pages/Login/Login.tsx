import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login, clearError } from '@/store/slices/authSlice'

export const Login = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth)

    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const dashboards = {
                mahasiswa: '/dashboard/mahasiswa',
                dosen: '/dashboard/dosen',
                admin: '/admin/dashboard',
            }
            navigate(dashboards[user.role], { replace: true })
        }
    }, [isAuthenticated, user, navigate])

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError())
        }
    }, [dispatch])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!username.trim() || !password.trim()) {
            return
        }

        try {
            await dispatch(login({ nim_nip: username, password })).unwrap()
            // Navigation will be handled by the useEffect above
        } catch {
            // Error is handled by Redux state
        }
    }

    // Animation variants with proper typing
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12,
            },
        },
    }

    const imageVariants: Variants = {
        hidden: { opacity: 0, scale: 1.1 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    }

    const logoVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, rotate: -10 },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 200,
                damping: 15,
            },
        },
    }

    const buttonVariants: Variants = {
        idle: { scale: 1 },
        hover: { scale: 1.02 },
        tap: { scale: 0.98 },
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image */}
            <motion.div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-gray-800/60 to-blue-900/50 z-10" />
                <motion.img
                    src="/loginbg.jpg"
                    alt="Wisuda ITEBA"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                />

                {/* Overlay decorative elements */}
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.div
                            className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20"
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            transition={{ type: 'spring' as const, stiffness: 300 }}
                        >
                            <GraduationCap className="w-14 h-14 text-white" />
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Selamat Datang</h2>
                        <p className="text-lg text-white/80 max-w-md drop-shadow">
                            Sistem Informasi Manajemen Tugas Akhir untuk kemudahan dalam pengelolaan tugas akhir mahasiswa
                        </p>
                    </motion.div>
                </div>

                {/* Animated floating shapes */}
                <motion.div
                    className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl z-10"
                    animate={{
                        y: [0, 20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-32 right-20 w-48 h-48 bg-gray-400/20 rounded-full blur-3xl z-10"
                    animate={{
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
                {/* Decorative background elements */}
                <motion.div
                    className="absolute top-10 right-10 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-10 w-52 h-52 bg-gray-200/50 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="w-full max-w-md relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Logo Section */}
                    <motion.div variants={logoVariants} className="text-center mb-10 flex justify-center">
                        <motion.img
                            src="/LOGIN-Logo.png"
                            alt="SIMTA Logo"
                            className="h-24 w-auto"
                            whileHover={{
                                rotate: [0, -5, 5, 0],
                                transition: { duration: 0.5 }
                            }}
                        />
                    </motion.div>

                    {/* Login Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Username Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <Label
                                htmlFor="username"
                                className="text-sm font-medium text-gray-600"
                            >
                                Username
                            </Label>
                            <motion.div
                                whileFocus={{ scale: 1.01 }}
                                className="relative"
                            >
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-12 px-4 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 rounded-xl shadow-sm hover:border-gray-300"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-sm font-medium text-gray-600"
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 px-4 pr-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 rounded-xl shadow-sm hover:border-gray-300"
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={showPassword ? 'eye' : 'eyeoff'}
                                            initial={{ opacity: 0, rotate: -90 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {showPassword ? (
                                                <Eye className="w-5 h-5" />
                                            ) : (
                                                <EyeOff className="w-5 h-5" />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Remember Me & Forgot Password */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                                >
                                    Remember me
                                </Label>
                            </div>
                            <motion.button
                                type="button"
                                onClick={() => alert('Silakan hubungi Admin untuk reset password Anda.\n\nEmail: admin@iteba.ac.id')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                whileHover={{ x: 2 }}
                            >
                                Forgot Password
                            </motion.button>
                        </motion.div>

                        {/* Login Button */}
                        <motion.div variants={itemVariants}>
                            <motion.div
                                variants={buttonVariants}
                                initial="idle"
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-gray-600 hover:from-blue-600 hover:via-blue-700 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 cursor-pointer"
                                >
                                    <AnimatePresence mode="wait">
                                        {isLoading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                />
                                                <span>Logging in...</span>
                                            </motion.div>
                                        ) : (
                                            <motion.span
                                                key="login"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                Login
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.form>

                    {/* Footer */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-10 text-center"
                    >
                        <motion.p
                            className="text-sm text-blue-600 font-medium"
                            animate={{
                                opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        >
                            Institut Teknologi Batam 2025
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
