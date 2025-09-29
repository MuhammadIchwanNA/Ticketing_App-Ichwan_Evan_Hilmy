'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, Users, Filter, ChevronRight } from 'lucide-react';
import TransactionStatus from './TransactionStatus';

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
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please login to view transactions');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'ALL' && { status: statusFilter })
      });

      const response = await fetch(`/api/transactions/my-transactions?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data: TransactionsResponse = await response.json();
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError('Failed to load transactions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Waiting Payment',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'WAITING_CONFIRMATION':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Pending',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'CONFIRMED':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Confirmed',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'EXPIRED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Expired',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      case 'CANCELED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Canceled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (selectedTransaction) {
    return (
      <TransactionStatus
        transactionId={selectedTransaction}
        onBack={() => setSelectedTransaction(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">My Transactions</h1>
          <p className="text-muted">Track your ticket purchases and payment status</p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Filter by Status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'EXPIRED'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions Grid */}
        {transactions.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
            <p className="text-muted mb-6">
              {statusFilter === 'ALL' 
                ? "You haven't booked any events yet. Start exploring events!"
                : `No transactions with status: ${statusFilter.replace('_', ' ')}`
              }
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {transactions.map((transaction) => {
                const statusConfig = getStatusConfig(transaction.status);
                return (
                  <div
                    key={transaction.id}
                    className="card p-6 hover-lift cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{transaction.event.name}</h3>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.text}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted mb-4">
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

                        <div className="flex flex-wrap gap-4 text-xs text-muted">
                          <span>Transaction ID: {transaction.id.slice(0, 8)}...</span>
                          <span>Created: {new Date(transaction.createdAt).toLocaleDateString()}</span>
                          {transaction.expiresAt && transaction.status === 'WAITING_PAYMENT' && (
                            <span className="text-yellow-600 font-medium">
                              Expires: {new Date(transaction.expiresAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="text-xl font-bold mb-1">
                          IDR {transaction.totalAmount.toLocaleString()}
                        </div>
                        {transaction.pointsUsed > 0 && (
                          <div className="text-xs text-blue-600">
                            {transaction.pointsUsed} points used
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 text-gray-400 ml-auto mt-2" />
                      </div>
                    </div>

                    {/* Action hint */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted">
                          {transaction.status === 'WAITING_PAYMENT' && 'Upload payment proof to continue'}
                          {transaction.status === 'WAITING_CONFIRMATION' && 'Waiting for organizer confirmation'}
                          {transaction.status === 'CONFIRMED' && 'Ready to attend! Show this at the venue'}
                          {transaction.status === 'REJECTED' && 'Payment rejected. Contact organizer for assistance'}
                          {transaction.status === 'EXPIRED' && 'Payment window expired'}
                          {transaction.status === 'CANCELED' && 'Transaction was canceled'}
                        </span>
                        <span className="text-blue-600 font-medium">View Details →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionList;