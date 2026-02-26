// pages/EditServicePage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  X,
  Save,
  Trash2,
  Info,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { services } from '../utils/api';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Modal, { ModalFooter } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';

const serviceTypes = [
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'loop_pack', label: 'Loop Pack' },
  { value: 'drum_kit', label: 'Drum Kit' },
  { value: 'preset_pack', label: 'Preset Pack' },
  { value: 'sample_pack', label: 'Sample Pack' },
  { value: 'subscription', label: 'Subscription' },
];

const deliveryTimeOptions = [
  { value: '1', label: '1 day' },
  { value: '3', label: '3 days' },
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
];

export default function EditServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    price: '',
    delivery_time_days: '7',
    tags: [],
    is_active: true,
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/services/' + id + '/edit');
      return;
    }

    const fetchService = async () => {
      setLoading(true);
      try {
        const data = await services.getById(id);
        const service = data.service || data;

        // Check if user owns this service
        if (service.seller_id !== user.id) {
          toast.error('Unauthorized', 'You can only edit your own services');
          navigate('/my-services');
          return;
        }

        setFormData({
          title: service.title || '',
          description: service.description || '',
          type: service.type || '',
          price: service.price?.toString() || '',
          delivery_time_days: service.delivery_time_days?.toString() || '7',
          tags: service.tags || [],
          is_active: service.is_active ?? true,
        });
      } catch (err) {
        console.error('Failed to fetch service:', err);
        toast.error('Error', 'Failed to load service');
        navigate('/my-services');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, isLoggedIn, navigate, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be under 100 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) newErrors.price = 'Price is required';
    else if (price < 1) newErrors.price = 'Price must be at least $1';
    else if (price > 10000) newErrors.price = 'Price must be under $10,000';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setSaving(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        price: parseFloat(formData.price),
        delivery_time_days: parseInt(formData.delivery_time_days),
        tags: formData.tags,
        is_active: formData.is_active,
      };

      await services.update(id, payload);
      
      toast.success('Service updated!', 'Your changes have been saved');
      navigate(`/services/${id}`);
    } catch (err) {
      console.error('Failed to update service:', err);
      toast.error('Error', err.message || 'Failed to update service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await services.delete(id);
      toast.success('Service deleted', 'Your service has been removed');
      navigate('/my-services');
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Service</h1>
            <p className="text-dark-400 mt-1">Update your service listing</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-error-400 hover:text-error-300"
          icon={Trash2}
          onClick={() => setDeleteModal(true)}
        >
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>

          <div className="space-y-6">
            {/* Title */}
            <Input
              label="Title"
              name="title"
              placeholder="e.g., Professional Trap Loop Pack"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              hint={`${formData.title.length}/100 characters`}
            />

            {/* Type */}
            <Select
              label="Service Type"
              name="type"
              options={serviceTypes}
              value={formData.type}
              onChange={handleChange}
            />

            {/* Description */}
            <Textarea
              label="Description"
              name="description"
              placeholder="Describe what buyers will get..."
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              hint={`${formData.description.length} characters (minimum 50)`}
              rows={6}
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                Tags
              </label>
              <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="outline" icon={Plus}>
                  Add
                </Button>
              </form>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-dark-700 text-dark-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-dark-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-white mb-6">Pricing & Delivery</h2>

          <div className="space-y-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">$</span>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  step="0.01"
                  min="1"
                  max="10000"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-3 bg-dark-800 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.price ? 'border-error-500' : 'border-dark-700'
                  }`}
                />
              </div>
              {errors.price && <p className="text-sm text-error-400 mt-1">{errors.price}</p>}
              {formData.price && !errors.price && (
                <p className="text-sm text-dark-500 mt-1">
                  You'll earn ${(parseFloat(formData.price) * 0.92).toFixed(2)} after 8% platform fee
                </p>
              )}
            </div>

            {/* Delivery Time */}
            <Select
              label="Delivery Time"
              name="delivery_time_days"
              options={deliveryTimeOptions}
              value={formData.delivery_time_days}
              onChange={handleChange}
            />

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-dark-900 rounded-xl">
              <div>
                <p className="font-medium text-white">Service Active</p>
                <p className="text-sm text-dark-400">
                  {formData.is_active
                    ? 'Your service is visible on the marketplace'
                    : 'Your service is hidden from the marketplace'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Service"
        description="Are you sure you want to delete this service?"
      >
        <div className="space-y-4">
          <div className="p-4 bg-dark-900 rounded-xl">
            <p className="font-medium text-white">{formData.title}</p>
            <p className="text-sm text-dark-400">
              ${parseFloat(formData.price || 0).toFixed(2)}
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
      </Modal>
    </div>
  );
}