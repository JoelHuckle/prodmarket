// pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Use real registration
    const result = await register(
      formData.email,
      formData.password,
      formData.username,
      formData.username // Use username as display_name initially
    );

    if (result.success) {
      toast.success('Account created!', 'Welcome to ProdMarket');
      navigate('/dashboard');
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
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-dark-400 mt-1">Join the producer marketplace</p>
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
            label="Username"
            name="username"
            placeholder="yourname"
            icon={User}
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
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

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm your password"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="text-sm text-dark-400">
            <label className="flex items-start gap-2">
              <input type="checkbox" className="rounded border-dark-600 bg-dark-800 mt-0.5" required />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="text-primary-400 hover:text-primary-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-dark-700" />
          <span className="text-sm text-dark-500">or</span>
          <div className="flex-1 h-px bg-dark-700" />
        </div>

        {/* Google Signup Placeholder */}
        <Button variant="secondary" className="w-full" disabled>
          Continue with Google
        </Button>

        {/* Login Link */}
        <p className="text-center text-sm text-dark-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}