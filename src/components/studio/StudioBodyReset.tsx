"use client";

import { useEffect } from "react";

export function StudioBodyReset() {
  useEffect(() => {
    document.body.classList.add("studio-route");
    return () => {
      document.body.classList.remove("studio-route");
    };
  }, []);

  return null;
}
