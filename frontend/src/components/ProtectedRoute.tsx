/**
 * ===========================================
 * Protected Route Component
 * ===========================================
 * Wrapper untuk route yang memerlukan autentikasi
 * dan optional role-based access control
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Array<'mahasiswa' | 'dosen' | 'admin'>;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const { isAuthenticated, isInitialized, user, isLoading } = useAppSelector((state) => state.auth);

    // Show loading while checking auth
    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white/70">Memuat...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const roleDashboards = {
            mahasiswa: '/dashboard/mahasiswa',
            dosen: '/dashboard/dosen',
            admin: '/admin/users',
        };

        return <Navigate to={roleDashboards[user.role]} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
