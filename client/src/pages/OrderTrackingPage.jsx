// pages/OrderTrackingPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  AlertTriangle,
  Package,
  CreditCard,
  Truck,
  Star,
} from 'lucide-react';
import { orders } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { PageLoader } from '../components/ui/Spinner';

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  paid: { label: 'Paid', color: 'info', icon: CreditCard },
  in_progress: { label: 'In Progress', color: 'primary', icon: Package },
  delivered: { label: 'Delivered', color: 'success', icon: Truck },
  completed: { label: 'Completed', color: 'success', icon: CheckCircle },
  disputed: { label: 'Disputed', color: 'error', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'gray', icon: AlertTriangle },
  refunded: { label: 'Refunded', color: 'gray', icon: CreditCard },
};

const statusSteps = ['pending', 'paid', 'in_progress', 'delivered', 'completed'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await orders.getById(id);
        setOrder(data.order || data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await orders.updateStatus(id, 'completed');
      setOrder((prev) => ({ ...prev, status: 'completed' }));
      toast.success('Order completed!', 'Thank you for your purchase');
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = () => {
    navigate(`/disputes/new?order=${id}`);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <p className="text-error-400 mb-4">{error || 'Order not found'}</p>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Orders</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Order #{order.id}</h1>
          <p className="text-dark-400 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Badge variant={status.color} size="lg">
          <StatusIcon size={16} className="mr-1" />
          {status.label}
        </Badge>
      </div>

      {/* Progress Tracker */}
      {!['disputed', 'cancelled', 'refunded'].includes(order.status) && (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-white mb-6">Order Progress</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-dark-700" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary-500 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const stepConfig = statusConfig[step];
                const StepIcon = stepConfig.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'bg-dark-800 border-dark-600 text-dark-500'
                      } ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}`}
                    >
                      <StepIcon size={18} />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCompleted ? 'text-white' : 'text-dark-500'
                      }`}
                    >
                      {stepConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-white mb-4">Service</h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-dark-900 rounded-lg flex-shrink-0 overflow-hidden">
                {order.service?.preview_url ? (
                  <img
                    src={order.service.preview_url}
                    alt={order.service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-dark-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Link
                  to={`/services/${order.service?.id}`}
                  className="font-semibold text-white hover:text-primary-400 transition-colors"
                >
                  {order.service?.title || 'Service'}
                </Link>
                <p className="text-sm text-dark-400 capitalize mt-1">
                  {order.service?.type?.replace('_', ' ')}
                </p>
                <p className="text-lg font-bold text-white mt-2">
                  ${parseFloat(order.total_price || order.service?.price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Seller */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-white mb-4">Seller</h2>
            <div className="flex items-center gap-4">
              <Avatar
                name={order.seller?.display_name || order.seller?.username}
                src={order.seller?.avatar_url}
                size="lg"
              />
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {order.seller?.display_name || order.seller?.username}
                </p>
                <p className="text-sm text-dark-400">@{order.seller?.username}</p>
              </div>
              <Button variant="outline" size="sm" icon={MessageSquare}>
                Contact
              </Button>
            </div>
          </Card>

          {/* Files (if delivered) */}
          {['delivered', 'completed'].includes(order.status) && order.file_urls && (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-white mb-4">Files</h2>
              <div className="space-y-2">
                {(Array.isArray(order.file_urls) ? order.file_urls : [order.file_urls]).map(
                  (url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-dark-900 rounded-xl hover:bg-dark-700 transition-colors"
                    >
                      <Download className="text-primary-400" size={20} />
                      <span className="text-white">Download File {index + 1}</span>
                    </a>
                  )
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <Card padding="lg" className="sticky top-24 space-y-4">
            <h2 className="text-lg font-semibold text-white">Actions</h2>

            {/* Complete Order (if delivered) */}
            {order.status === 'delivered' && (
              <Button
                onClick={handleComplete}
                className="w-full"
                icon={CheckCircle}
                loading={actionLoading}
              >
                Mark as Complete
              </Button>
            )}

            {/* Leave Review (if completed) */}
            {order.status === 'completed' && (
              <Button variant="outline" className="w-full" icon={Star}>
                Leave Review
              </Button>
            )}

            {/* Download (if delivered/completed) */}
            {['delivered', 'completed'].includes(order.status) && (
              <Button variant="outline" className="w-full" icon={Download}>
                Download Files
              </Button>
            )}

            {/* Contact Seller */}
            <Button variant="ghost" className="w-full" icon={MessageSquare}>
              Contact Seller
            </Button>

            {/* Open Dispute (if not completed/cancelled) */}
            {!['completed', 'cancelled', 'refunded', 'disputed'].includes(order.status) && (
              <Button
                variant="ghost"
                className="w-full text-error-400 hover:text-error-300"
                onClick={handleDispute}
                icon={AlertTriangle}
              >
                Open Dispute
              </Button>
            )}

            {/* Order Info */}
            <div className="pt-4 border-t border-dark-700 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Order ID</span>
                <span className="text-white">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Created</span>
                <span className="text-white">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              {order.delivery_deadline && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Deadline</span>
                  <span className="text-white">
                    {new Date(order.delivery_deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}