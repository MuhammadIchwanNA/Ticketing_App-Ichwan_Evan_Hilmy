'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-elevated border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[var(--rose)] via-[var(--mint)] to-[var(--sky)] bg-clip-text text-transparent mb-4">
              Enjoyor
            </h3>
            <p className="text-sm text-muted">
              Discover and book the best events in your city or online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/events" className="text-sm text-muted hover:text-[var(--text)]">All Events</Link></li>
              <li><Link href="/events?type=online" className="text-sm text-muted hover:text-[var(--text)]">Online Events</Link></li>
              <li><Link href="/events?price=free" className="text-sm text-muted hover:text-[var(--text)]">Free Events</Link></li>
              <li><Link href="/events?date=today" className="text-sm text-muted hover:text-[var(--text)]">Today</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/events?category=music" className="text-sm text-muted hover:text-[var(--text)]">Music</Link></li>
              <li><Link href="/events?category=technology" className="text-sm text-muted hover:text-[var(--text)]">Technology</Link></li>
              <li><Link href="/events?category=arts" className="text-sm text-muted hover:text-[var(--text)]">Arts</Link></li>
              <li><Link href="/events?category=sports" className="text-sm text-muted hover:text-[var(--text)]">Sports & Fitness</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-muted hover:text-[var(--text)]">Help Center</Link></li>
              <li><Link href="/organizer-guide" className="text-sm text-muted hover:text-[var(--text)]">Organizer Guide</Link></li>
              <li><Link href="/terms" className="text-sm text-muted hover:text-[var(--text)]">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted hover:text-[var(--text)]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-subtle text-center text-sm text-muted">
          <p>Â© 2025 Enjoyor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}