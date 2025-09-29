'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, Users, Coins, Gift } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  ticketCount: number;
  totalAmount: number;
  pointsUsed: number;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED' | 'CANCELED';
  paymentProof?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    price: number;
    imageUrl?: string;
  };
  vouchers?: Array<{
    voucher: {
      id: string;
      code: string;
      discount: number;
      discountType: string;
    };
  }>;
  coupons?: Array<{
    coupon: {
      id: string;
      code: string;
      discount: number;
      discountType: string;
    };
  }>;
}

interface TransactionStatusProps {
  transactionId: string;
  onBack: () => void;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ transactionId, onBack }) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/transactions/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTransaction(data);
      } else {
        setError('Transaction not found');
      }
    } catch (error) {
      setError('Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!selectedFile || !transaction) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', selectedFile);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/transactions/${transaction.id}/payment-proof`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        await fetchTransaction(); // Refresh data
        setSelectedFile(null);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to upload payment proof');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelTransaction = async () => {
    if (!transaction || !confirm('Are you sure you want to cancel this transaction?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/transactions/${transaction.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchTransaction();
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to cancel transaction');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return {
          icon: <Clock className="h-5 w-5" />,
          text: 'Waiting for Payment',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'WAITING_CONFIRMATION':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          text: 'Waiting for Confirmation',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'CONFIRMED':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          text: 'Confirmed',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="h-5 w-5" />,
          text: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'EXPIRED':
        return {
          icon: <XCircle className="h-5 w-5" />,
          text: 'Expired',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      case 'CANCELED':
        return {
          icon: <XCircle className="h-5 w-5" />,
          text: 'Canceled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          text: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Transaction not found</div>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(transaction.status);

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Transactions
          </button>
          <h1 className="text-3xl font-bold text-gradient">Transaction Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="card p-6">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color} mb-4`}>
                {statusConfig.icon}
                <span className="font-medium">{statusConfig.text}</span>
              </div>

              {/* Countdown Timer for waiting payment */}
              {transaction.status === 'WAITING_PAYMENT' && transaction.expiresAt && (
                <div className="mb-4">
                  <CountdownTimer 
                    expiresAt={transaction.expiresAt}
                    onExpiry={fetchTransaction}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Payment Upload */}
              {transaction.status === 'WAITING_PAYMENT' && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Payment Proof
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {selectedFile && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Selected: {selectedFile.name}
                        </span>
                        <button
                          onClick={handleUploadPaymentProof}
                          disabled={uploadLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {uploadLoading ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Proof Display */}
              {transaction.paymentProof && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-3">Payment Proof Uploaded</h3>
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded">
                    Payment proof has been submitted and is waiting for organizer confirmation.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {(transaction.status === 'WAITING_PAYMENT' || transaction.status === 'WAITING_CONFIRMATION') && (
                <button
                  onClick={handleCancelTransaction}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Cancel Transaction
                </button>
              )}
            </div>

            {/* Event Details */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Event Details</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{transaction.event.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(transaction.event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{transaction.event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{transaction.ticketCount} ticket{transaction.ticketCount > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Transaction Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Transaction ID</span>
                  <span className="font-mono text-xs">{transaction.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tickets</span>
                  <span>{transaction.ticketCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Price</span>
                  <span>IDR {transaction.event.price.toLocaleString()}</span>
                </div>
                
                {/* Discounts */}
                {transaction.vouchers && transaction.vouchers.length > 0 && (
                  <div className="space-y-2">
                    {transaction.vouchers.map((tv, index) => (
                      <div key={index} className="flex justify-between items-center text-green-600">
                        <div className="flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          <span>Voucher: {tv.voucher.code}</span>
                        </div>
                        <span>
                          -{tv.voucher.discountType === 'PERCENTAGE' ? `${tv.voucher.discount}%` : `IDR ${tv.voucher.discount}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {transaction.coupons && transaction.coupons.length > 0 && (
                  <div className="space-y-2">
                    {transaction.coupons.map((tc, index) => (
                      <div key={index} className="flex justify-between items-center text-green-600">
                        <div className="flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          <span>Coupon: {tc.coupon.code}</span>
                        </div>
                        <span>
                          -{tc.coupon.discountType === 'PERCENTAGE' ? `${tc.coupon.discount}%` : `IDR ${tc.coupon.discount}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {transaction.pointsUsed > 0 && (
                  <div className="flex justify-between items-center text-blue-600">
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      <span>Points Used</span>
                    </div>
                    <span>-IDR {transaction.pointsUsed.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>IDR {transaction.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Guide */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Status Guide</h2>
              <div className="space-y-3 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-yellow-600" />
                  <span><strong>Waiting Payment:</strong> Upload payment proof within 2 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-blue-600" />
                  <span><strong>Waiting Confirmation:</strong> Organizer reviewing payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span><strong>Confirmed:</strong> Ticket ready, you can attend!</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span><strong>Rejected:</strong> Payment proof rejected, contact organizer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;