// components/ServiceCard.jsx
import { Link } from 'react-router-dom';
import { Star, Music, Repeat, Package, Headphones } from 'lucide-react';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';

const typeConfig = {
  collab: { icon: Music, label: 'Collaboration', color: 'primary' },
  loop_pack: { icon: Repeat, label: 'Loop Pack', color: 'info' },
  drum_kit: { icon: Package, label: 'Drum Kit', color: 'warning' },
  preset_pack: { icon: Headphones, label: 'Preset Pack', color: 'success' },
  sample_pack: { icon: Music, label: 'Sample Pack', color: 'primary' },
  subscription: { icon: Repeat, label: 'Subscription', color: 'success' },
  default: { icon: Package, label: 'Service', color: 'gray' },
};

export default function ServiceCard({ service }) {
  const {
    id,
    title,
    type,
    price,
    description,
    preview_url,
    seller,
    total_sales = 0,
    average_rating = 0,
  } = service;

  const config = typeConfig[type] || typeConfig.default;
  const Icon = config.icon;

  return (
    <Link to={`/services/${id}`} className="block group">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden hover:border-dark-600 hover:bg-dark-800/80 transition-all duration-200">
        {/* Image / Preview */}
        <div className="relative h-60 bg-dark-900">
          {preview_url ? (
            <img
              src={preview_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-dark-600" />
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={config.color}>{config.label}</Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1 bg-dark-900/90 backdrop-blur-sm rounded-lg">
              <span className="text-white font-bold">${parseFloat(price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Seller */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar name={seller?.display_name || seller?.username} size="xs" />
            <span className="text-sm text-dark-400 group-hover:text-dark-300 transition-colors">
              {seller?.display_name || seller?.username}
            </span>
            {seller?.is_verified && (
              <span className="text-primary-400 text-xs">✓</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-dark-500 mb-3 line-clamp-2">
            {description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-dark-500">
              {average_rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-warning-400 fill-warning-400" />
                  {average_rating.toFixed(1)}
                </span>
              )}
              {total_sales > 0 && (
                <span>{total_sales} sales</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}