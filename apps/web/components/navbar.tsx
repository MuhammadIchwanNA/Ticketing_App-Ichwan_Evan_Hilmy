'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('authUser')
    
    if (token && userData) {
      setIsLoggedIn(true)
      const user = JSON.parse(userData)
      setUserRole(user.role || 'CUSTOMER')
      setUserName(user.name || 'User')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setIsLoggedIn(false)
    setUserRole(null)
    setUserName('')
    window.location.href = '/'
  }

  return (
    <header className="bg-cream border-b hairline sticky top-0 z-50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-grid place-items-center h-7 w-7 rounded-full border hairline bg-gradient-to-br from-[var(--mint)] to-[var(--sky)]">
            <span className="text-xs font-bold text-[var(--ink)]">E</span>
          </span>
          <span className="font-semibold tracking-tight text-gradient">Enjoyor</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/events" 
            className={`text-sm font-medium transition-colors hover:text-[var(--ink)] ${
              pathname === '/events' ? 'text-[var(--ink)]' : 'text-muted'
            }`}
          >
            Browse Events
          </Link>
          
          {isLoggedIn ? (
            <>
              {userRole === 'ORGANIZER' && (
                <>
                  <Link 
                    href="/dashboard/events/create" 
                    className={`text-sm font-medium transition-colors hover:text-[var(--ink)] ${
                      pathname.includes('/dashboard/events/create') ? 'text-[var(--ink)]' : 'text-muted'
                    }`}
                  >
                    Create Event
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className={`text-sm font-medium transition-colors hover:text-[var(--ink)] ${
                      pathname === '/dashboard' ? 'text-[var(--ink)]' : 'text-muted'
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              )}
              
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className={`text-sm font-medium transition-colors hover:text-[var(--ink)] ${
                    pathname === '/profile' ? 'text-[var(--ink)]' : 'text-muted'
                  }`}
                >
                  Profile
                </Link>
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-tint rounded-full">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--rose)] to-[var(--banana)] flex items-center justify-center">
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted">
                    {userName}
                  </span>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className="btn btn-ghost text-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="btn btn-primary text-sm"
              >
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
        <div className="md:hidden border-t hairline bg-card">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/events" 
              className="block text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Events
            </Link>
            
            {isLoggedIn ? (
              <>
                {userRole === 'ORGANIZER' && (
                  <>
                    <Link 
                      href="/dashboard/events/create" 
                      className="block text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Event
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="block text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                
                <div className="flex items-center gap-2 py-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--rose)] to-[var(--banana)] flex items-center justify-center">
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {userName}
                  </span>
                  <span className="text-xs text-muted">
                    ({userRole?.toLowerCase()})
                  </span>
                </div>
                
                <Link 
                  href="/profile" 
                  className="block text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block text-sm font-medium text-muted hover:text-[var(--ink)] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}