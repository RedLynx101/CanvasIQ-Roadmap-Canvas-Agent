'use client';

import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/store/canvas-store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Trigger rehydration after mount
    setIsHydrated(true);
  }, []);

  // You can optionally show a loading state while hydrating
  // For better UX, we'll just render children immediately
  return <>{children}</>;
}

// Hook to check hydration status
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

