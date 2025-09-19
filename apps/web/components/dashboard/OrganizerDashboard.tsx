import React, { useState } from 'react';
import { Plus, Calendar, Users, TrendingUp, DollarSign, Star, MapPin, Clock, Eye, Edit, Trash2, Filter, Search, MoreHorizontal, CheckCircle, XCircle, AlertCircle, Download, BarChart3, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface Event {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  status: 'published' | 'draft' | 'cancelled';
  registrations: number;
  revenue: number;
  rating: number;
  reviews: number;
  imageUrl: string;
}

interface Transaction {
  id: string;
  eventName: string;
  customerName: string;
  email: string;
  ticketCount: number;
  totalAmount: number;
  status: 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'WAITING_PAYMENT' | 'REJECTED' | 'EXPIRED';
  paymentProof: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface RevenueData {
  month: string;
  revenue: number;
  events: number;
}

interface CategoryData {
  name: string;
  value: number;
  revenue: number;
  [key: string]: string | number;
}

interface RegistrationTrend {
  date: string;
  registrations: number;
  target: number;
}

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'transactions' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Mock data
  const [events] = useState<Event[]>([
    {
      id: '1',
      name: 'Jakarta Developer Summit 2025',
      category: 'Technology',
      startDate: '2025-03-15',
      endDate: '2025-03-17',
      location: 'Jakarta Convention Center',
      totalSeats: 1000,
      availableSeats: 450,
      price: 500000,
      status: 'published',
      registrations: 550,
      revenue: 275000000,
      rating: 4.8,
      reviews: 23,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
    },
    {
      id: '2',
      name: 'UI/UX Design Workshop',
      category: 'Education',
      startDate: '2025-02-20',
      endDate: '2025-02-20',
      location: 'Design Hub Jakarta',
      totalSeats: 50,
      availableSeats: 12,
      price: 250000,
      status: 'published',
      registrations: 38,
      revenue: 9500000,
      rating: 4.9,
      reviews: 15,
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400'
    },
    {
      id: '3',
      name: 'Startup Networking Night',
      category: 'Business',
      startDate: '2025-04-10',
      endDate: '2025-04-10',
      location: 'SCBD Jakarta',
      totalSeats: 200,
      availableSeats: 200,
      price: 0,
      status: 'draft',
      registrations: 0,
      revenue: 0,
      rating: 0,
      reviews: 0,
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      eventName: 'Jakarta Developer Summit 2025',
      customerName: 'Alice Johnson',
      email: 'alice@example.com',
      ticketCount: 2,
      totalAmount: 1000000,
      status: 'WAITING_CONFIRMATION',
      paymentProof: 'proof_1.jpg',
      createdAt: '2025-01-18',
      expiresAt: '2025-01-21'
    },
    {
      id: '2',
      eventName: 'UI/UX Design Workshop',
      customerName: 'Bob Smith',
      email: 'bob@example.com',
      ticketCount: 1,
      totalAmount: 250000,
      status: 'CONFIRMED',
      paymentProof: 'proof_2.jpg',
      createdAt: '2025-01-17',
      expiresAt: null
    },
    {
      id: '3',
      eventName: 'Jakarta Developer Summit 2025',
      customerName: 'Carol Wilson',
      email: 'carol@example.com',
      ticketCount: 1,
      totalAmount: 500000,
      status: 'WAITING_PAYMENT',
      paymentProof: null,
      createdAt: '2025-01-19',
      expiresAt: '2025-01-19T14:30:00'
    }
  ]);

  // Sample data for charts
  const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 85000000, events: 2 },
    { month: 'Feb', revenue: 120000000, events: 3 },
    { month: 'Mar', revenue: 95000000, events: 2 },
    { month: 'Apr', revenue: 180000000, events: 4 },
    { month: 'May', revenue: 150000000, events: 3 },
    { month: 'Jun', revenue: 220000000, events: 5 }
  ];

  const categoryData: CategoryData[] = [
    { name: 'Technology', value: 45, revenue: 275000000 },
    { name: 'Education', value: 25, revenue: 125000000 },
    { name: 'Business', value: 20, revenue: 95000000 },
    { name: 'Others', value: 10, revenue: 45000000 }
  ];

  const registrationTrends: RegistrationTrend[] = [
    { date: 'Week 1', registrations: 45, target: 50 },
    { date: 'Week 2', registrations: 78, target: 70 },
    { date: 'Week 3', registrations: 65, target: 60 },
    { date: 'Week 4', registrations: 95, target: 80 },
    { date: 'Week 5', registrations: 120, target: 100 },
    { date: 'Week 6', registrations: 85, target: 90 }
  ];

  const stats = {
    totalEvents: events.length,
    totalRegistrations: events.reduce((sum, event) => sum + event.registrations, 0),
    totalRevenue: events.reduce((sum, event) => sum + event.revenue, 0),
    avgRating: events.filter(e => e.rating > 0).reduce((sum, event) => sum + event.rating, 0) / events.filter(e => e.rating > 0).length || 0
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'status-available';
      case 'draft': return 'status-limited';
      case 'cancelled': return 'status-sold-out';
      default: return 'chip';
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'status-available';
      case 'WAITING_CONFIRMATION': return 'status-limited';
      case 'WAITING_PAYMENT': return 'status-limited';
      case 'REJECTED': return 'status-sold-out';
      case 'EXPIRED': return 'status-sold-out';
      default: return 'chip';
    }
  };

  const handleTransactionAction = (transactionId: string, action: string) => {
    console.log(`${action} transaction ${transactionId}`);
    // Here you would call your API to update transaction status
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log(`Delete event ${eventId}`);
    setShowDeleteConfirm(null);
    // Here you would call your API to delete the event
  };

  // Overview Tab with Charts
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Total Events</h3>
            <Calendar className="w-5 h-5 text-sky" />
          </div>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted">+2 this month</p>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Total Registrations</h3>
            <Users className="w-5 h-5 text-mint" />
          </div>
          <div className="text-2xl font-bold">{stats.totalRegistrations.toLocaleString()}</div>
          <p className="text-xs text-muted">+15% vs last month</p>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-banana" />
          </div>
          <div className="text-2xl font-bold">IDR {stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted">+22% vs last month</p>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted">Average Rating</h3>
            <Star className="w-5 h-5 text-rose" />
          </div>
          <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
          <p className="text-xs text-muted">Excellent performance</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky" />
            Revenue Trend (6 Months)
          </h3>
          <div className="h-80">
            <LineChart width={400} height={300} data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
              <YAxis 
                stroke="var(--muted)" 
                fontSize={12}
                tickFormatter={(value: number) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--line)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`IDR ${value.toLocaleString()}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--sky)" 
                strokeWidth={3}
                dot={{ fill: 'var(--sky)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--sky)', strokeWidth: 2 }}
              />
            </LineChart>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-mint" />
            Events by Category
          </h3>
          <div className="h-80 flex items-center">
            <RechartsPieChart width={400} height={300}>
              <Pie
                data={categoryData}
                cx={200}
                cy={150}
                outerRadius={80}
                fill="var(--mint)"
                dataKey="value"
                label={(props) => `${props.name} ${props.value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? 'var(--sky)' : index === 1 ? 'var(--mint)' : index === 2 ? 'var(--banana)' : 'var(--rose)'}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--line)',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [
                  `${value}% (IDR ${categoryData.find(d => d.value === value)?.revenue.toLocaleString()})`, 
                  'Share'
                ]}
              />
            </RechartsPieChart>
          </div>
        </div>
      </div>

      {/* Registration Performance */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-mint" />
          Registration Performance vs Targets
        </h3>
        <div className="h-80">
          <BarChart width={800} height={300} data={registrationTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--line)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="target" fill="var(--line)" name="Target" />
            <Bar dataKey="registrations" fill="var(--mint)" name="Actual" />
          </BarChart>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create New Event
          </button>
          <button className="btn btn-ghost">
            <BarChart3 className="w-4 h-4" />
            Detailed Analytics
          </button>
          <button className="btn btn-ghost">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="btn btn-ghost">
            <Users className="w-4 h-4" />
            View Attendees
          </button>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Events Performance</h3>
        <div className="space-y-4">
          {events.slice(0, 3).map(event => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-mint-tint rounded-lg hover-lift">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-sky to-mint rounded-lg overflow-hidden">
                  <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium">{event.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>{event.registrations}/{event.totalSeats} seats</span>
                    <span>IDR {event.revenue.toLocaleString()}</span>
                    {event.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-banana fill-current" />
                        <span>{event.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round((event.registrations / event.totalSeats) * 100)}% filled
                  </div>
                  <div className="w-24 h-2 bg-line rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-mint transition-all"
                      style={{ width: `${(event.registrations / event.totalSeats) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className={`chip ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Events Tab
  const EventsContent = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-sky focus:border-sky bg-surface"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-sky focus:border-sky bg-surface"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="card overflow-hidden hover-lift">
            <div className="h-48 bg-gradient-to-br from-sky to-mint relative overflow-hidden">
              <img 
                src={event.imageUrl} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`chip ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="chip chip-sky text-xs">{event.category}</span>
                {event.rating > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Star className="w-3 h-3 text-banana fill-current" />
                    {event.rating} ({event.reviews})
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold mb-2 line-clamp-2">{event.name}</h3>
              
              <div className="space-y-1 text-sm text-muted mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {event.registrations}/{event.totalSeats} registered
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold">
                    {event.price === 0 ? 'Free' : `IDR ${event.price.toLocaleString()}`}
                  </span>
                  <div className="text-xs text-muted">
                    Revenue: IDR {event.revenue.toLocaleString()}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-mint-tint rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-muted" />
                  </button>
                  <button className="p-2 hover:bg-sky-tint rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-muted" />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(event.id)}
                    className="p-2 hover:bg-rose-tint rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-mint-tint rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-mint" />
          </div>
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-muted mb-4">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first event to get started'
            }
          </p>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      )}
    </div>
  );

  // Transactions Tab
  const TransactionsContent = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b hairline text-left">
                <th className="pb-3 text-sm font-medium text-muted">Customer</th>
                <th className="pb-3 text-sm font-medium text-muted">Event</th>
                <th className="pb-3 text-sm font-medium text-muted">Amount</th>
                <th className="pb-3 text-sm font-medium text-muted">Status</th>
                <th className="pb-3 text-sm font-medium text-muted">Date</th>
                <th className="pb-3 text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-mint-tint transition-colors">
                  <td className="py-4">
                    <div>
                      <div className="font-medium">{transaction.customerName}</div>
                      <div className="text-sm text-muted">{transaction.email}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium">{transaction.eventName}</div>
                    <div className="text-sm text-muted">{transaction.ticketCount} tickets</div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium">IDR {transaction.totalAmount.toLocaleString()}</div>
                  </td>
                  <td className="py-4">
                    <span className={`chip ${getTransactionStatusColor(transaction.status)}`}>
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-muted">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                    {transaction.expiresAt && (
                      <div className="text-xs text-rose">
                        Expires: {new Date(transaction.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      {transaction.status === 'WAITING_CONFIRMATION' && (
                        <>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'approve')}
                            className="p-2 hover:bg-mint-tint rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 text-mint" />
                          </button>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'reject')}
                            className="p-2 hover:bg-rose-tint rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-rose" />
                          </button>
                        </>
                      )}
                      {transaction.paymentProof && (
                        <button
                          onClick={() => window.open(`/proofs/${transaction.paymentProof}`, '_blank')}
                          className="p-2 hover:bg-sky-tint rounded-lg transition-colors"
                          title="View Payment Proof"
                        >
                          <Eye className="w-4 h-4 text-sky" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Analytics Tab
  const AnalyticsContent = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue Overview
          </h3>
          <div className="h-64 bg-gradient-accent rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-muted mx-auto mb-2" />
              <p className="text-muted">Chart visualization would go here</p>
              <p className="text-xs text-muted">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        {/* Event Performance */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Event Performance
          </h3>
          <div className="space-y-4">
            {events.filter(e => e.registrations > 0).map(event => (
              <div key={event.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{event.name}</div>
                  <div className="text-xs text-muted">
                    {event.registrations}/{event.totalSeats} seats filled
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-line rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-mint transition-all"
                      style={{ width: `${(event.registrations / event.totalSeats) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round((event.registrations / event.totalSeats) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-3">Top Performing Events</h4>
            <div className="space-y-2">
              {events
                .sort((a, b) => b.registrations - a.registrations)
                .slice(0, 3)
                .map((event, index) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-mint rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{event.name}</div>
                      <div className="text-xs text-muted">{event.registrations} registrations</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Revenue by Category</h4>
            <div className="space-y-2">
              {Object.entries(
                events.reduce((acc: Record<string, number>, event) => {
                  acc[event.category] = (acc[event.category] || 0) + event.revenue;
                  return acc;
                }, {})
              )
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([category, revenue]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-sm">{category}</span>
                    <span className="text-sm font-medium">IDR {(revenue as number).toLocaleString()}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Customer Satisfaction</h4>
            <div className="space-y-2">
              {events
                .filter(e => e.rating > 0)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3)
                .map(event => (
                  <div key={event.id} className="flex justify-between items-center">
                    <span className="text-sm truncate flex-1">{event.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-banana fill-current" />
                      <span className="text-sm font-medium">{event.rating}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'transactions', name: 'Transactions', icon: DollarSign },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ] as const;

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Organizer Dashboard</h1>
          <p className="text-muted">Manage your events and track your success</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b hairline">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-sky text-ink'
                        : 'border-transparent text-muted hover:text-ink hover:border-mint'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'events' && <EventsContent />}
          {activeTab === 'transactions' && <TransactionsContent />}
          {activeTab === 'analytics' && <AnalyticsContent />}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-tint rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-rose" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Event</h3>
                <p className="text-muted mb-6">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(showDeleteConfirm)}
                    className="btn bg-rose text-white hover:bg-rose/90"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;