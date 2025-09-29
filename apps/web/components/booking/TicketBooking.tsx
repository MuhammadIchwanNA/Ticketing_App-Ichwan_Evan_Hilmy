'use client';

import React, { useState, useEffect } from 'react';
import { X, Ticket, MapPin, Calendar, DollarSign, Users, Gift, Coins } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  imageUrl?: string;
  availableSeats: number;
  totalSeats: number;
}

interface TicketBookingProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
}

const TicketBooking: React.FC<TicketBookingProps> = ({ event, isOpen, onClose, onSuccess }) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [voucherCode, setVoucherCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchUserPoints();
    }
  }, [isOpen]);

  const fetchUserPoints = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.user.pointsBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const validateDiscount = async (code: string, type: 'voucher' | 'coupon') => {
    if (!code.trim()) {
      setDiscountAmount(0);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/events/${event.id}/validate-${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscountAmount(data.discount);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message);
        setDiscountAmount(0);
      }
    } catch (error) {
      setError('Error validating discount code');
      setDiscountAmount(0);
    }
  };

  const calculateTotal = () => {
    const subtotal = event.price * ticketCount;
    const finalAmount = Math.max(0, subtotal - discountAmount - pointsUsed);
    
    return {
      subtotal,
      discount: discountAmount,
      points: pointsUsed,
      total: finalAmount
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketCount > event.availableSeats) {
      setError('Not enough available seats');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please login to continue');
        return;
      }

      const requestData = {
        eventId: event.id,
        ticketCount,
        voucherCodes: voucherCode ? [voucherCode] : [],
        couponCodes: couponCode ? [couponCode] : [],
        pointsUsed: pointsUsed || 0,
        referralCode: referralCode || undefined
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.transaction.id);
      } else {
        setError(data.message || 'Failed to create transaction');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const { subtotal, discount, points, total } = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient">Book Tickets</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Event Info */}
          <div className="bg-cream rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-3">{event.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(event.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>IDR {event.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{event.availableSeats} seats left</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ticket Count */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Ticket className="h-4 w-4 inline mr-2" />
                Number of Tickets
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center font-semibold">
                  {ticketCount}
                </span>
                <button
                  type="button"
                  onClick={() => setTicketCount(Math.min(event.availableSeats, ticketCount + 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Voucher Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Gift className="h-4 w-4 inline mr-2" />
                Voucher Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter voucher code"
                />
                <button
                  type="button"
                  onClick={() => validateDiscount(voucherCode, 'voucher')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Gift className="h-4 w-4 inline mr-2" />
                Coupon Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter coupon code"
                />
                <button
                  type="button"
                  onClick={() => validateDiscount(couponCode, 'coupon')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Points */}
            {userPoints > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Coins className="h-4 w-4 inline mr-2" />
                  Use Points (Available: {userPoints})
                </label>
                <input
                  type="number"
                  min="0"
                  max={Math.min(userPoints, subtotal)}
                  value={pointsUsed}
                  onChange={(e) => setPointsUsed(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter points to use"
                />
              </div>
            )}

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter referral code"
              />
            </div>

            {/* Price Summary */}
            <div className="bg-cream rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({ticketCount} tickets)</span>
                <span>IDR {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-IDR {discount.toLocaleString()}</span>
                </div>
              )}
              {points > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Points Used</span>
                  <span>-IDR {points.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>IDR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || ticketCount < 1 || ticketCount > event.availableSeats}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Book ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketBooking;