export interface Event {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  imageUrl?: string;
  organizerId: string;
  availableSeats: number;
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  averageRating?: number;
  totalReviews?: number;
  totalBookings?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ORGANIZER";
  referralCode: string;
  pointsBalance: number;
  profilePicture?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
