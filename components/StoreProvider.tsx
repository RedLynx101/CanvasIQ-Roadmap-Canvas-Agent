'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Hook to check hydration status
export function useHydration() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

