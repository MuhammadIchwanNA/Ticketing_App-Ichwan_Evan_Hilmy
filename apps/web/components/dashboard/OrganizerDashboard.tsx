import React, { useState } from "react";
import {
  Plus,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  MapPin,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import EditModal from "./EditModal";
import { useRouter } from "next/navigation";
import RegistrationTrendsChart from "./RegistrationsChart";

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
  status: "published" | "draft" | "cancelled";
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
  status:
    | "WAITING_CONFIRMATION"
    | "CONFIRMED"
    | "WAITING_PAYMENT"
    | "REJECTED"
    | "EXPIRED";
  paymentProof: string | null;
  createdAt: string;
  expiresAt: string | null;
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
}

const OrganizerDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "events" | "transactions" | "analytics"
  >("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    startDate: "",
    endDate: "",
    totalSeats: 0,
    location: "",
    category: "",
    imageUrl: "",
  });

  const [showEditModal, setShowEditModal] = useState<string | null>(null);

  // Open modal with event data
  const handleEditClick = (event: any) => {
    setFormData(event); // prefill form
    setShowEditModal(event.id); // open modal for this event
  };

  // Mock data
  const [events] = useState<Event[]>([
    {
      id: "1",
      name: "Jakarta Developer Summit 2025",
      category: "Technology",
      startDate: "2025-03-15",
      endDate: "2025-03-17",
      location: "Jakarta Convention Center",
      totalSeats: 1000,
      availableSeats: 450,
      price: 500000,
      status: "published",
      registrations: 550,
      revenue: 275000000,
      rating: 4.8,
      reviews: 23,
      imageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    },
    {
      id: "2",
      name: "UI/UX Design Workshop",
      category: "Education",
      startDate: "2025-02-20",
      endDate: "2025-02-20",
      location: "Design Hub Jakarta",
      totalSeats: 50,
      availableSeats: 12,
      price: 250000,
      status: "published",
      registrations: 38,
      revenue: 9500000,
      rating: 4.9,
      reviews: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400",
    },
    {
      id: "3",
      name: "Startup Networking Night",
      category: "Business",
      startDate: "2025-04-10",
      endDate: "2025-04-10",
      location: "SCBD Jakarta",
      totalSeats: 200,
      availableSeats: 200,
      price: 0,
      status: "draft",
      registrations: 0,
      revenue: 0,
      rating: 0,
      reviews: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      eventName: "Jakarta Developer Summit 2025",
      customerName: "Alice Johnson",
      email: "alice@example.com",
      ticketCount: 2,
      totalAmount: 1000000,
      status: "WAITING_CONFIRMATION",
      paymentProof: "proof_1.jpg",
      createdAt: "2025-01-18",
      expiresAt: "2025-01-21",
    },
    {
      id: "2",
      eventName: "UI/UX Design Workshop",
      customerName: "Bob Smith",
      email: "bob@example.com",
      ticketCount: 1,
      totalAmount: 250000,
      status: "CONFIRMED",
      paymentProof: "proof_2.jpg",
      createdAt: "2025-01-17",
      expiresAt: null,
    },
    {
      id: "3",
      eventName: "Jakarta Developer Summit 2025",
      customerName: "Carol Wilson",
      email: "carol@example.com",
      ticketCount: 1,
      totalAmount: 500000,
      status: "WAITING_PAYMENT",
      paymentProof: null,
      createdAt: "2025-01-19",
      expiresAt: "2025-01-19T14:30:00",
    },
  ]);

  const categoryData: CategoryData[] = [
    { name: "Technology", value: 45, revenue: 275000000 },
    { name: "Education", value: 25, revenue: 125000000 },
    { name: "Business", value: 20, revenue: 95000000 },
    { name: "Others", value: 10, revenue: 45000000 },
  ];

  const registrationTrends: RegistrationTrend[] = [
    { date: "Week 1", registrations: 45 },
    { date: "Week 2", registrations: 78 },
    { date: "Week 3", registrations: 65 },
  ];

  const stats = {
    totalEvents: events.length,
    totalRegistrations: events.reduce(
      (sum, event) => sum + event.registrations,
      0
    ),
    totalRevenue: events.reduce((sum, event) => sum + event.revenue, 0),
    avgRating:
      events
        .filter((e) => e.rating > 0)
        .reduce((sum, event) => sum + event.rating, 0) /
        events.filter((e) => e.rating > 0).length || 0,
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "status-available";
      case "WAITING_CONFIRMATION":
        return "status-limited";
      case "WAITING_PAYMENT":
        return "status-limited";
      case "REJECTED":
        return "status-sold-out";
      case "EXPIRED":
        return "status-sold-out";
      default:
        return "chip";
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

  const handleEditModal = (eventId: string) => {
    console.log(`Edit event ${eventId}`);
    setShowDeleteConfirm(null);
    // Here you would call your API to edit the event
  };

  // Overview Tab with Charts
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Total Events</h3>
            <Calendar className="w-5 h-5 text-sky" />
          </div>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium ">Total Registrations</h3>
            <Users className="w-5 h-5 text-mint" />
          </div>
          <div className="text-2xl font-bold">
            {stats.totalRegistrations.toLocaleString()}
          </div>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium ">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-banana" />
          </div>
          <div className="text-2xl font-bold">
            IDR {stats.totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium ">Average Rating</h3>
            <Star className="w-5 h-5 text-rose" />
          </div>
          <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registration Performance */}
        <RegistrationTrendsChart />

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
                    fill={
                      index === 0
                        ? "var(--sky)"
                        : index === 1
                        ? "var(--mint)"
                        : index === 2
                        ? "var(--banana)"
                        : "var(--rose)"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `${value}% (IDR ${categoryData
                    .find((d) => d.value === value)
                    ?.revenue.toLocaleString()})`,
                  "Share",
                ]}
              />
            </RechartsPieChart>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">
          Recent Events Performance
        </h3>
        <div className="space-y-4">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 bg-mint-tint rounded-lg hover-lift"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-sky to-mint rounded-lg overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{event.name}</h4>
                  <div className="flex items-center gap-4 text-sm ">
                    <span>
                      {event.registrations}/{event.totalSeats} seats
                    </span>
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
                    {Math.round((event.registrations / event.totalSeats) * 100)}
                    % filled
                  </div>
                  <div className="w-24 h-2 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mint transition-all"
                      style={{
                        width: `${
                          (event.registrations / event.totalSeats) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
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
      <div className="gap-4">
        <button
          onClick={() => router.push("/dashboard/events/create")}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            onClick={() => router.push(`/dashboard/attendees/${event.id}`)}
            key={event.id}
            className="card overflow-hidden hover-lift"
          >
            <div className="h-48 bg-gradient-to-br from-sky to-mint relative overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3"></div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="chip chip-sky text-xs">{event.category}</span>
                {event.rating > 0 && (
                  <div className="flex items-center gap-1 text-xs ">
                    <Star className="w-3 h-3 text-banana fill-current" />
                    {event.rating} ({event.reviews})
                  </div>
                )}
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2">{event.name}</h3>

              <div className="space-y-1 text-sm  mb-4">
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
                    {event.price === 0
                      ? "Free"
                      : `IDR ${event.price.toLocaleString()}`}
                  </span>
                  <div className="text-xs ">
                    Revenue: IDR {event.revenue.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditClick(event)}
                    className="p-2 hover:bg-sky-tint rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 " />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(event.id)}
                    className="p-2 hover:bg-rose-tint rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 " />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-mint-tint rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-mint" />
          </div>
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <button
            onClick={() => router.push("/dashboard/events/create")}
            className="btn btn-primary"
          >
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
                <th className="pb-3 text-sm font-medium ">Customer</th>
                <th className="pb-3 text-sm font-medium ">Event</th>
                <th className="pb-3 text-sm font-medium ">Amount</th>
                <th className="pb-3 text-sm font-medium ">Status</th>
                <th className="pb-3 text-sm font-medium ">Date</th>
                <th className="pb-3 text-sm font-medium ">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-mint-tint transition-colors"
                >
                  <td className="py-4">
                    <div>
                      <div className="font-medium">
                        {transaction.customerName}
                      </div>
                      <div className="text-sm ">{transaction.email}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium">{transaction.eventName}</div>
                    <div className="text-sm ">
                      {transaction.ticketCount} tickets
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium">
                      IDR {transaction.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`chip ${getTransactionStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 text-sm ">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                    {transaction.expiresAt && (
                      <div className="text-xs text-rose">
                        Expires:{" "}
                        {new Date(transaction.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      {transaction.status === "WAITING_CONFIRMATION" && (
                        <>
                          <button
                            onClick={() =>
                              handleTransactionAction(transaction.id, "approve")
                            }
                            className="p-2 hover:bg-mint-tint rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 text-mint" />
                          </button>
                          <button
                            onClick={() =>
                              handleTransactionAction(transaction.id, "reject")
                            }
                            className="p-2 hover:bg-rose-tint rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-rose" />
                          </button>
                        </>
                      )}
                      {transaction.paymentProof && (
                        <button
                          onClick={() =>
                            window.open(
                              `/proofs/${transaction.paymentProof}`,
                              "_blank"
                            )
                          }
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

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "events", name: "Events", icon: Calendar },
    { id: "transactions", name: "Transactions", icon: DollarSign },
  ] as const;

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Organizer Dashboard
          </h1>
          <p className="">Manage your events and track your success</p>
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
                        ? "border-sky text-ink"
                        : "border-transparent  hover:text-ink hover:border-mint"
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
          {activeTab === "overview" && <OverviewContent />}
          {activeTab === "events" && <EventsContent />}
          {activeTab === "transactions" && <TransactionsContent />}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-tint rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-rose" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Event</h3>
                <p className=" mb-6">
                  Are you sure you want to delete this event? This action cannot
                  be undone.
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
                    className="btn bg-rose hover:bg-rose/90"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <EditModal
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
};

export default OrganizerDashboard;
