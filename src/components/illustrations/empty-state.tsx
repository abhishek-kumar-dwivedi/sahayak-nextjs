// src/components/illustrations/empty-state.tsx

import React from 'react';

export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.6">
        <rect x="10" y="130" width="180" height="10" rx="5" fill="hsl(var(--muted))" />
        <g opacity="0.5">
            <rect x="25" y="50" width="20" height="80" rx="4" fill="hsl(var(--primary))" />
            <rect x="60" y="80" width="20" height="50" rx="4" fill="hsl(var(--primary))" />
            <rect x="95" y="30" width="20" height="100" rx="4" fill="hsl(var(--primary))" />
            <rect x="130" y="65" width="20" height="65" rx="4" fill="hsl(var(--primary))" />
            <rect x="165" y="90" width="20" height="40" rx="4" fill="hsl(var(--primary))" />
        </g>
        <path d="M25 120C40 100, 70 40, 95 60S150 110, 175 90" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
