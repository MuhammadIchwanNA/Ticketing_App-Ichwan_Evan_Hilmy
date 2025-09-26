"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("authUser");
    if (token && userData) {
      setIsLoggedIn(true);
      const user = JSON.parse(userData);
      setUserRole(user.role || "CUSTOMER");
      setUserName(user.name || "User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName("");
    router.push("/");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-cream border-b hairline sticky top-0 z-50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="inline-grid place-items-center h-7 w-7 rounded-full border hairline bg-gradient-to-br from-[var(--mint)] to-[var(--sky)]">
            <span className="text-xs font-bold text-[var(--foreground)]">E</span>
          </span>
          <span className="font-semibold tracking-tight text-gradient">Enjoyor</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/events"
            className={`text-sm font-medium transition-colors hover:text-[var(--foreground)] ${
              pathname === "/" ? "text-[var(--foreground)]" : "text-muted"
            }`}
          >
            Browse Events
          </Link>

          {isLoggedIn ? (
            <>
              {userRole === "ORGANIZER" && (
                <>
                  <Link
                    href="/dashboard/events/create"
                    className={`text-sm font-medium transition-colors hover:text-[var(--foreground)] ${
                      pathname.includes("/dashboard/events/create")
                        ? "text-[var(--foreground)]"
                        : "text-muted"
                    }`}
                  >
                    Create Event
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-colors hover:text-[var(--foreground)] ${
                      pathname === "/dashboard" ? "text-[var(--foreground)]" : "text-muted"
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              )}

              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors hover:text-[var(--foreground)] ${
                    pathname === "/profile" ? "text-[var(--foreground)]" : "text-muted"
                  }`}
                >
                  Profile
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-tint rounded-full">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-yellow-400 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted">{userName}</span>
                </div>

                <button onClick={handleLogout} className="btn btn-ghost text-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="text-sm font-medium text-muted hover:text-[var(--foreground)] transition-colors"
              >
                Login
              </Link>
              <Link href="/auth?view=register" className="btn btn-primary text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-mint-tint rounded-lg transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t hairline bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-sm font-medium text-muted hover:text-[var(--foreground)] transition-colors"
              onClick={closeMenu}
            >
              Browse Events
            </Link>

            {isLoggedIn ? (
              <>
                {userRole === "ORGANIZER" && (
                  <>
                    <Link
                      href="/dashboard/events/create"
                      className="block text-sm font-medium text-muted hover:text-[var(--foreground)] transition-colors"
                      onClick={closeMenu}
                    >
                      Create Event
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block text-sm font-medium text-muted hover:text-[var(--foreground)] transition-colors"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                <div className="flex items-center gap-2 py-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-yellow-400 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                  <span className="text-xs text-muted">({userRole?.toLowerCase()})</span>
                </div>

                <Link
                  href="/profile"
                  className="block text-sm font-medium text-muted hover:text-[var(--foreground)] transition-colors"
                  onClick={closeMenu}
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="block w-full text-left text-sm font-medium text-muted hover:text-[var(--foreground)] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth"
                  className="text-sm font-medium text-muted hover:text-[var(--foreground)] transition-colors"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth?view=register"
                  className="btn btn-primary text-sm"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}