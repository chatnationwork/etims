'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserSession, isSessionValid, refreshSession, clearUserSession, getKnownPhone } from './store';

// Pages that don't require authentication
const PUBLIC_PATHS = ['/etims/auth', '/etims/auth/login', '/etims/auth/signup', '/etims/auth/otp'];

export function useSessionManager() {
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = useCallback(() => {
    // Skip check for public pages
    if (PUBLIC_PATHS.some(path => pathname?.startsWith(path))) {
      return true;
    }

    // Check if session exists and is valid
    if (!isSessionValid()) {
      // Get msisdn before clearing session so user can easily re-login
      const session = getUserSession();
      const msisdn = session?.msisdn || getKnownPhone();
      clearUserSession();
      
      // Redirect with phone number preserved if available
      if (msisdn) {
        router.push(`/etims/auth?phone=${encodeURIComponent(msisdn)}`);
      } else {
        router.push('/etims/auth');
      }
      return false;
    }

    return true;
  }, [pathname, router]);

  useEffect(() => {
    // Skip for public pages
    if (PUBLIC_PATHS.some(path => pathname?.startsWith(path))) {
      return;
    }

    // Initial session check
    checkSession();

    // Refresh session while user is active on the page
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    }, 60 * 1000); // Refresh every minute while active

    // Handle visibility change - check session when returning to page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!checkSession()) {
          return; // Session expired, already redirecting
        }
        refreshSession(); // Session still valid, refresh it
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check session periodically (every 30 seconds)
    const checkInterval = setInterval(() => {
      checkSession();
    }, 30 * 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, checkSession]);

  return { checkSession };
}
