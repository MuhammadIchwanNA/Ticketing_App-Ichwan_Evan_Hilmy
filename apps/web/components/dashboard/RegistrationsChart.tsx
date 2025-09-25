"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type RegistrationTrend = {
  date: string;
  registrations: number;
};

export default function RegistrationTrendsChart() {
  const [range, setRange] = useState<"day" | "week" | "year">("week");
  const [data, setData] = useState<RegistrationTrend[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch stats whenever range changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/dashboard/stats/registrations?range=${range}`
        );
        if (!res.ok) throw new Error("Failed to fetch stats");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [range]);

  return (
    <div className="space-y-4">
      {/* Range Picker */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">View by:</label>
        <Select
          value={range}
          onValueChange={(val: "day" | "week" | "year") => setRange(val)}
        >
          <SelectTrigger className="w-[120px]" />
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <div className="h-64">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="registrations"
              fill="var(--mint)"
              name="Registrations"
            />
          </BarChart>
        )}
      </div>
    </div>
  );
}
