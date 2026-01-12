/**
 * ===========================================
 * App Component - Main Application
 * ===========================================
 * Root component dengan routing dan auth initialization
 */

import { useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { initializeAuth } from './store/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

// Pages
import { Login } from './pages/Login/Login'
import { DashboardDosen } from './pages/Dashboard/Dosen/DashboardDosen'
import { DashboardMhs } from './pages/Dashboard/Mahasiswa/DashboardMhs'
import { DashboardAdmin } from './pages/Admin/DashboardAdmin'
import { ManajemenUser } from './pages/Admin/ManajemenUser'
import { ManajemenUserMahasiswa } from './pages/Admin/ManajemenUserMahasiswa'
import { ManajemenUserDosen } from './pages/Admin/ManajemenUserDosen'
import { EditUser } from './pages/Admin/EditUser'
import { KelolaJadwal } from './pages/Admin/KelolaJadwal'
import { JadwalSidang } from './pages/Jadwal/JadwalSidang'
import { BimbinganMahasiswa } from './pages/Bimbingan/Mahasiswa/BimbinganMahasiswa'
import { BimbinganDosen } from './pages/Bimbingan/Dosen/BimbinganDosen'
import { ListMahasiswaBimbingan } from './pages/Bimbingan/Dosen/ListMahasiswaBimbingan'
import { ProfileMahasiswa } from './pages/Profile/ProfileMahasiswa'
import { ProfileDosen } from './pages/Profile/ProfileDosen'

// Wireframe Pages (untuk dokumentasi skripsi)
import { LoginWireframe, DashboardWireframe, BimbinganWireframe } from './pages/Wireframe'

function App() {
  const dispatch = useAppDispatch()
  const { isInitialized, isAuthenticated, user } = useAppSelector((state) => state.auth)

  // Initialize auth on app load
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">SIMTA</h2>
          <p className="text-white/70">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  // Helper to redirect authenticated users from login page
  const LoginRoute = () => {
    if (isAuthenticated && user) {
      const dashboards = {
        mahasiswa: '/dashboard/mahasiswa',
        dosen: '/dashboard/dosen',
        admin: '/admin/dashboard',
      }
      return <Navigate to={dashboards[user.role]} replace />
    }
    return <Login />
  }

  return (
    <Routes>
      {/* Public Route - Login */}
      <Route path="/" element={<LoginRoute />} />

      {/* Mahasiswa Routes */}
      <Route
        path="/dashboard/mahasiswa"
        element={
          <ProtectedRoute allowedRoles={['mahasiswa']}>
            <DashboardMhs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bimbingan/mahasiswa"
        element={
          <ProtectedRoute allowedRoles={['mahasiswa']}>
            <BimbinganMahasiswa />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/mahasiswa"
        element={
          <ProtectedRoute allowedRoles={['mahasiswa']}>
            <ProfileMahasiswa />
          </ProtectedRoute>
        }
      />

      {/* Dosen Routes */}
      <Route
        path="/dashboard/dosen"
        element={
          <ProtectedRoute allowedRoles={['dosen']}>
            <DashboardDosen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dosen/mahasiswa"
        element={
          <ProtectedRoute allowedRoles={['dosen']}>
            <ListMahasiswaBimbingan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bimbingan/dosen"
        element={
          <ProtectedRoute allowedRoles={['dosen']}>
            <ListMahasiswaBimbingan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bimbingan/dosen/:mahasiswaId"
        element={
          <ProtectedRoute allowedRoles={['dosen']}>
            <BimbinganDosen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/dosen"
        element={
          <ProtectedRoute allowedRoles={['dosen']}>
            <ProfileDosen />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManajemenUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/mahasiswa/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManajemenUserMahasiswa />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/dosen/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManajemenUserDosen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jadwal"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <KelolaJadwal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userType/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EditUser />
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/jadwal-sidang"
        element={
          <ProtectedRoute allowedRoles={['mahasiswa', 'dosen', 'admin']}>
            <JadwalSidang />
          </ProtectedRoute>
        }
      />

      {/* Wireframe Routes (PUBLIC - untuk dokumentasi skripsi) */}
      <Route path="/wireframe/login" element={<LoginWireframe />} />
      <Route path="/wireframe/dashboard" element={<DashboardWireframe />} />
      <Route path="/wireframe/bimbingan" element={<BimbinganWireframe />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
