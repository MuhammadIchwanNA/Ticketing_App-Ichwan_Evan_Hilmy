import { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, PieChart, Star, Users } from "lucide-react";
import RegistrationTrendsChart from "./RegistrationsChart";
import { Pie, Tooltip, Cell, PieChart as RechartsPieChart } from "recharts";
import { apiClient } from "../../lib/api";

interface Event {
  id: string;
  name: string;
  imageUrl: string;
  totalSeats: number;
  totalRevenue: number;
  totalBookings: number;
  averageRating: number;
  category: string;
}

interface CategoryData {
  name: string;
  value: number;
  revenue: number;
  [key: string]: string | number;
}

export const OverviewContent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const categoryData: CategoryData[] = useMemo(() => {
  if (!events.length) return [];

  // Group events by category
  const totals: Record<string, { count: number; revenue: number }> = {};

  events.forEach((e) => {
    if (!totals[e.category]) {
      totals[e.category] = { count: 0, revenue: 0 };
    }
    totals[e.category].count += 1;
    totals[e.category].revenue += e.totalRevenue ?? 0;
  });

  const totalCount = events.length;

  return Object.entries(totals).map(([name, data]) => ({
    name,
    value: Math.round((data.count / totalCount) * 100), // percentage
    revenue: data.revenue,
  }));
  }, [events]);

  const reviewedEvents = events.filter((e) => e.averageRating > 0);

  const stats = {
    totalEvents: events.length,
    totalRegistrations: events.reduce(
      (sum, e) => sum + (e.totalBookings ?? 0),
      0
    ),
    totalRevenue: events.reduce((sum, e) => sum + (e.totalRevenue ?? 0), 0),
    avgRating:
      reviewedEvents.length > 0
        ? reviewedEvents.reduce((sum, e) => sum + (e.averageRating ?? 0), 0) /
          reviewedEvents.length
        : 0,
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const json = await apiClient.get("/api/events/organizer/my-events");
        setEvents(Array.isArray(json.events) ? json.events : []);
      } catch (err) {
        console.error('Error fetching organizer events:', err);
        setError("Could not load data. Please try again.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading events...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-red-500">
            <p>Please make sure you are:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Logged in as an organizer</li>
              <li>Connected to the internet</li>
              <li>Have proper permissions</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
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
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? "pink"
                        : index === 1
                        ? "#ADD8E6"
                        : index === 2
                        ? "#FFCCCB"
                        : "#90EE90"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  `${name}`,
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
                      {event.totalBookings}/{event.totalSeats} seats
                    </span>
                    <span>IDR {event.totalRevenue.toLocaleString()}</span>
                    {event.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-banana fill-current" />
                        <span>{event.averageRating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round((event.totalBookings / event.totalSeats) * 100)}%
                    filled
                  </div>
                  <div className="w-24 h-2 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mint transition-all"
                      style={{
                        width: `${
                          (event.totalBookings / event.totalSeats) * 100
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
};
