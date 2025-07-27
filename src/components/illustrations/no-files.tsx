// src/components/illustrations/no-files.tsx

import React from 'react';

export function NoFilesIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <g opacity="0.6">
            <path d="M41 40H159C162.314 40 165 42.6863 165 46V54H35V46C35 42.6863 37.6863 40 41 40Z" fill="hsl(var(--primary))" opacity="0.5" />
            <path d="M35 54H165V104C165 107.314 162.314 110 159 110H41C37.6863 110 35 107.314 35 104V54Z" fill="hsl(var(--primary))" />
            <rect x="100" y="72" width="60" height="4" rx="2" fill="hsl(var(--background))" opacity="0.3"/>
            <rect x="100" y="82" width="40" height="4" rx="2" fill="hsl(var(--background))" opacity="0.3"/>
             <g transform="translate(50, 65)">
                <circle cx="15" cy="15" r="12" stroke="hsl(var(--background))" strokeWidth="2.5" opacity="0.6"/>
                <path d="M10 16 L14 20 L20 12" stroke="hsl(var(--background))" strokeWidth="2.5" strokeLinecap='round' strokeLinejoin='round' opacity="0.6"/>
            </g>
        </g>
    </svg>
  );
}
