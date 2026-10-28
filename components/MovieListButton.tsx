"use client";

import { useMovieStore } from "@/store/useMovieStore";
import type { IMovie } from "@/types/movie";

type MovieListButtonProps = {
  movie: IMovie;
  list: "watchlist" | "favorites";
  compact?: boolean;
};

export default function MovieListButton({
  movie,
  list,
  compact = false,
}: MovieListButtonProps) {
  const isWatchlist = list === "watchlist";
  const isSaved = useMovieStore((state) =>
    state[list].some(
      (savedMovie) =>
        savedMovie.id === movie.id &&
        (savedMovie.media_type === "tv" ? "tv" : "movie") ===
          (movie.media_type === "tv" ? "tv" : "movie"),
    ),
  );
  const toggleWatchlist = useMovieStore((state) => state.toggleWatchlist);
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const label = isWatchlist ? "Watchlist" : "Favorites";

  return (
    <button
      aria-label={`${isSaved ? "Remove from" : "Add to"} ${label}`}
      aria-pressed={isSaved}
      className={`movie-list-button${isSaved ? " is-active" : ""}${compact ? " compact" : ""}`}
      onClick={() =>
        isWatchlist ? toggleWatchlist(movie) : toggleFavorite(movie)
      }
      type="button"
    >
      <span aria-hidden="true">
        {isWatchlist ? (isSaved ? "✓" : "+") : isSaved ? "♥" : "♡"}
      </span>
      {!compact && (isSaved ? `In ${label}` : `Add to ${label}`)}
    </button>
  );
}
