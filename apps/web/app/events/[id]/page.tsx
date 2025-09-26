'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar, MapPin, Users, Clock, Star, Share2, 
  Heart, Bookmark, ArrowLeft, ExternalLink,
  Facebook, Twitter, Instagram, Copy, Check
} from 'lucide-react';
import { Event } from '@/types';
import { eventAPI } from '@/lib/api';

interface EventDetails extends Event {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    user: {
      name: string;
      profilePicture?: string;
    };
    createdAt: string;
  }>;
  vouchers: Array<{
    id: string;
    code: string;
    discount: number;
    discountType: 'PERCENTAGE' | 'FIXED';
  }>;
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEvent(eventId);
      setEvent(response.event);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      maximumFractionDigits: 0 
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getAvailabilityStatus = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return { text: 'Available', class: 'status-available' };
    if (ratio > 0.2) return { text: 'Limited', class: 'status-limited' };
    return { text: 'Almost Sold Out', class: 'status-sold-out' };
  };

  const shareEvent = async (platform?: string) => {
    const url = window.location.href;
    const text = `Check out this event: ${event?.name}`;
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
    };

    if (platform && shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement actual bookmark API call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-24 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted mb-6">{error || 'This event may have been removed or is not available.'}</p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);
  const availability = getAvailabilityStatus(event.availableSeats, event.totalSeats);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b hairline">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={() => window.history.back()}
            className="btn btn-ghost text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative aspect-[5/3] rounded-xl overflow-hidden mb-8">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-tint to-mint-tint flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <Calendar className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p>Event Image</p>
                  </div>
                </div>
              )}
              
              {/* Action buttons overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg backdrop-blur-sm border ${
                    isBookmarked 
                      ? 'bg-rose-500 text-white border-rose-500' 
                      : 'bg-white/90 text-gray-700 border-white/20'
                  }`}
                >
                  {isBookmarked ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-lg bg-white/90 backdrop-blur-sm text-gray-700 border border-white/20"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Event Info */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="chip">{event.category}</span>
                <span className={`text-xs px-3 py-1 rounded-full ${availability.class}`}>
                  {availability.text}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{event.name}</h1>

              {/* Quick Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="font-medium">{startDate.day}</p>
                      <p className="text-sm text-muted">{startDate.date} at {startDate.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-mint-500" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-rose-500" />
                    <div>
                      <p className="font-medium">{event.availableSeats} seats available</p>
                      <p className="text-sm text-muted">of {event.totalSeats} total</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">
                        {event.averageRating?.toFixed(1) || 'New'} 
                        {event.totalReviews ? ` (${event.totalReviews} reviews)` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
                <div className="prose max-w-none">
                  <p className="text-muted leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Organizer */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">Organized by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-mint-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {event.organizer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer.name}</p>
                    <p className="text-sm text-muted">Event Organizer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vouchers */}
            {event.vouchers && event.vouchers.length > 0 && (
              <div className="card p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">Available Discounts</h3>
                <div className="space-y-3">
                  {event.vouchers.map((voucher) => (
                    <div key={voucher.id} className="flex items-center justify-between p-4 bg-banana-tint rounded-lg">
                      <div>
                        <p className="font-semibold text-lg">{voucher.code}</p>
                        <p className="text-sm text-muted">
                          {voucher.discount}
                          {voucher.discountType === 'PERCENTAGE' ? '% off' : ' IDR off'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(voucher.code);
                          // Show toast notification
                        }}
                        className="btn btn-ghost text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {event.reviews && event.reviews.length > 0 && (
              <div className="card p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">
                  Reviews ({event.reviews.length})
                </h3>
                <div className="space-y-6">
                  {event.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-mint-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{review.user.name}</p>
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted text-sm mb-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        {review.comment && (
                          <p className="text-sm">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="card p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold">{formatPrice(event.price)}</p>
                  <p className="text-muted">per ticket</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="text-sm">
                    <p className="font-medium mb-1">Event Duration</p>
                    <p className="text-muted">
                      {startDate.date} - {endDate.date}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium mb-1">Available Tickets</p>
                    <p className="text-muted">{event.availableSeats} remaining</p>
                  </div>
                </div>

                <button
                  disabled={event.availableSeats === 0}
                  className="w-full btn btn-primary mb-4 disabled:opacity-50"
                >
                  {event.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full btn btn-ghost"
                >
                  <Share2 className="w-4 h-4" />
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Event</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Twitter className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => shareEvent('facebook')}
                className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg border"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                Share on Facebook
              </button>

              <button
                onClick={() => shareEvent('twitter')}
                className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg border"
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                Share on Twitter
              </button>

              <button
                onClick={() => shareEvent('whatsapp')}
                className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg border"
              >
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Share on WhatsApp
              </button>

              <button
                onClick={() => shareEvent('copy')}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-gray-600" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}