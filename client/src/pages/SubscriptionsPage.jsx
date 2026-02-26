// pages/SubscriptionsPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Package,
  Download,
  XCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Music,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptions } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal, { ModalFooter } from '../components/ui/Modal';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [expandedPacks, setExpandedPacks] = useState({});
  const [packs, setPacks] = useState({});
  const [loadingPacks, setLoadingPacks] = useState({});

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate('/login?redirect=/subscriptions');
      return;
    }

    fetchSubscriptions();
  }, [authLoading, isLoggedIn, navigate]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await subscriptions.getMy();
      setSubscriptionsList(data.subscriptions || []);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      toast.error('Error', 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPacks = async (serviceId) => {
    if (packs[serviceId]) {
      // Already loaded
      return;
    }

    setLoadingPacks((prev) => ({ ...prev, [serviceId]: true }));
    try {
      const data = await subscriptions.getPacks(serviceId);
      setPacks((prev) => ({ ...prev, [serviceId]: data.packs || [] }));
    } catch (err) {
      console.error('Failed to fetch packs:', err);
      toast.error('Error', 'Failed to load subscription packs');
    } finally {
      setLoadingPacks((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const togglePacks = (serviceId) => {
    const isExpanded = expandedPacks[serviceId];
    if (!isExpanded && !packs[serviceId]) {
      fetchPacks(serviceId);
    }
    setExpandedPacks((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const handleCancelClick = (subscription) => {
    setSelectedSubscription(subscription);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSubscription) return;

    setCancelling(true);
    try {
      await subscriptions.cancel(selectedSubscription.id);
      toast.success('Cancelled', 'Your subscription has been cancelled');
      setCancelModalOpen(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      toast.error('Error', err.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  const activeSubscriptions = subscriptionsList.filter(
    (sub) => sub.status === 'active'
  );
  const cancelledSubscriptions = subscriptionsList.filter(
    (sub) => sub.status === 'cancelled'
  );

  // Calculate stats
  const stats = {
    active: activeSubscriptions.length,
    monthlySpend: activeSubscriptions.reduce(
      (sum, sub) => sum + parseFloat(sub.service?.price || 0),
      0
    ),
    total: subscriptionsList.length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>
          <p className="text-dark-400 mt-1">
            Manage your active and cancelled subscriptions
          </p>
        </div>
        <Link to="/browse?type=subscription">
          <Button icon={Music}>Browse Subscriptions</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats.active > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-sm text-dark-400">Active</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${stats.monthlySpend.toFixed(2)}
                </p>
                <p className="text-sm text-dark-400">Monthly Spend</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-info-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-dark-400">Total Subscriptions</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Subscriptions List */}
      <div>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledSubscriptions.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="active">
              {activeSubscriptions.length === 0 ? (
                <Card padding="lg">
                  <EmptyState
                    icon={Package}
                    title="No active subscriptions"
                    description="Browse subscription services to get access to exclusive monthly content"
                    action={() => navigate('/browse?type=subscription')}
                    actionLabel="Browse Subscriptions"
                  />
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeSubscriptions.map((subscription) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      onCancel={handleCancelClick}
                      onTogglePacks={togglePacks}
                      isPacksExpanded={expandedPacks[subscription.service_id]}
                      packs={packs[subscription.service_id]}
                      loadingPacks={loadingPacks[subscription.service_id]}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled">
              {cancelledSubscriptions.length === 0 ? (
                <Card padding="lg">
                  <EmptyState
                    icon={CheckCircle}
                    title="No cancelled subscriptions"
                    description="You haven't cancelled any subscriptions"
                  />
                </Card>
              ) : (
                <div className="space-y-4">
                  {cancelledSubscriptions.map((subscription) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      isCancelled
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !cancelling && setCancelModalOpen(false)}
        title="Cancel Subscription?"
        description="Are you sure you want to cancel this subscription?"
      >
        {selectedSubscription && (
          <div className="space-y-4">
            <div className="bg-dark-900 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar
                  name={selectedSubscription.seller?.display_name}
                  src={selectedSubscription.seller?.avatar_url}
                  size="sm"
                />
                <div>
                  <p className="font-semibold text-white">
                    {selectedSubscription.service?.title}
                  </p>
                  <p className="text-sm text-dark-400">
                    by {selectedSubscription.seller?.display_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Monthly Price</span>
                <span className="font-semibold text-white">
                  ${parseFloat(selectedSubscription.service?.price || 0).toFixed(2)}/mo
                </span>
              </div>
            </div>

            <div className="bg-warning-500/10 border border-warning-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-warning-400 font-medium mb-1">Important</p>
                  <p className="text-dark-300">
                    You'll keep access until the end of your current billing period (
                    {new Date(selectedSubscription.current_period_end).toLocaleDateString()}
                    ). You won't be charged again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setCancelModalOpen(false)}
            disabled={cancelling}
          >
            Keep Subscription
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelConfirm}
            loading={cancelling}
            icon={XCircle}
          >
            Cancel Subscription
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// ==========================================
// Subscription Card Component
// ==========================================
function SubscriptionCard({
  subscription,
  onCancel,
  isCancelled = false,
  onTogglePacks,
  isPacksExpanded,
  packs,
  loadingPacks,
}) {
  const service = subscription.service;
  const seller = subscription.seller;
  const nextBilling = new Date(subscription.current_period_end);
  const daysUntilRenewal = Math.ceil((nextBilling - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card padding="none">
      <div className="p-6">
        <div className="flex gap-4">
          {/* Service Image */}
          <div className="w-20 h-20 bg-dark-900 rounded-xl flex-shrink-0 overflow-hidden">
            {service?.preview_url ? (
              <img
                src={service.preview_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-8 h-8 text-dark-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white text-lg truncate">
                    {service?.title || 'Subscription'}
                  </h3>
                  {isCancelled ? (
                    <Badge variant="gray" size="sm">
                      Cancelled
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  )}
                </div>

                {/* Seller */}
                <Link
                  to={`/users/${seller?.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
                >
                  <Avatar
                    name={seller?.display_name || seller?.username}
                    src={seller?.avatar_url}
                    size="xs"
                  />
                  <span className="text-sm text-dark-400">
                    {seller?.display_name || seller?.username}
                  </span>
                </Link>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  ${parseFloat(service?.price || 0).toFixed(2)}
                </p>
                <p className="text-sm text-dark-400">per month</p>
              </div>
            </div>

            {/* Description */}
            {service?.description && (
              <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                {service.description}
              </p>
            )}

            {/* Billing Info */}
            <div className="bg-dark-900 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-dark-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {isCancelled ? 'Access until' : 'Next billing date'}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {nextBilling.toLocaleDateString()}
                </span>
              </div>
              {!isCancelled && daysUntilRenewal <= 7 && (
                <div className="flex items-center gap-2 text-sm text-warning-400 mt-2">
                  <Clock className="w-4 h-4" />
                  <span>Renews in {daysUntilRenewal} days</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!isCancelled && (
                <>
                  <Button
                    size="sm"
                    icon={Package}
                    onClick={() => onTogglePacks(subscription.service_id)}
                  >
                    {isPacksExpanded ? 'Hide' : 'View'} Content Packs
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={XCircle}
                    onClick={() => onCancel(subscription)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Packs */}
      {isPacksExpanded && !isCancelled && (
        <div className="border-t border-dark-700 p-6 bg-dark-900/50">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-400" />
            Available Content Packs
          </h4>

          {loadingPacks ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-dark-400 mt-2">Loading packs...</p>
            </div>
          ) : !packs || packs.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No packs yet"
              description="Your seller hasn't uploaded any content packs yet. Check back soon!"
            />
          ) : (
            <div className="space-y-3">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h5 className="font-semibold text-white mb-1">
                        {pack.title}
                      </h5>
                      {pack.description && (
                        <p className="text-sm text-dark-400 mb-2">
                          {pack.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-dark-500">
                        <span>
                          {new Date(pack.uploaded_at).toLocaleDateString()}
                        </span>
                        {pack.file_size_mb && (
                          <span>{pack.file_size_mb} MB</span>
                        )}
                        <span>{pack.file_urls?.length || 0} files</span>
                      </div>
                    </div>
                    <Button size="sm" icon={Download}>
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
