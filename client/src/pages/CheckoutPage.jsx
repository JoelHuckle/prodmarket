// pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { services as servicesApi, orders, payments } from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

// Stripe CardElement styling for dark theme
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': {
        color: '#6b7280',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

// Inner checkout form that uses Stripe hooks
function CheckoutForm({ items, currentTotal, currentSubtotal, currentServiceFee, serviceId, clearCart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return; // Stripe hasn't loaded yet
    }

    setProcessing(true);
    setError(null);

    try {
      const firstItem = items[0];

      // Step 1: Create PaymentIntent via your backend
      const { clientSecret, paymentIntentId } = await payments.createIntent({
        service_id: firstItem.id,
      });

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: user?.email,
            name: user?.display_name || user?.username,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
        // Step 3: Confirm payment and create order in backend
        const { order } = await payments.confirmPayment({
          payment_intent_id: paymentIntent.id,
          service_id: firstItem.id,
        });

        // Clear cart if this was a cart checkout
        if (!serviceId) {
          clearCart();
        }

        toast.success('Payment successful!', 'Your order has been placed');

        // Navigate to order page
        navigate(`/orders/${order.id}`);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err.message || 'Failed to process payment');
      toast.error('Payment failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-error-400 flex-shrink-0" size={20} />
          <p className="text-error-400">{error}</p>
        </div>
      )}

      {/* Contact Info */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={user?.email || ''}
            disabled
            hint="Order confirmation will be sent here"
          />
        </div>
      </Card>

      {/* Payment */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          Payment Method
        </h2>

        {/* Stripe Card Element */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">
              Card Details
            </label>
            <div className="p-4 bg-dark-900 border border-dark-700 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
              <CardElement 
                options={cardElementOptions}
                onChange={(e) => setCardComplete(e.complete)}
              />
            </div>
            <p className="text-xs text-dark-500 mt-2">
              Test card: 4242 4242 4242 4242 | Any future date | Any CVC
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-dark-400">
          <Lock size={14} />
          <span>Your payment info is encrypted and secure</span>
        </div>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={processing}
        disabled={!stripe || !cardComplete}
        icon={Lock}
      >
        {processing ? 'Processing...' : `Pay $${currentTotal.toFixed(2)}`}
      </Button>

      <p className="text-xs text-dark-500 text-center">
        By completing this purchase you agree to our{' '}
        <a href="/terms" className="text-primary-400 hover:underline">Terms of Service</a>
      </p>
    </form>
  );
}

// Main CheckoutPage component
export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const toast = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  // If coming from direct buy (single service)
  const serviceId = searchParams.get('service');

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) {
      navigate('/login?redirect=/checkout');
      return;
    }

    const loadItems = async () => {
      setLoading(true);

      if (serviceId) {
        // Direct buy - fetch single service
        try {
          const data = await servicesApi.getById(serviceId);
          const service = data.service || data;
          setItems([{ ...service, quantity: 1 }]);
        } catch (err) {
          setError('Failed to load service');
        }
      } else if (cartItems.length > 0) {
        // Cart checkout
        setItems(cartItems);
      } else {
        // No items
        navigate('/cart');
        return;
      }

      setLoading(false);
    };

    loadItems();
  }, [serviceId, cartItems, isLoggedIn, navigate]);

  // Calculate totals for current items
  const currentSubtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.price) * (item.quantity || 1);
  }, 0);
  const currentServiceFee = currentSubtotal * 0.05;
  const currentTotal = currentSubtotal + currentServiceFee;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card padding="lg">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-dark-700 rounded w-1/3" />
            <div className="h-24 bg-dark-700 rounded" />
            <div className="h-24 bg-dark-700 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <h1 className="text-3xl font-bold text-white">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Main Form - Wrapped in Stripe Elements */}
        <div className="lg:col-span-3">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              items={items}
              currentTotal={currentTotal}
              currentSubtotal={currentSubtotal}
              currentServiceFee={currentServiceFee}
              serviceId={serviceId}
              clearCart={clearCart}
            />
          </Elements>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card padding="lg" className="sticky top-24">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-dark-900 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.preview_url ? (
                      <img
                        src={item.preview_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-dark-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar
                        name={item.seller?.display_name || item.seller?.username}
                        size="xs"
                      />
                      <span className="text-xs text-dark-400">
                        {item.seller?.display_name || item.seller?.username}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-4 border-t border-dark-700 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Subtotal</span>
                <span className="text-white">${currentSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Service Fee (5%)</span>
                <span className="text-white">${currentServiceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-dark-700">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-white">
                  ${currentTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t border-dark-700 space-y-2">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <CheckCircle size={16} className="text-success-400" />
                <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <CheckCircle size={16} className="text-success-400" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <CheckCircle size={16} className="text-success-400" />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}