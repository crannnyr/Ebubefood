import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, addToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { addToast('error', 'Please fill in all fields'); return; }
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      addToast('success', 'Welcome back!');
      navigate('/');
    } else {
      addToast('error', 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="CBK" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your CBK Foods account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-field pl-10" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                className="input-field pl-10 pr-10" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" className="rounded" style={{ accentColor: 'var(--primary)' }} />
              Remember me
            </label>
            <button type="button" onClick={() => addToast('info', 'Password reset coming soon')}
              className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
