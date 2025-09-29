"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "../../lib/axios";

// Review type
type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function EventReviewsPage() {
  const { eventId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${eventId}/reviews`);
        setReviews(res.data.reviews || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchReviews();
  }, [eventId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-4">Event Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{r.user.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`${
                        r.rating >= star ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {r.comment && <p className="text-gray-700">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
