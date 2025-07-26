
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School } from 'lucide-react';

/**
 * NOTE: The authentication flow is currently bypassed with a hardcoded user.
 * This page will not be reachable while the hardcoded user is active.
 * The gatekeeper logic in the root `page.tsx` will always redirect to the dashboard.
 */
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center h-full p-4 bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center mb-4">
              <School className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold ml-2">Sahayak</h1>
           </div>
          <CardTitle className="text-2xl">Login Disabled</CardTitle>
          <CardDescription>Authentication is currently bypassed for development.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-center text-sm text-muted-foreground">
             To re-enable login, the hardcoded user in `src/context/auth-context.tsx` must be removed.
           </p>
        </CardContent>
      </Card>
    </main>
  );
}
