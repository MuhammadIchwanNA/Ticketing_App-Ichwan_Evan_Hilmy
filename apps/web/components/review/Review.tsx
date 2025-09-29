"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "../../lib/api"; // your axios/fetch wrapper
import { Star } from "lucide-react";

type UnreviewedEvent = {
  id: string;
  name: string;
  description: string;
  endDate: string;
  totalAmount?: number;
};

export default function Review() {
  const [events, setEvents] = useState<UnreviewedEvent[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await apiClient.get("/api/events");
        console.log("API Response:", res);
        
        setEvents(res.events || []);
      } catch (err) {
        console.error("Failed to fetch unreviewed events:", err);
      }
    }
    fetchEvents();
  }, []);



  const handleRating = (eventId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [eventId]: value }));
  };

  const handleSubmit = async (eventId: string) => {
    setLoading(true);
    try {
      await apiClient.post("/api/reviews", {
        eventId,
        rating: ratings[eventId],
        comment: comments[eventId] || "",
      });

      // Remove event after submitting review
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Review</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {events.map((event) => (
          <Card key={event.id} className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <p className="text-xs text-gray-500">
                Ended on {new Date(event.endDate).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              {/* Star rating */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    className={`w-6 h-6 cursor-pointer ${
                      ratings[event.id] >= num ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                    }`}
                    onClick={() => handleRating(event.id, num)}
                  />
                ))}
              </div>

              {/* Comment box */}
              <Textarea
                placeholder="Write a comment..."
                value={comments[event.id] || ""}
                onChange={(e) =>
                  setComments((prev) => ({ ...prev, [event.id]: e.target.value }))
                }
                className="mb-3"
              />

              {/* Submit button */}
              <button
                onClick={() => handleSubmit(event.id)}
                disabled={loading || !ratings[event.id]}
                className="w-full"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
