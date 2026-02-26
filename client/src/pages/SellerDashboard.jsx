// pages/SellerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Eye,
  Star,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orders, services as servicesApi } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import OrderCard from '../components/OrderCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    totalServices: 0,
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate('/login?redirect=/seller');
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch seller orders
        let ordersList = [];
        try {
          const ordersData = await orders.getAll({ role: 'seller' });
          ordersList = ordersData.orders || [];
        } catch (e) {
          console.log('No seller orders yet');
        }
        setOrderList(ordersList);

        // Fetch seller services
        let servicesList = [];
        try {
          const servicesData = await servicesApi.getAll({ seller_id: user.id });
          servicesList = servicesData.services || [];
        } catch (e) {
          console.log('No services yet');
        }
        setServiceList(servicesList);

        // Calculate stats
        const pending = ordersList.filter((o) =>
          ['pending', 'awaiting_upload', 'in_progress', 'paid'].includes(o.status)
        ).length;
        const completed = ordersList.filter((o) => o.status === 'completed').length;
        const totalEarnings = ordersList
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + parseFloat(o.seller_amount || o.amount || 0), 0);

        setStats({
          totalOrders: ordersList.length,
          pendingOrders: pending,
          completedOrders: completed,
          totalEarnings,
          totalServices: servicesList.length,
        });
      } catch (err) {
        console.error('Failed to fetch seller data:', err);
        toast.error('Error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isLoggedIn, navigate, user]);

  if (loading) {
    return <PageLoader />;
  }

  // Filter orders
  const pendingOrders = orderList.filter((o) =>
    ['pending', 'awaiting_upload', 'in_progress', 'paid'].includes(o.status)
  );
  const deliveredOrders = orderList.filter((o) => o.status === 'delivered');
  const completedOrders = orderList.filter((o) => o.status === 'completed');

  // Active services
  const activeServices = serviceList.filter((s) => s.is_active);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
          <p className="text-dark-400 mt-1">Manage your services and orders</p>
        </div>
        <Link to="/services/create">
          <Button icon={Plus}>Create Service</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                ${stats.totalEarnings.toFixed(2)}
              </p>
              <p className="text-sm text-dark-400">Total Earnings</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
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
              <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
              <p className="text-sm text-dark-400">Pending</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
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
              <p className="text-2xl font-bold text-white">{stats.totalServices}</p>
              <p className="text-sm text-dark-400">Services</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders.length > 0 && (
        <Card padding="md" className="border-warning-500/30 bg-warning-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                You have {pendingOrders.length} pending order{pendingOrders.length !== 1 && 's'}
              </h3>
              <p className="text-sm text-dark-400">
                Please upload files or deliver these orders soon
              </p>
            </div>
            <Link to="/seller/orders?status=pending">
              <Button variant="warning" size="sm">
                View Orders
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Orders Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
            <Link
              to="/seller/orders"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({deliveredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="pending">
                {pendingOrders.length === 0 ? (
                  <Card padding="lg">
                    <EmptyState
                      icon={Clock}
                      title="No pending orders"
                      description="New orders will appear here"
                    />
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.slice(0, 5).map((order) => (
                      <OrderCard key={order.id} order={order} viewType="seller" />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="delivered">
                {deliveredOrders.length === 0 ? (
                  <Card padding="lg">
                    <EmptyState
                      icon={Package}
                      title="No delivered orders"
                      description="Orders awaiting buyer confirmation"
                    />
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {deliveredOrders.slice(0, 5).map((order) => (
                      <OrderCard key={order.id} order={order} viewType="seller" />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {completedOrders.length === 0 ? (
                  <Card padding="lg">
                    <EmptyState
                      icon={CheckCircle}
                      title="No completed orders"
                      description="Completed orders will appear here"
                    />
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {completedOrders.slice(0, 5).map((order) => (
                      <OrderCard key={order.id} order={order} viewType="seller" />
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Services Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My Services</h2>
            <Link
              to="/my-services"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              Manage <ArrowRight size={16} />
            </Link>
          </div>

          {serviceList.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={Package}
                title="No services yet"
                description="Create your first service to start selling"
                action={() => navigate('/services/create')}
                actionLabel="Create Service"
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {serviceList.slice(0, 4).map((service) => (
                <Link key={service.id} to={`/services/${service.id}`}>
                  <Card hover padding="sm">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-dark-900 rounded-lg flex-shrink-0 overflow-hidden">
                        {service.preview_url ? (
                          <img
                            src={service.preview_url}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-dark-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">
                          {service.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-primary-400">
                            ${parseFloat(service.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-dark-500">
                            • {service.total_sales || 0} sales
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={service.is_active ? 'success' : 'gray'}
                        size="sm"
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}

              <Link to="/services/create">
                <Card
                  hover
                  padding="md"
                  className="border-dashed border-dark-600 flex items-center justify-center gap-2 text-dark-400 hover:text-white"
                >
                  <Plus size={18} />
                  <span>Add New Service</span>
                </Card>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/services/create">
            <Card hover padding="md" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">New Service</h3>
                <p className="text-sm text-dark-400">Create a listing</p>
              </div>
            </Card>
          </Link>

          <Link to="/seller/orders">
            <Card hover padding="md" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-info-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-info-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">All Orders</h3>
                <p className="text-sm text-dark-400">Manage orders</p>
              </div>
            </Card>
          </Link>

          <Link to="/seller/earnings">
            <Card hover padding="md" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Earnings</h3>
                <p className="text-sm text-dark-400">View payouts</p>
              </div>
            </Card>
          </Link>

          <Link to="/seller/analytics">
            <Card hover padding="md" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Analytics</h3>
                <p className="text-sm text-dark-400">View insights</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}