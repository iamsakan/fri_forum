import { useState, useCallback } from "react";

export function useToast() {
  const [sporocila, setSporocila] = useState([]);

  const dodajSporocilo = useCallback((besedilo, tip = "success") => {
    const id = Date.now();
    setSporocila((prev) => [...prev, { id, besedilo, tip }]);
  }, []);

  const odstraniSporocilo = useCallback((id) => {
    setSporocila((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { sporocila, dodajSporocilo, odstraniSporocilo };
}