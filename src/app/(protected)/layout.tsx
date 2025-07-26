
'use client';

import { AppSidebarContainer, SidebarProvider } from '@/components/layout/app-sidebar';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This guard waits for the auth state to be resolved.
    // If loading is finished and there's no user, it redirects to login.
    // This is a secondary safeguard, as the root gatekeeper should handle this first.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // While loading, show a spinner to prevent flashing of protected content.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's a user, render the protected layout and its children.
  if (user) {
    return (
      <SidebarProvider>
        <AppSidebarContainer>{children}</AppSidebarContainer>
      </SidebarProvider>
    );
  }

  // If no user and not loading, the redirect is in progress. Show a loader.
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
