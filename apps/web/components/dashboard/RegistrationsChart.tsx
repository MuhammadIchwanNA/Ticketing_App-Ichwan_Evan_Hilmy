"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type RegistrationTrend = {
  date: string;
  registrations: number;
};

export default function RegistrationTrendsChart() {
  const [range, setRange] = useState<"day" | "week" | "year">("week");
  const [data, setData] = useState<RegistrationTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats whenever range changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/stats/events?range=${range}`);
        const json = await res.data;
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error(err);
        setError("Could not load data.");
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [range]);

return (
    <Card className="shadow-sm rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Registration Trends
        </CardTitle>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">View by:</label>
          <Select
            value={range}
            onValueChange={(val: "day" | "week" | "year") => setRange(val)}
          >
            <SelectTrigger className="w-[120px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data.length === 0 ? (
            <p className="text-muted-foreground">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white", // solid background
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    color: "black", // force readable text
                    fontSize: "13px",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.05)" }} // light highlight
                />
                <Bar
                  dataKey="registrations"
                  fill="#4CAF50" // green bars, high contrast
                  name="Registrations"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}