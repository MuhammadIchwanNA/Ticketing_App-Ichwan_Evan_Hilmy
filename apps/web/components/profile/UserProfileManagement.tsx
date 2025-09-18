'use client';
import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Camera, Lock, Shield, Gift, Calendar, Trophy, Eye, EyeOff, Check, X, Edit2, Save, AlertCircle, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';

const UserProfileManagement = () => {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    profilePicture: string | ArrayBuffer | null;
    phone: string;
    location: string;
    bio: string;
    referralCode: string;
    pointsBalance: number;
    joinedDate: string;
    stats: {
      eventsAttended: number;
      eventsOrganized: number;
      totalSpent: number;
      reviews: number;
      referrals: number;
    };
  }>({
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'CUSTOMER',
    profilePicture: null,
    phone: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia',
    bio: 'Event enthusiast who loves discovering new experiences and meeting amazing people.',
    referralCode: 'SAR-123-XYZ',
    pointsBalance: 45000,
    joinedDate: '2024-01-15',
    stats: {
      eventsAttended: 12,
      eventsOrganized: 0,
      totalSpent: 2500000,
      reviews: 8,
      referrals: 3
    }
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tempData, setTempData] = useState(user);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'Image must be less than 5MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempData(prev => ({ ...prev, profilePicture: (e.target as FileReader).result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUser(tempData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setMessage({ type: 'success', text: 'Referral code copied to clipboard!' });
  };

  const cancelEdit = () => {
    setTempData(user);
    setIsEditing(false);
  };

  // Profile Tab Content
  const ProfileContent = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky to-mint flex items-center justify-center overflow-hidden">
              {(isEditing ? tempData.profilePicture : user.profilePicture) ? (
                <img 
                  src={
                    typeof (isEditing ? tempData.profilePicture : user.profilePicture) === 'string'
                      ? (isEditing ? tempData.profilePicture : user.profilePicture) as string
                      : undefined
                  }
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {(isEditing ? tempData.name : user.name).charAt(0)}
                </span>
              )}
            </div>
            
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-mint rounded-full flex items-center justify-center hover:bg-sky transition-colors shadow-md"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                {isEditing ? (
                  <input
                    name="name"
                    value={tempData.name}
                    onChange={handleInputChange}
                    className="text-2xl font-bold bg-transparent border-b-2 border-sky focus:outline-none px-2 py-1"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                )}
                <p className="text-muted capitalize">{user.role.toLowerCase()}</p>
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="btn btn-ghost"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-ghost"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                name="bio"
                value={tempData.bio}
                onChange={handleInputChange}
                className="w-full p-3 border border-line rounded-lg focus:ring-2 focus:ring-sky focus:border-sky resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-muted">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="booking-field">
            <label className="booking-label">Email Address</label>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted" />
              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={tempData.email}
                  onChange={handleInputChange}
                  className="booking-value flex-1 bg-transparent border-0 focus:outline-none"
                />
              ) : (
                <span className="booking-value">{user.email}</span>
              )}
            </div>
          </div>

          <div className="booking-field">
            <label className="booking-label">Phone Number</label>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted" />
              {isEditing ? (
                <input
                  name="phone"
                  type="tel"
                  value={tempData.phone}
                  onChange={handleInputChange}
                  className="booking-value flex-1 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter your phone number"
                />
              ) : (
                <span className="booking-value">{user.phone}</span>
              )}
            </div>
          </div>

          <div className="booking-field md:col-span-2">
            <label className="booking-label">Location</label>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted" />
              {isEditing ? (
                <input
                  name="location"
                  type="text"
                  value={tempData.location}
                  onChange={handleInputChange}
                  className="booking-value flex-1 bg-transparent border-0 focus:outline-none"
                  placeholder="Enter your location"
                />
              ) : (
                <span className="booking-value">{user.location}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-sky-tint rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-sky" />
            </div>
            <div className="font-bold text-xl">{user.stats.eventsAttended}</div>
            <div className="text-sm text-muted">Events Attended</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-mint-tint rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-mint" />
            </div>
            <div className="font-bold text-xl">{user.pointsBalance.toLocaleString()}</div>
            <div className="text-sm text-muted">Points Balance</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-rose-tint rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-rose" />
            </div>
            <div className="font-bold text-xl">{user.stats.reviews}</div>
            <div className="text-sm text-muted">Reviews Written</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-banana-tint rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-banana" />
            </div>
            <div className="font-bold text-xl">{user.stats.referrals}</div>
            <div className="text-sm text-muted">Referrals Made</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Security Tab Content
  const SecurityContent = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h3>
        
        <div className="space-y-4 max-w-md">
          <div className="booking-field">
            <label className="booking-label">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange(e)}
                name="currentPassword"
                className="booking-value w-full pr-10 bg-transparent border-0 focus:outline-none"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="booking-field">
            <label className="booking-label">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange(e)}
                name="newPassword"
                className="booking-value w-full pr-10 bg-transparent border-0 focus:outline-none"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="booking-field">
            <label className="booking-label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange(e)}
                name="confirmPassword"
                className="booking-value w-full pr-10 bg-transparent border-0 focus:outline-none"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={changePassword}
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Change Password
          </button>
        </div>
      </div>

      {/* Account Security */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Account Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-mint-tint rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-mint" />
              <div>
                <p className="font-medium">Email Verified</p>
                <p className="text-sm text-muted">Your email address is verified and secure</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-sky-tint rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-sky" />
              <div>
                <p className="font-medium">Strong Password</p>
                <p className="text-sm text-muted">Last changed 2 months ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Referrals Tab Content
  const ReferralsContent = () => (
    <div className="space-y-6">
      {/* Referral Code */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Your Referral Code
        </h3>
        
        <div className="bg-gradient-accent rounded-xl p-6 text-center">
          <div className="mb-4">
            <div className="text-3xl font-bold mb-2">{user.referralCode}</div>
            <p className="text-muted">Share this code with friends to earn rewards</p>
          </div>
          
          <button
            onClick={copyReferralCode}
            className="btn btn-primary"
          >
            Copy Referral Code
          </button>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Referral Statistics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-mint-tint rounded-lg">
            <Users className="w-8 h-8 text-mint mx-auto mb-2" />
            <div className="font-bold text-2xl">{user.stats.referrals}</div>
            <div className="text-sm text-muted">Friends Referred</div>
          </div>
          
          <div className="text-center p-4 bg-sky-tint rounded-lg">
            <Trophy className="w-8 h-8 text-sky mx-auto mb-2" />
            <div className="font-bold text-2xl">{user.stats.referrals * 10000}</div>
            <div className="text-sm text-muted">Points Earned</div>
          </div>
          
          <div className="text-center p-4 bg-banana-tint rounded-lg">
            <TrendingUp className="w-8 h-8 text-banana mx-auto mb-2" />
            <div className="font-bold text-2xl">IDR {(user.stats.referrals * 25000).toLocaleString()}</div>
            <div className="text-sm text-muted">Value Earned</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">How Referrals Work</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-mint rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Share Your Code</p>
              <p className="text-sm text-muted">Give your referral code to friends</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-sky rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Friend Signs Up</p>
              <p className="text-sm text-muted">They register using your code and get a discount coupon</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-banana rounded-full flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">You Both Win</p>
              <p className="text-sm text-muted">You get 10,000 points, they get a welcome discount</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'referrals', name: 'Referrals', icon: Gift }
  ];

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">My Profile</h1>
          <p className="text-muted">Manage your account settings and preferences</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-mint-tint border border-mint' : 'bg-rose-tint border border-rose'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-mint mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose mr-3" />
            )}
            <span className={`text-sm ${message.type === 'success' ? 'text-mint' : 'text-rose'}`}>
              {message.text}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-8">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all category-highlight ${
                        activeTab === tab.id
                          ? 'bg-sky-tint text-ink font-medium'
                          : 'text-muted hover:text-ink hover:bg-mint-tint'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileContent />}
            {activeTab === 'security' && <SecurityContent />}
            {activeTab === 'referrals' && <ReferralsContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileManagement;