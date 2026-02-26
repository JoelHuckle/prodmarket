// pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';

export default function CartPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { items, removeItem, clearCart, subtotal, serviceFee, total } = useCart();
  const toast = useToast();

  const handleRemove = (item) => {
    removeItem(item.id);
    toast.info('Removed', `${item.title} removed from cart`);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.warning('Login required', 'Please login to checkout');
      navigate('/login?redirect=/cart');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="lg">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Browse our marketplace to find beats, loops, and more"
            action={() => navigate('/browse')}
            actionLabel="Start Browsing"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <p className="text-dark-400 mt-1">{items.length} item{items.length !== 1 && 's'}</p>
        </div>
        <Button variant="ghost" onClick={clearCart} size="sm">
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden">
              <div className="flex">
                {/* Image */}
                <div className="w-32 h-32 bg-dark-900 flex-shrink-0">
                  {item.preview_url ? (
                    <img
                      src={item.preview_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-dark-600" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex-1">
                    {/* Seller */}
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar
                        name={item.seller?.display_name || item.seller?.username}
                        size="xs"
                      />
                      <span className="text-sm text-dark-400">
                        {item.seller?.display_name || item.seller?.username}
                      </span>
                    </div>

                    {/* Title */}
                    <Link
                      to={`/services/${item.id}`}
                      className="font-semibold text-white hover:text-primary-400 transition-colors"
                    >
                      {item.title}
                    </Link>

                    {/* Type */}
                    <p className="text-sm text-dark-500 capitalize">{item.type?.replace('_', ' ')}</p>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-white">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemove(item)}
                      className="p-2 text-dark-400 hover:text-error-400 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Continue Shopping */}
          <Link
            to="/browse"
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card padding="lg" className="sticky top-24">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Service Fee (5%)</span>
                <span className="text-white">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-dark-700 pt-3 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full mt-6"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
            >
              Proceed to Checkout
            </Button>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-dark-700">
              <p className="text-xs text-dark-500 text-center">
                🔒 Secure checkout powered by Stripe
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}