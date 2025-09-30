"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  // Handle category filtering by navigating to home with URL params
  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams();
    params.set("category", category);
    router.push(`/?${params.toString()}`);
  };

  // Handle type/price filtering
  const handleTypeFilter = (type: string) => {
    const params = new URLSearchParams();
    if (type === "free") {
      params.set("maxPrice", "0");
    } else if (type === "today") {
      const today = new Date().toISOString().split("T")[0];
      params.set("dateStart", today);
      params.set("dateEnd", today);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-4">Enjoyor</h3>
            <p className="text-sm text-muted">
              Discover and book the best events in your city. From conferences
              to concerts, workshops to festivals.
            </p>
            <div className="mt-4">
              <p className="text-xs text-muted">
                It's made for you event enthusiasts
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Explore Events</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors"
                >
                  All Events
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleTypeFilter("free")}
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors text-left"
                >
                  Free Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTypeFilter("today")}
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors text-left"
                >
                  Events Today
                </button>
              </li>
              <li>
                <Link
                  href="/auth?view=register"
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Popular Categories</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryFilter("Music")}
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors text-left"
                >
                  Music
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryFilter("Technology")}
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors text-left"
                >
                  Technology
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryFilter("Arts & Culture")}
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors text-left"
                >
                  Arts & Culture
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryFilter("Sports & Fitness")}
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors text-left"
                >
                  Sports & Fitness
                </button>
              </li>
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h4 className="font-semibold mb-4">For Organizers</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth?view=register"
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors"
                >
                  Start Organizing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/events/create"
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors"
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted hover:text-[var(--foreground)] transition-colors"
                >
                  Event Dashboard
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted">Pricing Guide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <p className="text-sm text-muted">
                © 2025 Enjoyor. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
