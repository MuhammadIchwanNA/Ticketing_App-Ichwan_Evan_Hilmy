"use client";
import { useRouter } from "next/navigation";
import EditModal from "./EditModal";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  Calendar,
  Edit,
  MapPin,
  Plus,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import api from "../../lib/axios"; // 👈 make sure this points to your axios instance

export const EventsContent = () => {
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events/organizer/my-events");
        setEvents(res.data.events);
      } catch (err: any) {
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Open modal with event data
  const handleEditClick = (event: any) => {
    setFormData(event); // prefill form
    setShowEditModal(event.id); // open modal for this event
  };
const handleDeleteEvent = async (eventId: string) => {
  try {
    await api.delete(`/events/${eventId}`);
    // Remove deleted event from state
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  } catch (err) {
    console.error("Failed to delete event:", err);
  } finally {
    setShowDeleteConfirm(null);
  }
};

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
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
                {event.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-xs ">
                    <Star className="w-3 h-3 text-banana fill-current" />
                    {event.averageRating} ({event.totalReviews})
                  </div>
                )}
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2">{event.name}</h3>

              <div className="space-y-1 text-sm mb-4">
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
                  {event.totalBookings}/{event.totalSeats} registered
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
                    Revenue: IDR {event.totalRevenue.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(event);
                    }}
                    className="p-2 hover:bg-sky-tint rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 " />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(event.id);
                    }}
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
  );
};
