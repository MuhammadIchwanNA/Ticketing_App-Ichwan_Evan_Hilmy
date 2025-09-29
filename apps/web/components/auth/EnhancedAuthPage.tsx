'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye, EyeOff, Mail, Lock, User, UserCheck,
  AlertCircle, CheckCircle, ArrowRight, Shield, Gift, Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface ForgotPasswordFormProps {
  onBack: () => void;
}

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
  referredBy?: string;
}

/** ---------------------------
 *  Enhanced Login Component
 *  --------------------------*/
export const EnhancedLoginForm = ({ onSwitchToRegister, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/'); // Redirect to home after successful login
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream hero-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-sky to-mint rounded-full flex items-center justify-center mb-4 shadow-md">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h2 className="hero-title text-2xl mb-2">Welcome back</h2>
            <p className="text-muted">Sign in to discover amazing events</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-tint border border-rose rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-rose mr-3 flex-shrink-0" />
              <span className="text-ink text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="booking-field">
              <label className="booking-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="booking-value w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="booking-field">
              <label className="booking-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="booking-value w-full pl-10 pr-12 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-sky focus:ring-sky border-line rounded"
                />
                <span className="ml-2 text-sm text-muted">Remember me</span>
              </label>

              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-sky hover:text-mint transition-colors category-highlight"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full btn btn-primary">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-muted">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-medium text-sky hover:text-mint transition-colors category-highlight"
              >
                Create one here
              </button>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center text-xs text-muted">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Join 10k+ Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** ------------------------------
 *  Enhanced Register Component
 *  -----------------------------*/
export const EnhancedRegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    referredBy: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('at least 8 characters');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('lowercase letter');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('uppercase letter');

    if (/\d/.test(password)) score++;
    else feedback.push('number');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('special character');

    setPasswordStrength({
      score,
      feedback: feedback.length > 0 ? `Add ${feedback.join(', ')}` : 'Strong password!'
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Please enter a valid email';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!agreedToTerms) return 'Please agree to the terms and conditions';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const userData: UserRegistrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.referredBy && { referredBy: formData.referredBy.trim() })
      };

      await register(userData);
      setSuccess('Account created successfully! Welcome to Enjoyor.');

      // Redirect after successful registration
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-rose';
    if (passwordStrength.score <= 3) return 'bg-banana';
    return 'bg-mint';
  };

  const getStrengthWidth = () => {
    return `${(passwordStrength.score / 5) * 100}%`;
  };

  return (
    <div className="min-h-screen bg-cream hero-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-mint to-sky rounded-full flex items-center justify-center mb-4 shadow-md">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h2 className="hero-title text-2xl mb-2">Join Enjoyor</h2>
            <p className="text-muted">Create your account and start exploring</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-tint border border-rose rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-rose mr-3 flex-shrink-0" />
              <span className="text-ink text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-mint-tint border border-mint rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-mint mr-3 flex-shrink-0" />
              <span className="text-ink text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="booking-field">
              <label className="booking-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="booking-value w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="booking-field">
              <label className="booking-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="booking-value w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="booking-field">
              <label className="booking-label">I want to</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CUSTOMER' }))}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.role === 'CUSTOMER'
                      ? 'bg-sky-tint border-sky text-ink'
                      : 'border-line text-muted hover:border-sky hover:bg-sky-tint'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Attend Events</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'ORGANIZER' }))}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.role === 'ORGANIZER'
                      ? 'bg-mint-tint border-mint text-ink'
                      : 'border-line text-muted hover:border-mint hover:bg-mint-tint'
                  }`}
                >
                  <UserCheck className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Host Events</div>
                </button>
              </div>
            </div>

            {/* Password Field */}
            <div className="booking-field">
              <label className="booking-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="booking-value w-full pl-10 pr-12 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-2 bg-line rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: getStrengthWidth() }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted mt-1">{passwordStrength.feedback}</p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="booking-field">
              <label className="booking-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="booking-value w-full pl-10 pr-12 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-1 flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-mint" />
                      <span className="text-xs text-mint">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose" />
                      <span className="text-xs text-rose">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Referral Code */}
            <div className="booking-field">
              <label className="booking-label">
                Referral Code <span className="text-muted">(Optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  name="referredBy"
                  type="text"
                  value={formData.referredBy}
                  onChange={handleChange}
                  className="booking-value w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter referral code for bonus"
                />
              </div>
              {formData.referredBy && (
                <div className="mt-2 p-2 bg-banana-tint rounded flex items-center gap-2">
                  <Gift className="w-4 h-4 text-banana flex-shrink-0" />
                  <p className="text-xs text-ink">You'll receive a welcome discount coupon!</p>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 mt-0.5 text-sky focus:ring-sky border-line rounded"
              />
              <label htmlFor="terms" className="text-sm text-muted cursor-pointer">
                I agree to the{' '}
                <button type="button" className="text-sky hover:text-mint category-highlight">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-sky hover:text-mint category-highlight">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-muted">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-medium text-sky hover:text-mint transition-colors category-highlight"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col items-center gap-1 text-muted">
              <Shield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-muted">
              <Users className="w-4 h-4" />
              <span>Join Community</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-muted">
              <Gift className="w-4 h-4" />
              <span>Exclusive Offers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** ----------------------------
 *  Forgot Password Component
 *  ---------------------------*/
export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Placeholder for forgot password API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream hero-bg flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-muted mb-6">
              We've sent a password reset link to {email}
            </p>
            <button onClick={onBack} className="btn btn-ghost">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream hero-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose to-banana rounded-full flex items-center justify-center mb-4 shadow-md">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="hero-title text-2xl mb-2">Reset Password</h2>
            <p className="text-muted">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-tint border border-rose rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-rose mr-3" />
              <span className="text-ink text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="booking-field">
              <label className="booking-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="booking-value w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 btn btn-ghost"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/** -----------------------
 *  Main Auth Container
 *  ----------------------*/
type View = 'login' | 'register' | 'forgot';

export default function EnhancedAuthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // get view from URL (?view=login|register|forgot), default to 'login'
  const urlView = (searchParams.get('view') as View) ?? 'login';
  const safeUrlView: View = ['login', 'register', 'forgot'].includes(urlView)
    ? (urlView as View)
    : 'login';

  const [currentView, setCurrentView] = useState<View>(safeUrlView);

  // sync with URL changes (back/forward)
  useEffect(() => {
    const v = (searchParams.get('view') as View) ?? 'login';
    if (['login', 'register', 'forgot'].includes(v) && v !== currentView) {
      setCurrentView(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // helper to update both state and URL
  const setView = (v: View) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v === 'login') params.delete('view');
    else params.set('view', v);

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    setCurrentView(v);
  };

  // If already logged in, show quick redirect card
  if (user) {
    return (
      <div className="min-h-screen bg-cream hero-bg flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-mint to-sky rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted mb-6">
            You are already signed in as {user.name}.
          </p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Go to Home
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'login' && (
        <EnhancedLoginForm
          onSwitchToRegister={() => setView('register')}
          onForgotPassword={() => setView('forgot')}
        />
      )}
      {currentView === 'register' && (
        <EnhancedRegisterForm onSwitchToLogin={() => setView('login')} />
      )}
      {currentView === 'forgot' && (
        <ForgotPasswordForm onBack={() => setView('login')} />
      )}
    </>
  );
}
