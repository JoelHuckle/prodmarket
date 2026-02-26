// pages/BuyerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Package,
  TrendingUp,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orders, downloads } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import OrderCard from '../components/OrderCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { PageLoader, Skeleton } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    totalSpent: 0,
  });
  const [recentDownloads, setRecentDownloads] = useState([]);

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch orders
        const ordersData = await orders.getAll({ role: 'buyer' });
        const ordersList = ordersData.orders || [];
        setOrderList(ordersList);

        // Calculate stats
        const pending = ordersList.filter((o) =>
          ['pending', 'awaiting_upload', 'in_progress', 'paid'].includes(o.status)
        ).length;
        const completed = ordersList.filter((o) => o.status === 'completed').length;
        const totalSpent = ordersList.reduce(
          (sum, o) => sum + parseFloat(o.amount || o.total_price || 0),
          0
        );

        setStats({
          total: ordersList.length,
          pending,
          completed,
          totalSpent,
        });

        // Fetch recent downloads
        try {
          const downloadsData = await downloads.getMy();
          setRecentDownloads((downloadsData.downloads || []).slice(0, 5));
        } catch (e) {
          // Downloads endpoint might not exist yet
          console.log('Downloads fetch skipped');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        toast.error('Error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isLoggedIn, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  // Filter orders by status
  const activeOrders = orderList.filter((o) =>
    ['pending', 'awaiting_upload', 'in_progress', 'paid', 'delivered'].includes(o.status)
  );
  const completedOrders = orderList.filter((o) => o.status === 'completed');
  const disputedOrders = orderList.filter((o) =>
    ['disputed', 'cancelled', 'refunded'].includes(o.status)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">
            Welcome back, {user?.display_name || user?.username}!
          </p>
        </div>
        <Link to="/browse">
          <Button icon={ShoppingBag}>Browse Services</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-dark-400">Total Orders</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-sm text-dark-400">In Progress</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-sm text-dark-400">Completed</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-info-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
              <p className="text-sm text-dark-400">Total Spent</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">My Orders</h2>
          <Link
            to="/orders"
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
            {disputedOrders.length > 0 && (
              <TabsTrigger value="disputed">
                Issues ({disputedOrders.length})
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="active">
              {activeOrders.length === 0 ? (
                <Card padding="lg">
                  <EmptyState
                    icon={Package}
                    title="No active orders"
                    description="Browse our marketplace to find your next purchase"
                    action={() => navigate('/browse')}
                    actionLabel="Browse Services"
                  />
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeOrders.slice(0, 5).map((order) => (
                    <OrderCard key={order.id} order={order} viewType="buyer" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedOrders.length === 0 ? (
                <Card padding="lg">
                  <EmptyState
                    icon={CheckCircle}
                    title="No completed orders yet"
                    description="Your completed orders will appear here"
                  />
                </Card>
              ) : (
                <div className="space-y-3">
                  {completedOrders.slice(0, 5).map((order) => (
                    <OrderCard key={order.id} order={order} viewType="buyer" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="disputed">
              <div className="space-y-3">
                {disputedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} viewType="buyer" />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Recent Downloads */}
      {recentDownloads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Downloads</h2>
            <Link
              to="/downloads"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <Card padding="md">
            <div className="divide-y divide-dark-700">
              {recentDownloads.map((download) => (
                <div
                  key={download.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-900 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-dark-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{download.file_name || 'File'}</p>
                      <p className="text-sm text-dark-500">
                        {new Date(download.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" icon={Download}>
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/browse">
            <Card hover padding="md" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Browse Services</h3>
                <p className="text-sm text-dark-400">Find beats, loops & more</p>
              </div>
            </Card>
          </Link>

          <Link to="/orders">
            <Card hover padding="md" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-info-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-info-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">My Orders</h3>
                <p className="text-sm text-dark-400">Track your purchases</p>
              </div>
            </Card>
          </Link>

          <Link to="/settings">
            <Card hover padding="md" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center">
                <Avatar name={user?.display_name || user?.username} size="md" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Account Settings</h3>
                <p className="text-sm text-dark-400">Manage your profile</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}