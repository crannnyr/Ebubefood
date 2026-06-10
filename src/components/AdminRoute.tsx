import { Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthLoading } = useStore();

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
