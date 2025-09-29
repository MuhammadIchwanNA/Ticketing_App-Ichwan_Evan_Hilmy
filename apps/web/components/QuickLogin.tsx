'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QuickLogin = () => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const loginAsOrganizer = () => {
    const organizerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWc1cGNlNmEwMDAwcXp0bXMxdnNuajl5IiwiZW1haWwiOiJ0ZXN0b3JnYW5pemVyQHRlc3QuY29tIiwicm9sZSI6Ik9SR0FOSVpFUiIsImlhdCI6MTc1OTE4NTAyNywiZXhwIjoxNzU5Nzg5ODI3fQ.8ST0D6y0Ua1bEfb4OUh_o8cof5o7XVKRfRUOrdSg2_U';
    localStorage.setItem('authToken', organizerToken);
    alert('Logged in as Organizer! Redirecting to dashboard...');
    router.push('/dashboard');
  };

  const loginAsCustomer = () => {
    const customerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWc1b3FtNXMwMDAwbno5bXduMXF4YmRoIiwiZW1haWwiOiJib29raW5nQHRlc3QuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzU5MTg0MDEwLCJleHAiOjE3NTk3ODg4MTB9.D30fXjRjvCMrrL3B-dWrS64xVMFIv1FlsEdxv5Iap9Q';
    localStorage.setItem('authToken', customerToken);
    alert('Logged in as Customer!');
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    alert('Logged out!');
    window.location.reload();
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-700"
      >
        🔧 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg min-w-[200px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Quick Login</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={loginAsOrganizer}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700"
        >
          Login as Organizer
        </button>
        
        <button
          onClick={loginAsCustomer}
          className="w-full bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700"
        >
          Login as Customer  
        </button>
        
        <button
          onClick={logout}
          className="w-full bg-red-600 text-white px-3 py-2 rounded text-xs hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Current: {localStorage.getItem('authToken') ? 'Logged In' : 'Not Logged In'}
      </div>
    </div>
  );
};

export default QuickLogin;
