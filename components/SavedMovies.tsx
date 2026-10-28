"use client";

import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import SiteHeader from "@/components/SiteHeader";
import { useMovieStore } from "@/store/useMovieStore";

type SavedMoviesProps = {
  list: "watchlist" | "favorites";
};

export default function SavedMovies({ list }: SavedMoviesProps) {
  const movies = useMovieStore((state) => state[list]);
  const hasHydrated = useMovieStore((state) => state.hasHydrated);
  const storageError = useMovieStore((state) => state.storageError);
  const title = list === "watchlist" ? "Watchlist" : "Favorites";
  const emptyDescription =
    list === "watchlist"
      ? "Save movies and shows here to watch them later."
      : "Mark movies and shows you love to find them here.";

  return (
    <main className="cinema">
      <SiteHeader active={list} />
      <section className="trending collection">
        <h2>{title}</h2>
        {storageError && <p className="page-message">{storageError}</p>}
        {!hasHydrated && !storageError && (
          <p className="page-message">Loading your saved movies...</p>
        )}
        {hasHydrated && !storageError && movies.length === 0 && (
          <div className="empty-collection">
            <p className="page-message">{emptyDescription}</p>
            <Link href="/movies?type=trending">Explore trending movies</Link>
          </div>
        )}
        {hasHydrated && !storageError && movies.length > 0 && (
          <div className="movies">
            {movies.map((movie) => (
              <MovieCard
                key={`${movie.media_type === "tv" ? "tv" : "movie"}-${movie.id}`}
                movie={movie}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
