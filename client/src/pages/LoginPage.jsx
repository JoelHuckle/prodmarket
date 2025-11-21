// pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, testLogin, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome back!', 'You have been logged in');
      navigate(redirect);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleTestLogin = async () => {
    setLoading(true);
    const result = await testLogin('test@example.com', 'Test User');

    if (result.success) {
      toast.success('Welcome!', 'Logged in as Test User');
      navigate(redirect);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md" padding="lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-dark-400 mt-1">Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-error-500/10 border border-error-500/30 rounded-xl">
            <p className="text-sm text-error-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-9 text-dark-500 hover:text-dark-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-dark-400">
              <input type="checkbox" className="rounded border-dark-600 bg-dark-800" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-dark-700" />
          <span className="text-sm text-dark-500">or</span>
          <div className="flex-1 h-px bg-dark-700" />
        </div>

        {/* Test Login (Development) */}
        <Button
          variant="outline"
          onClick={handleTestLogin}
          loading={loading}
          className="w-full mb-3"
        >
          Quick Test Login
        </Button>

        {/* Google Login Placeholder */}
        <Button variant="secondary" className="w-full" disabled>
          Continue with Google
        </Button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-dark-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}