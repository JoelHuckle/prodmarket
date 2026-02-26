// pages/MyServicesPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package, Edit, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { services as servicesApi } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal, { ModalFooter } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function MyServicesPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [serviceList, setServiceList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate('/login?redirect=/my-services');
      return;
    }

    fetchServices();
  }, [authLoading, isLoggedIn, navigate, user]);

  const fetchServices = async () => {
    setLoading(true);

    try {
      const data = await servicesApi.getAll({ seller_id: user.id });
      setServiceList(data.services || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      toast.error('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await servicesApi.update(service.id, { is_active: !service.is_active });
      toast.success(
        service.is_active ? 'Service deactivated' : 'Service activated',
        service.is_active
          ? 'Your service is now hidden from the marketplace'
          : 'Your service is now visible on the marketplace'
      );
      fetchServices();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    setDeleting(true);

    try {
      await servicesApi.delete(selectedService.id);
      toast.success('Service deleted', 'Your service has been removed');
      setDeleteModal(false);
      setSelectedService(null);
      fetchServices();
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setDeleteModal(true);
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Services</h1>
          <p className="text-dark-400 mt-1">Manage your service listings</p>
        </div>
        <Link to="/services/create">
          <Button icon={Plus}>Create Service</Button>
        </Link>
      </div>

      {/* Services List */}
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
        <div className="space-y-4">
          {serviceList.map((service) => (
            <Card key={service.id} padding="none" className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="w-full sm:w-48 h-32 sm:h-auto bg-dark-900 flex-shrink-0">
                  {service.preview_url ? (
                    <img
                      src={service.preview_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-dark-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{service.title}</h3>
                        <Badge
                          variant={service.is_active ? 'success' : 'gray'}
                          size="sm"
                        >
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-dark-400 capitalize">
                        {service.type?.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-white">
                      ${parseFloat(service.price).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-sm text-dark-500 line-clamp-2 mb-4 flex-1">
                    {service.description}
                  </p>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-dark-400">
                      <span>{service.total_sales || 0} sales</span>
                      <span>•</span>
                      <span>
                        Created {new Date(service.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/services/${service.id}`}>
                        <Button variant="ghost" size="sm" icon={Eye}>
                          View
                        </Button>
                      </Link>
                      <Link to={`/services/${service.id}/edit`}>
                        <Button variant="ghost" size="sm" icon={Edit}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={service.is_active ? EyeOff : Eye}
                        onClick={() => handleToggleActive(service)}
                      >
                        {service.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-error-400 hover:text-error-300"
                        onClick={() => openDeleteModal(service)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Service"
        description="Are you sure you want to delete this service?"
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="p-4 bg-dark-900 rounded-xl">
              <p className="font-medium text-white">{selectedService.title}</p>
              <p className="text-sm text-dark-400">
                ${parseFloat(selectedService.price).toFixed(2)} •{' '}
                {selectedService.total_sales || 0} sales
              </p>
            </div>

            <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-xl">
              <p className="text-sm text-error-400">
                This action cannot be undone. All data associated with this
                service will be permanently deleted.
              </p>
            </div>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                icon={Trash2}
              >
                Delete Service
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}