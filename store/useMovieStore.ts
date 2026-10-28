import type { IMovie } from "@/types/movie";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type MovieStore = {
  loading: boolean;
  trendingMovies: IMovie[];
  popularMovies: IMovie[];
  watchlist: IMovie[];
  favorites: IMovie[];
  hasHydrated: boolean;
  storageError: string | null;
  error: string | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  setStorageError: (error: string | null) => void;
  toggleWatchlist: (movie: IMovie) => void;
  toggleFavorite: (movie: IMovie) => void;
  fetchMovies: () => Promise<void>;
};

type MoviesResponse = {
  results?: IMovie[];
  error?: string;
};

async function fetchMovieList(type: "trending" | "popular"): Promise<IMovie[]> {
  const response = await fetch(`/api/movies?type=${type}`);
  const data = (await response.json()) as MoviesResponse;

  if (!response.ok) {
    throw new Error(data.error ?? `Failed to load ${type} movies.`);
  }

  if (!Array.isArray(data.results)) {
    throw new Error(`The server returned an invalid ${type} movies response.`);
  }

  return data.results;
}

const movieKey = (movie: IMovie) =>
  `${movie.media_type === "tv" ? "tv" : "movie"}-${movie.id}`;

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      loading: false,
      trendingMovies: [],
      popularMovies: [],
      watchlist: [],
      favorites: [],
      hasHydrated: false,
      storageError: null,
      error: null,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setStorageError: (storageError) => set({ storageError }),
      toggleWatchlist: (movie) =>
        set((state) => ({
          watchlist: state.watchlist.some(
            (savedMovie) => movieKey(savedMovie) === movieKey(movie),
          )
            ? state.watchlist.filter(
                (savedMovie) => movieKey(savedMovie) !== movieKey(movie),
              )
            : [...state.watchlist, movie],
        })),
      toggleFavorite: (movie) =>
        set((state) => ({
          favorites: state.favorites.some(
            (savedMovie) => movieKey(savedMovie) === movieKey(movie),
          )
            ? state.favorites.filter(
                (savedMovie) => movieKey(savedMovie) !== movieKey(movie),
              )
            : [...state.favorites, movie],
        })),
      fetchMovies: async () => {
        if (get().loading) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const [trendingMovies, popularMovies] = await Promise.all([
            fetchMovieList("trending"),
            fetchMovieList("popular"),
          ]);

          set({ trendingMovies, popularMovies });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load movies.",
          });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "cinesearch-saved-movies",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ watchlist, favorites }) => ({ watchlist, favorites }),
      skipHydration: true,
    },
  ),
);
