"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { IMovie } from "@/types/movie";

type MovieResponse = {
  movie?: IMovie;
  error?: string;
};

const imageUrl = (path: string, size: "w500" | "original") =>
  `https://image.tmdb.org/t/p/${size}${path}`;

const movieTitle = (movie: IMovie) => movie.title ?? movie.name ?? "Untitled";

const movieYear = (movie: IMovie) => {
  const date = movie.release_date ?? movie.first_air_date;
  return date ? date.slice(0, 4) : "";
};

export default function MovieDetails({
  id,
  mediaType,
}: {
  id: number;
  mediaType: "movie" | "tv";
}) {
  const [movie, setMovie] = useState<IMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovie() {
      try {
        const response = await fetch(
          `/api/movies?type=detail&id=${id}&mediaType=${mediaType}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as MovieResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Не удалось загрузить информацию о фильме.");
        }

        if (!data.movie) {
          throw new Error("Сервер не вернул информацию о фильме.");
        }

        setMovie(data.movie);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить информацию о фильме.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadMovie();
    return () => controller.abort();
  }, [id, mediaType]);

  const backdrop = movie?.backdrop_path
    ? `linear-gradient(90deg, #090909 0%, #090909dd 35%, #09090970 100%), linear-gradient(0deg, #090909, transparent 70%), url("${imageUrl(movie.backdrop_path, "original")}")`
    : undefined;
  const runtime = movie?.runtime ?? movie?.episode_run_time?.[0];

  return (
    <main className="cinema">
      <header className="navbar">
        <h2 className="logo">
          <Link href="/">
            CINE<span>SEARCH</span>
          </Link>
        </h2>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/movies?type=trending">Discover</Link>
        </nav>
      </header>

      <section
        className="movie-details"
        style={backdrop ? { backgroundImage: backdrop } : undefined}
      >
        <div className="movie-details-content">
          <Link className="back-link" href="/">
            ‹ Back to home
          </Link>
          {loading && <p className="page-message">Loading movie details...</p>}
          {error && <p className="page-message">{error}</p>}
          {movie && (
            <div className="details-layout">
              {movie.poster_path && (
                <div
                  className="details-poster"
                  role="img"
                  aria-label={`${movieTitle(movie)} poster`}
                  style={{
                    backgroundImage: `url("${imageUrl(movie.poster_path, "w500")}")`,
                  }}
                />
              )}
              <div className="details-copy">
                <span className="tag">
                  {mediaType === "tv" ? "TV SERIES" : "MOVIE"}
                </span>
                <h1>{movieTitle(movie)}</h1>
                {movie.tagline && <p className="details-tagline">{movie.tagline}</p>}
                <p className="details-meta">
                  ⭐ {movie.vote_average.toFixed(1)}
                  {movieYear(movie) && `　${movieYear(movie)}`}
                  {runtime && `　${runtime} min`}
                </p>
                {movie.genres && movie.genres.length > 0 && (
                  <p className="details-genres">
                    {movie.genres.map((genre) => genre.name).join("　·　")}
                  </p>
                )}
                <h2>Overview</h2>
                <p className="details-overview">
                  {movie.overview || "Описание пока недоступно."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
