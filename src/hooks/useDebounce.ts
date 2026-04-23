// src/hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value); // update debouncedValue setelah delay tertentu
    }, delay);

    return () => clearTimeout(timer); // bersihkan timer jika value atau delay berubah sebelum timeout selesai
  }, [value, delay]);

  return debouncedValue;
}
