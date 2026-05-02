import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Shield, Lock, User } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { MOCK_USERS } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DEMO_CREDENTIALS = [
  { email: 'admin@mediflow.com', password: 'Admin@2026', role: 'admin', label: 'Admin', color: 'bg-red-50 border-red-200 text-red-700' },
  { email: 'sarah.mitchell@mediflow.com', password: 'Provider@2026', role: 'provider', label: 'Provider', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { email: 'james.rivera@mediflow.com', password: 'Biller@2026', role: 'biller', label: 'Biller', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { email: 'emily.chen@mediflow.com', password: 'Coder@2026', role: 'coder', label: 'Coder', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['All modules — full access'],
  provider: ['Dashboard', 'Patients', 'Scheduling', 'Clinical Notes', 'Charge Entry', 'Coding'],
  biller: ['Dashboard', 'Patients', 'Claims', 'Payments', 'ERA Posting', 'AR Management', 'Patient Statement', 'Reports'],
  coder: ['Dashboard', 'Patients', 'Clinical Notes', 'Charge Entry', 'Coding'],
};

export default function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const match = DEMO_CREDENTIALS.find(
        c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );

      if (match) {
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          setCurrentUser(user);
          toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
          navigate('/');
        }
      } else {
        setError('Invalid email or password. Try a demo account below.');
      }
      setLoading(false);
    }, 900);
  };

  const handleDemoLogin = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === cred.email.toLowerCase());
      if (user) {
        setCurrentUser(user);
        toast.success(`Logged in as ${user.name} (${cred.role})`);
        navigate('/');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-dark))] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute border border-white/20 rounded-full"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--teal))] flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-2xl">MediFlow</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Medical Billing &<br />Practice Management
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            A comprehensive cloud-based RCM platform designed for small to mid-sized healthcare providers and billing companies.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: Shield, title: 'HIPAA Compliant', desc: 'End-to-end encryption and audit logging' },
            { icon: Activity, title: 'Revenue Cycle Management', desc: 'From charge entry to payment posting' },
            { icon: Lock, title: 'Role-Based Access', desc: 'Granular permissions per user role' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon className="w-4 h-4 text-[hsl(var(--teal))]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-white/50 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[hsl(var(--background))]">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden mb-4">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--teal))] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-foreground font-bold text-xl">MediFlow</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-muted-foreground text-sm mt-1">Access your practice management portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-text block mb-1.5">Email Address</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  className="input-field pl-9"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="label-text block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-9 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn('w-full btn-primary justify-center py-2.5 text-base', loading && 'opacity-70 cursor-wait')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground">Or sign in with a demo account</span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map(cred => (
              <button
                key={cred.role}
                onClick={() => handleDemoLogin(cred)}
                disabled={loading}
                className={cn('border rounded-lg px-3 py-3 text-left transition-all hover:shadow-sm', cred.color)}
              >
                <p className="text-xs font-bold uppercase tracking-wide">{cred.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5 truncate">{cred.email}</p>
                <div className="mt-1.5">
                  <p className="text-[10px] font-medium opacity-80">Access:</p>
                  <p className="text-[10px] opacity-60 leading-relaxed">
                    {ROLE_PERMISSIONS[cred.role]?.[0]}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Protected by HIPAA-compliant security protocols
          </p>
        </div>
      </div>
    </div>
  );
}
