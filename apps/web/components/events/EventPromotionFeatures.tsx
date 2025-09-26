'use client';

import React, { useState } from 'react';
import { 
  Share2, Copy, Check, Download, QrCode, 
  Facebook, Twitter, Instagram, Mail, MessageCircle,
  Eye, TrendingUp, Users, Calendar
} from 'lucide-react';
import { Event } from '@/types';

interface EventPromotionProps {
  event: Event;
}

export const EventPromotionFeatures: React.FC<EventPromotionProps> = ({ event }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const eventUrl = `${window.location.origin}/events/${event.id}`;
  
  const shareTexts = {
    short: `🎉 ${event.name} - ${event.price === 0 ? 'FREE' : `IDR ${event.price.toLocaleString()}`} | ${new Date(event.startDate).toLocaleDateString()}`,
    medium: `🎉 Join me at ${event.name}!\n📅 ${new Date(event.startDate).toLocaleDateString()}\n📍 ${event.location}\n💰 ${event.price === 0 ? 'FREE EVENT' : `IDR ${event.price.toLocaleString()}`}`,
    long: `🎉 Don't miss out! ${event.name}\n\n${event.description.slice(0, 150)}...\n\n📅 ${new Date(event.startDate).toLocaleDateString()}\n📍 ${event.location}\n💰 ${event.price === 0 ? 'FREE EVENT' : `IDR ${event.price.toLocaleString()}`}\n\n🎫 Limited seats available!`
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(shareTexts.medium)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts.short)}&url=${encodeURIComponent(eventUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTexts.medium}\n\n${eventUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareTexts.short)}`,
      email: `mailto:?subject=${encodeURIComponent(`Invitation: ${event.name}`)}&body=${encodeURIComponent(`${shareTexts.long}\n\nRegister here: ${eventUrl}`)}`
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
  };

  const downloadPromotionalImage = () => {
    // Create a canvas to generate a promotional image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Event name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(event.name.slice(0, 30), 50, 150);

    // Event details
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Arial';
    ctx.fillText(`📅 ${new Date(event.startDate).toLocaleDateString()}`, 50, 250);
    ctx.fillText(`📍 ${event.location}`, 50, 300);
    ctx.fillText(`💰 ${event.price === 0 ? 'FREE' : `IDR ${event.price.toLocaleString()}`}`, 50, 350);

    // Download
    const link = document.createElement('a');
    link.download = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_promotion.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const generateQRCode = () => {
    // Simple QR code placeholder - you'd integrate with a QR library
    setShowQRCode(!showQRCode);
  };

  return (
    <div className="space-y-6">
      {/* Social Sharing */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-sky-500" />
          Share Event
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => shareToSocial('facebook')}
            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-blue-50 transition-colors"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
            <span className="text-sm">Facebook</span>
          </button>
          
          <button
            onClick={() => shareToSocial('twitter')}
            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-blue-50 transition-colors"
          >
            <Twitter className="w-5 h-5 text-blue-400" />
            <span className="text-sm">Twitter</span>
          </button>
          
          <button
            onClick={() => shareToSocial('whatsapp')}
            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">WhatsApp</span>
          </button>
          
          <button
            onClick={() => shareToSocial('email')}
            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="text-sm">Email</span>
          </button>
        </div>

        {/* Copy Link */}
        <div className="flex gap-2">
          <input
            type="text"
            value={eventUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
          />
          <button
            onClick={() => copyToClipboard(eventUrl, 'url')}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2"
          >
            {copied === 'url' ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Text Templates */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">Share Text Templates</h3>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Short Version</span>
              <button
                onClick={() => copyToClipboard(shareTexts.short, 'short')}
                className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                {copied === 'short' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'short' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-700">{shareTexts.short}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Medium Version</span>
              <button
                onClick={() => copyToClipboard(shareTexts.medium, 'medium')}
                className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                {copied === 'medium' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'medium' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{shareTexts.medium}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Long Version</span>
              <button
                onClick={() => copyToClipboard(shareTexts.long, 'long')}
                className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                {copied === 'long' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'long' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{shareTexts.long}</p>
          </div>
        </div>
      </div>

      {/* Promotional Tools */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">Promotional Tools</h3>
        
        <div className="space-y-3">
          <button
            onClick={downloadPromotionalImage}
            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <p className="font-medium">Download Promotional Image</p>
              <p className="text-sm text-gray-600">1200x630px social media ready</p>
            </div>
          </button>
          
          <button
            onClick={generateQRCode}
            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <QrCode className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <p className="font-medium">Generate QR Code</p>
              <p className="text-sm text-gray-600">For posters and print materials</p>
            </div>
          </button>
        </div>

        {showQRCode && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
            <div className="w-32 h-32 bg-white border-2 mx-auto mb-2 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">QR Code for {event.name}</p>
            <p className="text-xs text-gray-500">Integrate with a QR code library for real functionality</p>
          </div>
        )}
      </div>

      {/* Event Statistics (for organizers) */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Event Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-sky-600">
              {event.totalSeats - event.availableSeats}
            </div>
            <div className="text-sm text-gray-600">Tickets Sold</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Sold Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600">
              {event.availableSeats}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.ceil((new Date(event.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-600">Days Left</div>
          </div>
        </div>
      </div>
    </div>
  );
};