"use client";

import { useEffect } from "react";
import { useMovieStore } from "@/store/useMovieStore";

export default function SavedMovieHydrator() {
  useEffect(() => {
    let active = true;

    void Promise.resolve()
      .then(() => useMovieStore.persist.rehydrate())
      .then(() => {
        if (active) {
          useMovieStore.getState().setHasHydrated(true);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load saved movies from browser storage.", error);
        if (active) {
          useMovieStore.getState().setStorageError(
            "Could not load your saved movies from this browser.",
          );
          useMovieStore.getState().setHasHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
