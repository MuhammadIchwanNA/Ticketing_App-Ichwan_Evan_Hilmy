'use client';
import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Camera, Lock, Shield, Gift, Calendar, Trophy, Eye, EyeOff, X, Edit2, Save, AlertCircle, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

const UserProfileManagement = () => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tempData, setTempData] = useState<any>({});
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

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/auth/profile');
      setUser(response.user);
      setTempData(response.user);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempData((prev: any) => ({ ...prev, [name]: value }));
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
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 5MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempData((prev: any) => ({ ...prev, profilePicture: (e.target as FileReader).result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await apiClient.put('/api/auth/profile', {
        name: tempData.name,
        email: tempData.email,
        profilePicture: tempData.profilePicture
      });
      
      setUser(tempData);
      // Update localStorage
      localStorage.setItem('authUser', JSON.stringify(tempData));
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
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

    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await apiClient.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setMessage({ type: 'success', text: 'Referral code copied!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  const cancelEdit = () => {
    setTempData(user);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load profile</h2>
          <button onClick={fetchProfile} className="btn btn-primary mt-4">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ProfileContent = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-mint-400 flex items-center justify-center overflow-hidden">
              {(isEditing ? tempData.profilePicture : user.profilePicture) ? (
                <img 
                  src={isEditing ? tempData.profilePicture : user.profilePicture}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {(isEditing ? tempData.name : user.name).charAt(0).toUpperCase()}
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
              <div className="flex-1">
                {isEditing ? (
                  <input
                    name="name"
                    value={tempData.name}
                    onChange={handleInputChange}
                    className="text-2xl font-bold bg-transparent border-b-2 border-sky-500 focus:outline-none px-2 py-1 w-full"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                )}
                <p className="text-muted capitalize mt-1">{user.role.toLowerCase()}</p>
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="btn btn-ghost"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn btn-ghost">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="booking-field">
            <label className="booking-label">Email Address</label>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted" />
              <span className="booking-value">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-mint-tint rounded-lg">
            <Trophy className="w-8 h-8 text-mint mx-auto mb-2" />
            <div className="font-bold text-xl">{user.pointsBalance?.toLocaleString() || 0}</div>
            <div className="text-sm text-muted">Points Balance</div>
          </div>
          
          <div className="text-center p-4 bg-sky-tint rounded-lg">
            <Calendar className="w-8 h-8 text-sky mx-auto mb-2" />
            <div className="font-bold text-xl">
              {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div className="text-sm text-muted">Member Since</div>
          </div>
        </div>
      </div>
    </div>
  );

  const SecurityContent = () => (
    <div className="space-y-6">
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
                onChange={handlePasswordChange}
                name="currentPassword"
                className="booking-value w-full pr-10 bg-transparent border-0 focus:outline-none"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted"
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
                onChange={handlePasswordChange}
                name="newPassword"
                className="booking-value w-full pr-10 bg-transparent border-0 focus:outline-none"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted"
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
                onChange={handlePasswordChange}
                name="confirmPassword"
                className="booking-value w-full pr-10 bg-transparent border-0 focus:outline-none"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={changePassword}
            disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
            className="btn btn-primary disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Change Password
          </button>
        </div>
      </div>
    </div>
  );

  const ReferralsContent = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Your Referral Code
        </h3>
        
        <div className="bg-gradient-to-br from-mint-tint to-sky-tint rounded-xl p-6 text-center">
          <div className="mb-4">
            <div className="text-3xl font-bold mb-2">{user.referralCode}</div>
            <p className="text-muted">Share this code with friends to earn rewards</p>
          </div>
          
          <button onClick={copyReferralCode} className="btn btn-primary">
            Copy Referral Code
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">How Referrals Work</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-mint rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Share Your Code</p>
              <p className="text-sm text-muted">Give your referral code to friends</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-sky rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Friend Signs Up</p>
              <p className="text-sm text-muted">They register using your code</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">You Both Win</p>
              <p className="text-sm text-muted">You get 10,000 points, they get a discount</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">My Profile</h1>
          <p className="text-muted">Manage your account settings</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-mint-tint border border-mint-500' : 'bg-rose-tint border border-rose-500'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-mint mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose mr-3 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-8">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
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