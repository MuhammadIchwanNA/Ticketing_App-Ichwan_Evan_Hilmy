"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import api from "../../lib/axios"; // your axios/fetch wrapper
import { Star } from "lucide-react";

type UnreviewedEvent = {
  eventId: string;
  name: string;
  description: string;
  endDate: string;
  totalAmount: number;
};

export default function Review() {
  const [events, setEvents] = useState<UnreviewedEvent[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await api.get("/reviews");
        console.log(res.data);

        setEvents(res.data.events || []);
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
      await api.post("/reviews/add-review", {
        eventId,
        rating: ratings[eventId],
        comment: comments[eventId] || "",
      });

      // Remove event after submitting review
      setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
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
          <Card key={event.eventId} className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
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
                      ratings[event.eventId] >= num
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400"
                    }`}
                    onClick={() => handleRating(event.eventId, num)}
                  />
                ))}
              </div>

              {/* Comment box */}
              <Textarea
                placeholder="Write a comment..."
                value={comments[event.eventId] || ""}
                onChange={(e) =>
                  setComments((prev) => ({
                    ...prev,
                    [event.eventId]: e.target.value,
                  }))
                }
                className="mb-3"
              />

              {/* Submit button */}
              <button
                onClick={() => handleSubmit(event.eventId)}
                disabled={loading || !ratings[event.eventId]}
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
