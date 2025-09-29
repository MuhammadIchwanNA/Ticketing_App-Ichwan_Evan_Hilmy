'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Upload, CheckCircle, Clock, 
  AlertCircle, CreditCard, FileImage
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  ticketCount: number;
  totalAmount: number;
  pointsUsed: number;
  status: string;
  paymentProof: string | null;
  expiresAt: string;
  createdAt: string;
  event: {
    id: string;
    name: string;
    startDate: string;
    location: string;
    price: number;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth?view=login');
        return;
      }

      const response = await apiClient.get(`/api/transactions/${transactionId}`);
      setTransaction(response);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setPaymentFile(file);
      setError(null);
    }
  };

  const uploadPaymentProof = async () => {
    if (!paymentFile) {
      setError('Please select a payment proof image');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('paymentProof', paymentFile);

      const response = await fetch(`/api/transactions/${transactionId}/payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setSuccess('Payment proof uploaded successfully! Please wait for confirmation.');
        fetchTransaction(); // Refresh transaction data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload payment proof');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT': return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'EXPIRED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT': return <Clock className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <AlertCircle className="w-4 h-4" />;
      case 'EXPIRED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky mx-auto mb-4"></div>
          <p className="text-muted">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Transaction Not Found</h2>
          <p className="text-muted mb-4">The requested transaction could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-sky text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Debug log
  console.log('Transaction status:', transaction?.status);
  console.log('PaymentProof:', transaction?.paymentProof);
  console.log('Should show upload?', (transaction?.status === 'WAITING_PAYMENT' || !transaction?.paymentProof));

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>

        {/* Transaction Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transaction #{transaction.id.slice(-8)}</h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              {transaction.status.replace('_', ' ')}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-cream rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg mb-2">{transaction.event.name}</h3>
            <p className="text-muted text-sm mb-1">{transaction.event.location}</p>
            <p className="text-muted text-sm">
              {new Date(transaction.event.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Payment Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted">Tickets ({transaction.ticketCount}x)</span>
              <span>{formatCurrency(transaction.event.price * transaction.ticketCount)}</span>
            </div>
            {transaction.pointsUsed > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Points Used</span>
                <span>-{formatCurrency(transaction.pointsUsed)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>{formatCurrency(transaction.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          {(transaction.status === 'WAITING_PAYMENT' || transaction.status === 'WAITING_CONFIRMATION') && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Instructions
              </h4>
              <div className="text-blue-700 text-sm space-y-1">
                <p><strong>Bank Transfer:</strong></p>
                <p><strong>Bank BCA:</strong> 1234-5678-9012</p>
                <p><strong>Bank Mandiri:</strong> 9876-5432-1098</p>
                <p><strong>Account Name:</strong> PT EventTix Indonesia</p>
                <div className="mt-3 p-2 bg-blue-100 rounded">
                  <p className="font-semibold"><strong>Total Amount:</strong> {formatCurrency(transaction.totalAmount)}</p>
                </div>
                {transaction.status === 'WAITING_PAYMENT' && (
                  <p className="mt-2 text-xs text-blue-600">
                    💡 After transfer, please upload your payment proof below
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-xs">
          <p><strong>Debug:</strong> Status = {transaction.status}, PaymentProof = {transaction.paymentProof || 'null'}</p>
          <p>Show upload section: {String((transaction.status === 'WAITING_PAYMENT' || !transaction.paymentProof))}</p>
        </div>

        {/* Upload Payment Proof - ALWAYS SHOW FOR DEBUG */}
        <div className="bg-white border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Payment Proof
          </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Receipt (JPG, PNG, max 5MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select JPG, PNG, or PDF file (max 5MB)
                  </p>
                </div>
              </div>

              {paymentFile && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <FileImage className="w-4 h-4" />
                  <span>
                    <strong>{paymentFile.name}</strong> ({(paymentFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                  <strong>Success:</strong> {success}
                </div>
              )}

              <button
                onClick={uploadPaymentProof}
                disabled={uploading || !paymentFile}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Uploading Payment Proof...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Payment Proof
                  </>
                )}
              </button>

              {!paymentFile && (
                <p className="text-xs text-gray-500 text-center">
                  Please select a payment receipt file to upload
                </p>
              )}
            </div>
          </div>

        {/* Status Messages */}
        {transaction.status === 'CONFIRMED' && (
          <div className="card p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Payment Confirmed</h3>
                <p className="text-sm">Your ticket has been confirmed. You'll receive an email shortly.</p>
              </div>
            </div>
          </div>
        )}

        {transaction.status === 'REJECTED' && (
          <div className="card p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Payment Rejected</h3>
                <p className="text-sm">Please upload a valid payment proof or contact support.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
