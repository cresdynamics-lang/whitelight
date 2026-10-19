import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "wl_preferred_eu_size";
const VISIT_KEY = "wl_last_visit_at";

type SizePreferenceContextType = {
  preferredSize: number | null;
  setPreferredSize: (size: number | null) => void;
  clearPreferredSize: () => void;
  lastVisitAt: string | null;
  markVisit: () => void;
};

const SizePreferenceContext = createContext<SizePreferenceContextType | undefined>(undefined);

export function SizePreferenceProvider({ children }: { children: ReactNode }) {
  const [preferredSize, setPreferredSizeState] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  });

  const [lastVisitAt, setLastVisitAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(VISIT_KEY);
    } catch {
      return null;
    }
  });

  const setPreferredSize = useCallback((size: number | null) => {
    setPreferredSizeState(size);
    try {
      if (size == null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, String(size));
    } catch {
      /* ignore */
    }
  }, []);

  const clearPreferredSize = useCallback(() => setPreferredSize(null), [setPreferredSize]);

  const markVisit = useCallback(() => {
    const now = new Date().toISOString();
    setLastVisitAt(now);
    try {
      localStorage.setItem(VISIT_KEY, now);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // Stamp visit on mount for "new since last visit" dots on next session
    const prev = lastVisitAt;
    if (!prev) markVisit();
  }, [lastVisitAt, markVisit]);

  const value = useMemo(
    () => ({
      preferredSize,
      setPreferredSize,
      clearPreferredSize,
      lastVisitAt,
      markVisit,
    }),
    [preferredSize, setPreferredSize, clearPreferredSize, lastVisitAt, markVisit]
  );

  return (
    <SizePreferenceContext.Provider value={value}>{children}</SizePreferenceContext.Provider>
  );
}

export function useSizePreference() {
  const ctx = useContext(SizePreferenceContext);
  if (!ctx) throw new Error("useSizePreference must be used within SizePreferenceProvider");
  return ctx;
}

export const EU_SIZES = [39, 40, 41, 42, 43, 44, 45, 46] as const;
