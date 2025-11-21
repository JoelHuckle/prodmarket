// components/OrderCard.jsx
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Package, AlertTriangle, CreditCard, Truck } from 'lucide-react';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';

const statusConfig = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  paid: { label: 'Paid', color: 'info', icon: CreditCard },
  awaiting_upload: { label: 'Awaiting Upload', color: 'warning', icon: Clock },
  in_progress: { label: 'In Progress', color: 'primary', icon: Package },
  delivered: { label: 'Delivered', color: 'success', icon: Truck },
  completed: { label: 'Completed', color: 'success', icon: CheckCircle },
  disputed: { label: 'Disputed', color: 'error', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'gray', icon: AlertTriangle },
  refunded: { label: 'Refunded', color: 'gray', icon: CreditCard },
};

export default function OrderCard({ order, viewType = 'buyer' }) {
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  // Determine who to show (seller for buyer view, buyer for seller view)
  const otherUser = viewType === 'buyer' ? order.seller : order.buyer;
  const service = order.service;

  return (
    <Link to={`/orders/${order.id}`} className="block group">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 hover:border-dark-600 hover:bg-dark-800/80 transition-all duration-200">
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
                <Package className="w-8 h-8 text-dark-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                {service?.title || 'Service'}
              </h3>
              <Badge variant={status.color} size="sm">
                <StatusIcon size={12} className="mr-1" />
                {status.label}
              </Badge>
            </div>

            {/* Other User */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                name={otherUser?.display_name || otherUser?.username}
                src={otherUser?.avatar_url}
                size="xs"
              />
              <span className="text-sm text-dark-400">
                {viewType === 'buyer' ? 'Seller: ' : 'Buyer: '}
                {otherUser?.display_name || otherUser?.username}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-500">
                Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
              </span>
              <span className="font-semibold text-white">
                ${parseFloat(order.amount || order.total_price || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}