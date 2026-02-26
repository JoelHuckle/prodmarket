import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Clock,
  Download,
  Music,
  Repeat,
  Package,
  Headphones,
  CheckCircle,
  User,
} from 'lucide-react';
import { services } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { PageLoader } from '../components/ui/Spinner';

const typeConfig = {
  collab: { icon: Music, label: 'Collaboration', color: 'primary' },
  loop_pack: { icon: Repeat, label: 'Loop Pack', color: 'info' },
  drum_kit: { icon: Package, label: 'Drum Kit', color: 'warning' },
  preset_pack: { icon: Headphones, label: 'Preset Pack', color: 'success' },
  sample_pack: { icon: Music, label: 'Sample Pack', color: 'primary' },
  subscription: { icon: Repeat, label: 'Subscription', color: 'success' },
  default: { icon: Package, label: 'Service', color: 'gray' },
};

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await services.getById(id);
        setService(data.service || data);
      } catch (err) {
        console.error('Failed to fetch service:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.warning('Login required', 'Please login to add items to cart');
      navigate(`/login?redirect=/services/${id}`);
      return;
    }

    setAddingToCart(true);
    
    // TODO: Implement actual cart functionality
    // For now, just simulate
    await new Promise((r) => setTimeout(r, 500));
    
    toast.success('Added to cart!', `${service.title} has been added to your cart`);
    setAddingToCart(false);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.warning('Login required', 'Please login to make a purchase');
      navigate(`/login?redirect=/services/${id}`);
      return;
    }

    // Navigate to checkout with this service
    navigate(`/checkout?service=${id}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: service.description,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!', 'Service link copied to clipboard');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-error-400 mb-4">Failed to load service: {error}</p>
        <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400 mb-4">Service not found</p>
        <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
      </div>
    );
  }

  const config = typeConfig[service.type] || typeConfig.default;
  const TypeIcon = config.icon;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Image */}
          <div className="relative aspect-video bg-dark-800 rounded-2xl overflow-hidden border border-dark-700">
            {service.preview_url ? (
              <img
                src={service.preview_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TypeIcon className="w-24 h-24 text-dark-600" />
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant={config.color} size="lg">
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Title & Seller */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{service.title}</h1>
            
            <Link
              to={`/sellers/${service.seller?.username}`}
              className="inline-flex items-center gap-3 hover:bg-dark-800 rounded-xl p-2 -m-2 transition-colors"
            >
              <Avatar
                name={service.seller?.display_name || service.seller?.username}
                src={service.seller?.avatar_url}
                size="md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {service.seller?.display_name || service.seller?.username}
                  </span>
                  {service.seller?.is_verified && (
                    <CheckCircle size={16} className="text-primary-400" />
                  )}
                </div>
                <span className="text-sm text-dark-400">View Profile</span>
              </div>
            </Link>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="description">
                <Card padding="lg">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-dark-300 whitespace-pre-wrap leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {service.tags && service.tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-dark-700">
                      <h4 className="text-sm font-medium text-dark-400 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/browse?q=${tag}`}
                            className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-dark-300 text-sm rounded-full transition-colors"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card padding="lg">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-dark-400 mb-1">Type</h4>
                      <p className="text-white">{config.label}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-dark-400 mb-1">Delivery Time</h4>
                      <p className="text-white">{service.delivery_time_days} days</p>
                    </div>
                    {service.file_size_mb && (
                      <div>
                        <h4 className="text-sm font-medium text-dark-400 mb-1">File Size</h4>
                        <p className="text-white">{service.file_size_mb} MB</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-dark-400 mb-1">Total Sales</h4>
                      <p className="text-white">{service.total_sales || 0}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card padding="lg">
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">No reviews yet</p>
                    <p className="text-sm text-dark-500 mt-1">
                      Be the first to review this service
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Sidebar - Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card padding="lg" className="space-y-6">
              {/* Price */}
              <div>
                <span className="text-4xl font-bold text-white">
                  ${parseFloat(service.price).toFixed(2)}
                </span>
                {service.type === 'subscription' && (
                  <span className="text-dark-400 ml-2">/month</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-dark-400">
                {service.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-warning-400 fill-warning-400" />
                    <span>{service.average_rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{service.delivery_time_days} day delivery</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-dark-300">
                  <CheckCircle size={18} className="text-success-400" />
                  <span>Instant download after payment</span>
                </li>
                <li className="flex items-center gap-3 text-dark-300">
                  <CheckCircle size={18} className="text-success-400" />
                  <span>Commercial license included</span>
                </li>
                <li className="flex items-center gap-3 text-dark-300">
                  <CheckCircle size={18} className="text-success-400" />
                  <span>Secure payment via Stripe</span>
                </li>
              </ul>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full"
                  size="lg"
                >
                  {service.type === 'subscription' ? 'Subscribe Now' : 'Buy Now'}
                </Button>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  icon={ShoppingCart}
                  loading={addingToCart}
                >
                  Add to Cart
                </Button>
              </div>

              {/* Action Links */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-dark-700">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm">
                  <Heart size={16} />
                  Save
                </button>
              </div>
            </Card>

            {/* Seller Card */}
            <Card padding="md" className="mt-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={service.seller?.display_name || service.seller?.username}
                  src={service.seller?.avatar_url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">
                      {service.seller?.display_name || service.seller?.username}
                    </span>
                    {service.seller?.is_verified && (
                      <CheckCircle size={14} className="text-primary-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-dark-400">Seller</p>
                </div>
              </div>
              <Link to={`/sellers/${service.seller?.username}`}>
                <Button variant="ghost" className="w-full mt-4" size="sm" icon={User}>
                  View Profile
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}