'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpiry?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'warning' | 'danger';
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  expiresAt, 
  onExpiry, 
  size = 'md',
  variant = 'default'
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(expiresAt).getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (!isExpired) {
          setIsExpired(true);
          onExpiry?.();
        }
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isExpired, onExpiry]);

  const getVariantStyles = () => {
    if (isExpired) {
      return 'bg-red-50 border-red-200 text-red-700';
    }

    const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
    
    if (totalMinutes <= 15) {
      return 'bg-red-50 border-red-200 text-red-700';
    } else if (totalMinutes <= 60) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    } else {
      return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-3 py-2';
      case 'lg':
        return 'text-lg px-6 py-4';
      default:
        return 'text-sm px-4 py-3';
    }
  };

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  if (isExpired) {
    return (
      <div className={`border rounded-lg flex items-center gap-2 ${getVariantStyles()} ${getSizeStyles()}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">Payment window expired</span>
      </div>
    );
  }

  const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
  const isUrgent = totalMinutes <= 15;

  return (
    <div className={`border rounded-lg flex items-center gap-3 ${getVariantStyles()} ${getSizeStyles()}`}>
      <Clock className={`h-4 w-4 ${isUrgent ? 'animate-pulse' : ''}`} />
      <div className="flex items-center gap-1">
        <span className="font-medium">Payment expires in:</span>
        <span className="font-mono font-bold">
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;