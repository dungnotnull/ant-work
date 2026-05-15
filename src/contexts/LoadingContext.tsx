"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface LoadingContextType {
  isDashboardLoading: boolean;
  setDashboardLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isDashboardLoading: false,
  setDashboardLoading: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ isDashboardLoading, setDashboardLoading: setIsDashboardLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useDashboardLoading() {
  return useContext(LoadingContext);
}
