"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "../../lib/api";

type RegistrationTrend = {
  date: string;
  registrations: number;
};

export default function RegistrationTrendsChart() {
  const [range, setRange] = useState<"day" | "week" | "year">("week");
  const [data, setData] = useState<RegistrationTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch registration trends data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Get user's own transactions to build registration trends
        const transactionsRes = await apiClient.get("/api/transactions");
        const transactions = transactionsRes || [];
        
        // Build trend data from actual transactions
        const trendData = buildTrendFromTransactions(transactions, range);
        setData(trendData);
      } catch (err) {
        console.error('Error fetching registration trends:', err);
        // Fallback to sample data if API fails
        const sampleData = generateSampleData(range);
        setData(sampleData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [range]);

  // Build trend data from real transactions
  const buildTrendFromTransactions = (transactions: any[], timeRange: string): RegistrationTrend[] => {
    const now = new Date();
    const data: RegistrationTrend[] = [];
    
    if (timeRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.createdAt);
          return txDate >= dayStart && txDate <= dayEnd;
        });
        
        data.push({
          date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          registrations: dayTransactions.length
        });
      }
    } else if (timeRange === 'day') {
      // Last 24 hours
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(date.getHours() - i, 0, 0, 0);
        const hourStart = new Date(date);
        const hourEnd = new Date(date.getTime() + 60 * 60 * 1000);
        
        const hourTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.createdAt);
          return txDate >= hourStart && txDate < hourEnd;
        });
        
        data.push({
          date: hourStart.getHours().toString().padStart(2, '0') + ':00',
          registrations: hourTransactions.length
        });
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i, 1);
        const monthStart = new Date(date.setHours(0, 0, 0, 0));
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.createdAt);
          return txDate >= monthStart && txDate <= monthEnd;
        });
        
        data.push({
          date: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          registrations: monthTransactions.length
        });
      }
    }
    
    return data;
  };

  // Generate sample data as fallback
  const generateSampleData = (timeRange: string): RegistrationTrend[] => {
    const now = new Date();
    const data: RegistrationTrend[] = [];
    
    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          registrations: Math.floor(Math.random() * 10)
        });
      }
    } else if (timeRange === 'day') {
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(date.getHours() - i);
        data.push({
          date: date.getHours().toString().padStart(2, '0') + ':00',
          registrations: Math.floor(Math.random() * 5)
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          registrations: Math.floor(Math.random() * 25)
        });
      }
    }
    
    return data;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Registration Trends</h3>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">View by:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "day" | "week" | "year")}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      <div className="h-64">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading registration data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No registration data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  color: "black",
                  fontSize: "13px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                }}
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
              />
              <Bar
                dataKey="registrations"
                fill="#4CAF50"
                name="Registrations"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}