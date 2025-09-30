import { useState, useEffect } from "react";
import { eventAPI } from "@/lib/api";
import { Event, EventsResponse } from "@/types";

export function useEvents(
  filters: {
    search?: string;
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response: EventsResponse = await eventAPI.getEvents(filters);
      setEvents(response.events);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.search, filters.category, filters.location, filters.page]);

  return { events, pagination, loading, error, refetch: fetchEvents };
}
