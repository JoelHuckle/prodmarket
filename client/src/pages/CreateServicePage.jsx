// pages/CreateServicePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Image,
  Music,
  Repeat,
  Package,
  Headphones,
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

const serviceTypes = [
  { value: 'collaboration', label: 'Collaboration', icon: Music, description: 'Work together with buyers on custom content' },
  { value: 'loop_pack', label: 'Loop Pack', icon: Repeat, description: 'Sell downloadable loop packs' },
  { value: 'drum_kit', label: 'Drum Kit', icon: Package, description: 'Sell downloadable drum kits' },
  { value: 'preset_pack', label: 'Preset Pack', icon: Headphones, description: 'Sell synth presets and settings' },
  { value: 'sample_pack', label: 'Sample Pack', icon: Music, description: 'Sell sample collections' },
  { value: 'subscription', label: 'Subscription', icon: Repeat, description: 'Recurring monthly content delivery' },
];

const deliveryTimeOptions = [
  { value: '1', label: '1 day' },
  { value: '3', label: '3 days' },
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
];

export default function CreateServicePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Type, 2: Details, 3: Pricing

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    price: '',
    delivery_time_days: '7',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // Redirect if not logged in or not a seller
  // Wait for auth to finish loading before redirecting
  if (authLoading) {
    return null; // Or show a loading spinner
  }

  if (!isLoggedIn) {
    navigate('/login?redirect=/services/create');
    return null;
  }

  if (!user.is_seller) {
    navigate('/become-seller?redirect=/services/create');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type }));
    setStep(2);
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

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be under 100 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) newErrors.price = 'Price is required';
    else if (price < 1) newErrors.price = 'Price must be at least $1';
    else if (price > 10000) newErrors.price = 'Price must be under $10,000';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        price: parseFloat(formData.price),
        delivery_time_days: parseInt(formData.delivery_time_days),
        tags: formData.tags,
      };

      const response = await services.create(payload);
      
      toast.success('Service created!', 'Your service is now live');
      navigate(`/services/${response.service.id}`);
    } catch (err) {
      console.error('Failed to create service:', err);
      toast.error('Error', err.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = serviceTypes.find((t) => t.value === formData.type);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Service</h1>
          <p className="text-dark-400 mt-1">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary-500' : 'bg-dark-700'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="space-y-4">
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              What type of service are you offering?
            </h2>
            <p className="text-dark-400 mb-6">
              Choose the category that best describes your service
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {serviceTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;

                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-600 hover:bg-dark-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary-500/20' : 'bg-dark-700'
                        }`}
                      >
                        <Icon
                          size={20}
                          className={isSelected ? 'text-primary-400' : 'text-dark-400'}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{type.label}</h3>
                        <p className="text-sm text-dark-400 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Selected Type */}
          {selectedType && (
            <Card padding="md" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <selectedType.icon size={20} className="text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{selectedType.label}</p>
                <p className="text-sm text-dark-400">{selectedType.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Change
              </Button>
            </Card>
          )}

          <Card padding="lg">
            <h2 className="text-xl font-semibold text-white mb-6">Service Details</h2>

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

              {/* Description */}
              <Textarea
                label="Description"
                name="description"
                placeholder="Describe what buyers will get. Be specific about what's included, file formats, and any requirements..."
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
                <p className="text-sm text-dark-500 mt-2">
                  Add up to 10 tags to help buyers find your service
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleNextStep}>Continue to Pricing</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary */}
          <Card padding="md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                {selectedType && <selectedType.icon size={20} className="text-primary-400" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{formData.title || 'Untitled Service'}</p>
                <p className="text-sm text-dark-400">{selectedType?.label}</p>
              </div>
            </div>
          </Card>

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
                hint={
                  formData.type === 'collaboration'
                    ? 'Time you need to complete collaboration orders'
                    : 'For digital products, buyers get instant access after purchase'
                }
              />

              {/* Info Box */}
              <div className="p-4 bg-info-500/10 border border-info-500/30 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-info-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-info-300">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="list-disc list-inside text-info-400 space-y-1">
                    <li>Your service will be visible on the marketplace</li>
                    <li>Buyers can purchase and you'll receive orders</li>
                    {formData.type === 'collaboration' && (
                      <li>For collaborations, funds are held in escrow until you deliver</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" loading={loading}>
                Create Service
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}