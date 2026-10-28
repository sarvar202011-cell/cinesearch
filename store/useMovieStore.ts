import type { IMovie } from "@/types/movie";
import { create } from "zustand";

type MovieStore = {
  loading: boolean;
  trendingMovies: IMovie[];
  popularMovies: IMovie[];
  error: string | null;
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

export const useMovieStore = create<MovieStore>((set, get) => ({
  loading: false,
  trendingMovies: [],
  popularMovies: [],
  error: null,
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
}));
