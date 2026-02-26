// pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orders } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import OrderCard from '../components/OrderCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
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

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'price_low', label: 'Price: Low to High' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);

      try {
        const params = {
          role: 'buyer',
          page: searchParams.get('page') || 1,
          limit: 10,
        };

        if (statusFilter) params.status = statusFilter;
        if (sortBy) params.sort = sortBy;

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

    fetchOrders();
  }, [authLoading, isLoggedIn, navigate, searchParams, statusFilter, sortBy]);

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.delete('page'); // Reset page on filter change
    setSearchParams(newParams);
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
        <h1 className="text-3xl font-bold text-white">My Orders</h1>
        <p className="text-dark-400 mt-1">Track and manage your purchases</p>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                updateFilters({ status: e.target.value });
              }}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Sort By"
              options={sortOptions}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateFilters({ sort: e.target.value });
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
                : "You haven't made any purchases yet"
            }
            action={() => navigate('/browse')}
            actionLabel="Browse Services"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {orderList.map((order) => (
            <OrderCard key={order.id} order={order} viewType="buyer" />
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

          <div className="flex items-center gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === pagination.page
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                return (
                  <span key={page} className="text-dark-500 px-1">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

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
    </div>
  );
}