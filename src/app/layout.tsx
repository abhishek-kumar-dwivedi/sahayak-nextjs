import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { GradeProvider } from '@/context/grade-context';
import { LocaleProvider } from '@/context/locale-context';
import { SubjectProvider } from '@/context/subject-context';
import { Montserrat, Lato } from 'next/font/google';
import { ThemeProvider } from '@/context/theme-context';
import { AuthProvider } from '@/context/auth-context';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-montserrat',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});


export const metadata: Metadata = {
  title: 'Sahayak',
  description: 'Your AI-powered teaching companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${montserrat.variable} ${lato.variable} font-body antialiased h-full bg-background`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <LocaleProvider>
                  <GradeProvider>
                    <SubjectProvider>
                        {children}
                    </SubjectProvider>
                  </GradeProvider>
                </LocaleProvider>
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
