import { useEffect, useState } from "react";

// Delays updating the returned value until `delay` ms have passed
// without the input changing — used to avoid firing search filters
// on every keystroke.
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
