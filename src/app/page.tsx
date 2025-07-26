
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

/**
 * This is the new root component and central "gatekeeper" for the application.
 * Its one and only job is to wait for the authentication state to be resolved,
 * then perform a single, definitive redirect to the correct location.
 * This pattern eliminates all race conditions and redirect loops.
 */
export default function AuthGatekeeperPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only perform redirects once the auth state is fully resolved.
    if (!loading) {
      if (user) {
        // If there is a user, send them to the main dashboard.
        router.replace('/dashboard');
      } else {
        // If there is no user, send them to the login page.
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // While checking the auth state, display a full-screen loader.
  // This prevents any UI flashing and ensures no routing decisions
  // are made with incomplete data.
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
