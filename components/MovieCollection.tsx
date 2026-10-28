"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import SiteHeader from "@/components/SiteHeader";
import type { IMovie } from "@/types/movie";

type CollectionType = "trending" | "popular";

type CollectionResponse = {
  results?: IMovie[];
  page?: number;
  totalPages?: number;
  error?: string;
};

export default function MovieCollection({ type }: { type: CollectionType }) {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/movies?type=${type}&page=${page}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as CollectionResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load movies.");
        }

        if (!Array.isArray(data.results)) {
          throw new Error("The server returned an invalid movie list.");
        }

        setMovies(data.results);
        setTotalPages(Math.min(data.totalPages ?? 1, 500));
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load movies.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadMovies();
    return () => controller.abort();
  }, [page, type]);

  const title = type === "trending" ? "Trending Today" : "Popular movies";

  return (
    <main className="cinema">
      <SiteHeader active="discover" />

      <section className="trending collection">
        <h2>{title}</h2>
        {loading && <p className="page-message">Loading movies...</p>}
        {error && <p className="page-message">{error}</p>}
        {!loading && !error && movies.length === 0 && (
          <p className="page-message">No movies found.</p>
        )}
        {!loading && !error && movies.length > 0 && (
          <>
            <div className="movies">
              {movies.map((movie) => (
                <MovieCard movie={movie} key={`${movie.media_type}-${movie.id}`} />
              ))}
            </div>
            <div className="pagination">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1 || loading}
              >
                ‹ Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages || loading}
              >
                Next ›
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
