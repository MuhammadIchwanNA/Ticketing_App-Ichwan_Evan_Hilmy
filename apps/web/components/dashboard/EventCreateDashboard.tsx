'use client';
import React, { useState } from 'react';
import {
  Calendar, MapPin, Users, Clock, Image as ImageIcon, Tag,
  Plus, X, Save, Eye, Banknote
} from 'lucide-react';
import { apiClient } from '../../lib/api';

interface Voucher {
  id: number;
  code: string;
  discount: string; // stored as string in the form
  discountType: 'PERCENTAGE' | 'FIXED';
  maxUses: string;
  startDate: string;
  endDate: string;
}
type VoucherInput = Omit<Voucher, 'id'>;

interface EventFormData {
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalSeats: string;
  price: string;
  imageUrl: string;
  isPreview: boolean;
}

interface EventPreviewProps {
  formData: EventFormData;
  vouchers: Voucher[];
  onBack: () => void;
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const EventCreateDashboard: React.FC = () => {
  // Get today's date in YYYY-MM-DD format for minimum date
  const today = new Date();
  // Set minimum to today (but validation will ensure it's in the future)
  const minDate = today.toISOString().split('T')[0];

  // Set default times to current time + 1 hour and + 3 hours
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
  const defaultEndTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours
  
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    startTime: defaultStartTime.toTimeString().slice(0, 5), // HH:MM format
    endTime: defaultEndTime.toTimeString().slice(0, 5), // HH:MM format
    totalSeats: '',
    price: '',
    imageUrl: '',
    isPreview: false
  });

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherInput>({
    code: '',
    discount: '',
    discountType: 'PERCENTAGE',
    maxUses: '',
    startDate: '',
    endDate: ''
  });

  const categories = [
    'Technology', 'Music', 'Food & Drink', 'Sports', 'Art & Culture',
    'Business', 'Health & Wellness', 'Education', 'Entertainment', 'Community'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for date/time inputs
    if (name === 'startDate' || name === 'startTime') {
      const updatedData = { ...formData, [name]: value };
      if (updatedData.startDate && updatedData.startTime) {
        const startDateTime = new Date(`${updatedData.startDate}T${updatedData.startTime}`);
        const now = new Date();
        if (startDateTime <= now) {
          // Show warning but don't prevent input
          console.warn('Selected start time is in the past');
        }
      }
    }
  };

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentVoucher(prev => ({ ...prev, [name]: value }));
  };

  const addVoucher = () => {
    if (currentVoucher.code && currentVoucher.discount) {
      setVouchers(prev => [...prev, { ...currentVoucher, id: Date.now() }]);
      setCurrentVoucher({
        code: '',
        discount: '',
        discountType: 'PERCENTAGE',
        maxUses: '',
        startDate: '',
        endDate: ''
      });
    }
  };

  const removeVoucher = (id: number) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async () => {
  try {
    // Validate required fields
    if (!formData.name || !formData.description || !formData.category || 
        !formData.location || !formData.startDate || !formData.endDate ||
        !formData.startTime || !formData.endTime || !formData.totalSeats || 
        formData.price === '') {
      alert('Please fill in all required fields');
      return;
    }

    // Validate dates are in the future (using local timezone)
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();

    // Add a small buffer (1 minute) to account for processing time
    const minimumStartTime = new Date(now.getTime() + 60000); // 1 minute from now

    if (startDateTime <= minimumStartTime) {
      const currentTime = now.toLocaleString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      alert(`Event start time must be in the future.\n\nCurrent time: ${currentTime}\nSelected time: ${startDateTime.toLocaleString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}\n\nPlease select a future date and time.`);
      return;
    }

    if (endDateTime <= startDateTime) {
      alert('Event end time must be after start time');
      return;
    }

    const priceNum = Number(formData.price) || 0;
    const totalSeatsNum = Number(formData.totalSeats) || 0;

    const eventData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      price: priceNum,
      totalSeats: totalSeatsNum,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      imageUrl: formData.imageUrl || undefined
    };

    const response = await apiClient.post('/api/events', eventData);
    
    alert('Event created successfully!');
    
    // Redirect to dashboard after 1 second
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);

  } catch (error: any) {
    console.error('Error creating event:', error);
    alert('Error creating event: ' + error.message);
  }
};

  const togglePreview = () => {
    setFormData(prev => ({ ...prev, isPreview: !prev.isPreview }));
  };

  if (formData.isPreview) {
    return <EventPreview formData={formData} vouchers={vouchers} onBack={togglePreview} />;
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Create Event</h1>
          <p className="text-muted">Bring your vision to life and connect with amazing people</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" style={{ color: 'var(--sky)' }} />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your event name"
                    className="w-full px-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Event location"
                        className="w-full pl-10 pr-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: 'var(--mint)' }} />
                Date & Time
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    min={minDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select today or future date. Time validation will ensure it's in the future.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    min={formData.startDate || minDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">End date must be same or after start date</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: 'var(--rose)' }} />
                Capacity & Pricing
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Total Seats *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                    <input
                      type="number"
                      name="totalSeats"
                      value={formData.totalSeats}
                      onChange={handleInputChange}
                      placeholder="100"
                      min={1}
                      className="w-full pl-10 pr-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (IDR) *</label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0 for free events"
                      min={0}
                      className="w-full pl-10 pr-4 py-3 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)] transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted mt-1">Enter 0 for free events</p>
                </div>
              </div>
            </div>

            {/* Promotions */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" style={{ color: 'var(--banana)' }} />
                Promotional Vouchers <span className="text-sm font-normal text-muted">(Optional)</span>
              </h2>

              {/* Add Voucher Form */}
              <div className="bg-mint-tint rounded-lg p-4 mb-4">
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    name="code"
                    value={currentVoucher.code}
                    onChange={handleVoucherChange}
                    placeholder="Voucher code (e.g., EARLY25)"
                    className="px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="discount"
                      value={currentVoucher.discount}
                      onChange={handleVoucherChange}
                      placeholder="25"
                      min={1}
                      className="flex-1 px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)]"
                    />
                    <select
                      name="discountType"
                      value={currentVoucher.discountType}
                      onChange={handleVoucherChange}
                      className="px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)]"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="FIXED">IDR</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="number"
                    name="maxUses"
                    value={currentVoucher.maxUses}
                    onChange={handleVoucherChange}
                    placeholder="Max uses"
                    min={1}
                    className="px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)]"
                  />
                  <input
                    type="date"
                    name="startDate"
                    value={currentVoucher.startDate}
                    onChange={handleVoucherChange}
                    className="px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)]"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={currentVoucher.endDate}
                    onChange={handleVoucherChange}
                    className="px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-2 focus:ring-[var(--sky)] focus:border-[var(--sky)]"
                  />
                </div>

                <button onClick={addVoucher} className="btn btn-primary text-sm">
                  <Plus className="w-4 h-4" />
                  Add Voucher
                </button>
              </div>

              {/* Voucher List */}
              {vouchers.length > 0 && (
                <div className="space-y-2">
                  {vouchers.map((voucher) => (
                    <div key={voucher.id} className="flex items-center justify-between p-3 bg-sky-tint rounded-lg">
                      <div>
                        <span className="font-medium">{voucher.code}</span>
                        <span className="text-muted ml-2">
                          {voucher.discount}
                          {voucher.discountType === 'PERCENTAGE' ? '%' : ' IDR'} off
                        </span>
                        {voucher.maxUses && <span className="text-muted ml-2">• Max {voucher.maxUses} uses</span>}
                      </div>
                      <button onClick={() => removeVoucher(voucher.id)} className="p-1 rounded hover-lift" style={{ color: 'var(--rose)' }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Event Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Category:</span>
                  <span>{formData.category || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Price:</span>
                  <span>{formData.price ? formatIDR(Number(formData.price) || 0) : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Capacity:</span>
                  <span>{formData.totalSeats || '0'} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Vouchers:</span>
                  <span>{vouchers.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={togglePreview} className="w-full btn btn-ghost">
                <Eye className="w-4 h-4" />
                Preview Event
              </button>

              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.description || !formData.category}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Create Event
              </button>
            </div>

            <div className="text-xs text-muted">
              <p className="mb-2">Tips for success:</p>
              <ul className="space-y-1">
                <li>• Use high-quality cover images</li>
                <li>• Write detailed descriptions</li>
                <li>• Set reasonable pricing</li>
                <li>• Create attractive voucher codes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventPreview: React.FC<EventPreviewProps> = ({ formData, vouchers, onBack }) => {
  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gradient">Event Preview</h1>
          <button onClick={onBack} className="btn btn-ghost">Back to Edit</button>
        </div>

        <div className="card overflow-hidden">
          {formData.imageUrl && (
            <div className="h-64 bg-gradient-to-r from-[var(--mint)] to-[var(--sky)]">
              <img
                src={formData.imageUrl}
                alt={formData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = target.nextSibling as HTMLElement | null;
                  target.style.display = 'none';
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="h-full hidden items-center justify-center text-white font-medium">
                Cover Image Preview
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="chip chip-sky">{formData.category || 'Category'}</span>
              <span className="chip chip-mint">{formData.location || 'Location'}</span>
            </div>

            <h2 className="text-3xl font-bold mb-4">{formData.name || 'Event Name'}</h2>
            <p className="text-muted mb-6">{formData.description || 'Event description will appear here...'}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" style={{ color: 'var(--sky)' }} />
                  <div>
                    <p className="font-medium">
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString('id-ID') : 'Start Date'}
                    </p>
                    <p className="text-sm text-muted">
                      {formData.startTime || 'Start Time'} - {formData.endTime || 'End Time'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: 'var(--mint)' }} />
                  <div><p className="font-medium">{formData.location || 'Event Location'}</p></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" style={{ color: 'var(--rose)' }} />
                  <div>
                    <p className="font-medium">{formData.totalSeats || '0'} Total Seats</p>
                    <p className="text-sm text-muted">Available spots</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5" style={{ color: 'var(--banana)' }} />
                  <div>
                    <p className="font-medium">
                      {formData.price ? formatIDR(Number(formData.price) || 0) : 'Free'}
                    </p>
                    <p className="text-sm text-muted">Per ticket</p>
                  </div>
                </div>
              </div>
            </div>

            {vouchers.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Available Promotions</h3>
                <div className="flex flex-wrap gap-2">
                  {vouchers.map((v) => (
                    <div key={v.id} className="chip chip-banana">
                      {v.code}: {v.discount}{v.discountType === 'PERCENTAGE' ? '%' : ' IDR'} off
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventCreateDashboard;
