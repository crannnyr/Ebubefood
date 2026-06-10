import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, addToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPw) { addToast('error', 'Please fill in all fields'); return; }
    if (password.length < 6) { addToast('error', 'Password must be at least 6 characters'); return; }
    if (password !== confirmPw) { addToast('error', 'Passwords do not match'); return; }
    setLoading(true);
    const success = await register(name, email, password, phone);
    setLoading(false);
    if (success) {
      addToast('success', 'Account created! Welcome to CBK Foods');
      navigate('/');
    } else {
      addToast('error', 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="CBK" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Join CBK Foods for the best delivery experience</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="input-field pl-10" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-field pl-10" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                className="input-field pl-10" placeholder="08012345678" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                className="input-field pl-10 pr-10" placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
              <input type={showPw ? 'text' : 'password'} required value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="input-field pl-10" placeholder="Confirm your password" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
