// pages/BecomeSellerPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  Package,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { users } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';

export default function BecomeSellerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoggedIn, loading: authLoading, updateUser } = useAuth();
  const toast = useToast();

  const [activating, setActivating] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      navigate('/login?redirect=/become-seller');
      return;
    }

    // If already a seller, redirect to create service or dashboard
    if (user.is_seller) {
      const redirect = searchParams.get('redirect') || '/seller';
      navigate(redirect);
    }
  }, [authLoading, isLoggedIn, user, navigate, searchParams]);

  const handleActivate = async () => {
    setActivating(true);

    try {
      const data = await users.becomeSeller();

      if (data.success) {
        // Update user context with new seller status
        updateUser({ ...user, is_seller: true });

        toast.success('Seller account activated!', 'You can now start selling on ProdMarket');

        // Redirect to intended destination or dashboard
        const redirect = searchParams.get('redirect') || '/seller';
        navigate(redirect);
      }
    } catch (error) {
      toast.error('Error', error.message || 'Failed to activate seller account');
    } finally {
      setActivating(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  // If already a seller, show nothing (will redirect)
  if (user?.is_seller) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white">Become a Seller</h1>
        <p className="text-lg text-dark-400 max-w-2xl mx-auto">
          Turn your music production skills into income. Join thousands of producers selling their
          beats, loops, and presets on ProdMarket.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card padding="lg" className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-success-500/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-success-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Earn Money</h3>
          <p className="text-dark-400">
            Set your own prices and keep 95% of every sale. We only charge a 5% platform fee.
          </p>
        </Card>

        <Card padding="lg" className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Manage Orders</h3>
          <p className="text-dark-400">
            Easy-to-use seller dashboard to track sales, manage services, and fulfill orders.
          </p>
        </Card>

        <Card padding="lg" className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-info-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-info-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Grow Your Brand</h3>
          <p className="text-dark-400">
            Reach a global audience of producers and build your reputation in the community.
          </p>
        </Card>
      </div>

      {/* Features */}
      <Card padding="lg">
        <h2 className="text-2xl font-bold text-white mb-6">What You Get</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-success-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Seller Dashboard</h3>
              <p className="text-dark-400">
                Track your sales, earnings, and order status all in one place
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-success-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Secure Payments</h3>
              <p className="text-dark-400">
                Payments are processed securely through Stripe with buyer protection
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-success-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">File Hosting</h3>
              <p className="text-dark-400">
                Upload and deliver your files with our secure cloud storage
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-success-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Dispute Protection</h3>
              <p className="text-dark-400">
                Our escrow system protects both buyers and sellers in every transaction
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-success-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Analytics & Insights</h3>
              <p className="text-dark-400">
                Track your performance with detailed analytics and sales reports
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Requirements */}
      <Card padding="lg" className="border-dark-600">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Seller Requirements</h2>
            <ul className="space-y-2 text-dark-400">
              <li>• Must be 18 years or older</li>
              <li>• Agree to our Terms of Service and Seller Agreement</li>
              <li>• Provide accurate information for your seller profile</li>
              <li>• Own the rights to any content you sell</li>
              <li>• Deliver orders within the specified timeframe</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <Card padding="lg" className="bg-gradient-to-br from-primary-900/20 to-primary-800/10 border-primary-500/30">
        <div className="text-center space-y-4">
          <Zap className="w-12 h-12 text-primary-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Ready to Start Selling?</h2>
          <p className="text-dark-300 max-w-xl mx-auto">
            Activate your seller account now and start earning from your music production work. It
            only takes a few seconds!
          </p>
          <Button
            size="lg"
            onClick={handleActivate}
            loading={activating}
            icon={ArrowRight}
            className="mx-auto"
          >
            Activate Seller Account
          </Button>
          <p className="text-sm text-dark-500">
            Free to activate • 5% platform fee • Withdraw anytime
          </p>
        </div>
      </Card>
    </div>
  );
}
