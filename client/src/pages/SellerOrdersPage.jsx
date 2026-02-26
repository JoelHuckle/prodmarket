// pages/SellerOrdersPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orders } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal, { ModalFooter } from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import OrderCard from '../components/OrderCard';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'awaiting_upload', label: 'Awaiting Upload' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'disputed', label: 'Disputed' },
];

export default function SellerOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  // Deliver modal state
  const [deliverModal, setDeliverModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate('/login?redirect=/seller/orders');
      return;
    }

    fetchOrders();
  }, [authLoading, isLoggedIn, navigate, searchParams, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const params = {
        role: 'seller',
        page: searchParams.get('page') || 1,
        limit: 10,
      };

      if (statusFilter) params.status = statusFilter;

      const data = await orders.getAll(params);
      setOrderList(data.orders || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleDeliver = async () => {
    if (!selectedOrder) return;

    setDelivering(true);

    try {
      await orders.updateStatus(selectedOrder.id, 'delivered');
      toast.success('Order delivered!', 'The buyer has been notified');
      setDeliverModal(false);
      setSelectedOrder(null);
      setDeliveryNote('');
      fetchOrders();
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setDelivering(false);
    }
  };

  const openDeliverModal = (order) => {
    setSelectedOrder(order);
    setDeliverModal(true);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Seller Orders</h1>
        <p className="text-dark-400 mt-1">Manage and fulfill your orders</p>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-xs">
            <Select
              label="Filter by Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                updateFilters({ status: e.target.value });
              }}
            />
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {loading ? (
        <PageLoader />
      ) : orderList.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={Package}
            title="No orders found"
            description={
              statusFilter
                ? 'Try changing your filters'
                : "You don't have any orders yet"
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {orderList.map((order) => (
            <div key={order.id} className="relative">
              <OrderCard order={order} viewType="seller" />

              {/* Action buttons for pending orders */}
              {['pending', 'awaiting_upload', 'in_progress'].includes(order.status) && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Upload}
                    onClick={(e) => {
                      e.preventDefault();
                      openDeliverModal(order);
                    }}
                  >
                    Deliver
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>

          <span className="text-dark-400 px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Deliver Modal */}
      <Modal
        isOpen={deliverModal}
        onClose={() => setDeliverModal(false)}
        title="Deliver Order"
        description="Mark this order as delivered"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="p-4 bg-dark-900 rounded-xl">
              <p className="font-medium text-white">{selectedOrder.service?.title}</p>
              <p className="text-sm text-dark-400">
                Order #{selectedOrder.id} • ${parseFloat(selectedOrder.amount || 0).toFixed(2)}
              </p>
            </div>

            <Textarea
              label="Delivery Note (optional)"
              placeholder="Add any notes for the buyer..."
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              rows={3}
            />

            <div className="p-4 bg-info-500/10 border border-info-500/30 rounded-xl">
              <p className="text-sm text-info-400">
                Make sure you've uploaded all files before marking as delivered.
                The buyer will be notified to review and complete the order.
              </p>
            </div>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setDeliverModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeliver}
                loading={delivering}
                icon={CheckCircle}
              >
                Mark as Delivered
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}