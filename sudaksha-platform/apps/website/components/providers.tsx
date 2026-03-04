'use client';


import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ToastProvider, ToastContainer } from '@/components/ui/toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchOnWindowFocus={false}
      refetchInterval={60}
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
