"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Event type
type Event = {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: Date;
  endDate: Date;
  availableSeats: number;
  totalSeats: number;
  location: string;
  category: string;
  imageUrl: string | null;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Attendee type
type Attendee = {
  attendeeId: number;
  name: string;
  email: string;
  ticketCount: number;
  totalPaid: number;
  confirmedAt: Date;
};

export default function EventAttendeesPage() {
  const { eventId } = useParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    // Dummy event data
    const dummyEvent: Event = {
      id: String(eventId),
      name: "Tech Conference 2025",
      description: "A conference about the latest in technology.",
      price: 250000,
      startDate: new Date("2025-10-15T09:00"),
      endDate: new Date("2025-10-15T17:00"),
      availableSeats: 50,
      totalSeats: 100,
      location: "Jakarta Convention Center",
      category: "Technology",
      imageUrl: "https://picsum.photos/600/300",
      organizerId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Dummy attendees
    const dummyAttendees: Attendee[] = [
      {
        attendeeId: 1,
        name: "John Doe",
        email: "john@example.com",
        ticketCount: 2,
        totalPaid: 500000,
        confirmedAt: new Date("2025-09-20T10:00"),
      },
      {
        attendeeId: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        ticketCount: 1,
        totalPaid: 250000,
        confirmedAt: new Date("2025-09-22T14:30"),
      },
    ];

    setEvent(dummyEvent);
    setAttendees(dummyAttendees);
  }, [eventId]);

  if (!event) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Event Details */}
      <div className="card p-6">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-60 object-cover rounded-lg mb-4"
          />
        )}
        <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
        <p className="text-muted mb-4">{event.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-semibold">Category:</span> {event.category}
          </p>
          <p>
            <span className="font-semibold">Location:</span> {event.location}
          </p>
          <p>
            <span className="font-semibold">Price:</span> Rp{" "}
            {event.price.toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Seats:</span>{" "}
            {event.totalSeats - event.availableSeats}/{event.totalSeats}
          </p>
          <p>
            <span className="font-semibold">Start:</span>{" "}
            {new Date(event.startDate).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">End:</span>{" "}
            {new Date(event.endDate).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Attendees List */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">Attendees</h3>

        {attendees.length === 0 ? (
          <p className="text-muted">No attendees yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Tickets</th>
                  <th className="p-2">Total Paid</th>
                  <th className="p-2">Confirmed At</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a, idx) => (
                  <tr key={a.attendeeId} className="border-t">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.email}</td>
                    <td className="p-2">{a.ticketCount}</td>
                    <td className="p-2">Rp {a.totalPaid.toLocaleString()}</td>
                    <td className="p-2">
                      {new Date(a.confirmedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
