
'use client';

import { AppSidebarContainer, SidebarProvider } from '@/components/layout/app-sidebar';
import { Onboarding } from '@/components/layout/onboarding';
import { useAuth } from '@/context/auth-context';
import { useGrade } from '@/context/grade-context';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { grades, isLoading: gradesLoading } = useGrade();
  const router = useRouter();

  useEffect(() => {
    // This guard waits for the auth state to be resolved.
    // If loading is finished and there's no user, it redirects to login.
    // This is a secondary safeguard, as the root gatekeeper should handle this first.
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // While loading auth or initial workspace data, show a spinner.
  if (authLoading || gradesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's a user, check if they have any workspaces.
  if (user) {
    // If no workspaces (grades) exist, show the onboarding screen.
    if (grades.length === 0) {
      return (
        <SidebarProvider>
          <Onboarding />
        </SidebarProvider>
      );
    }
    
    // Otherwise, render the main app layout.
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
