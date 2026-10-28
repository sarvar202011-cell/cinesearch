"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import MovieTrailerButton from "@/components/MovieTrailerButton";
import MovieListButton from "@/components/MovieListButton";
import SiteHeader from "@/components/SiteHeader";
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
          throw new Error(data.error ?? "Failed to load movie details.");
        }

        if (!data.movie) {
          throw new Error("The server did not return movie details.");
        }

        setMovie(data.movie);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load movie details.",
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
      <SiteHeader />

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
                  {movie.overview || "No overview is available yet."}
                </p>
                <div className="details-actions">
                  <MovieTrailerButton id={id} mediaType={mediaType} />
                  <MovieListButton
                    list="watchlist"
                    movie={{ ...movie, media_type: mediaType }}
                  />
                  <MovieListButton
                    list="favorites"
                    movie={{ ...movie, media_type: mediaType }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {movie?.credits?.cast && movie.credits.cast.length > 0 && (
          <section className="cast-section" aria-labelledby="cast-heading">
            <h2 id="cast-heading">Cast</h2>
            <div className="cast-grid">
              {movie.credits.cast.slice(0, 12).map((actor) => (
                <article className="cast-card" key={actor.id}>
                  {actor.profile_path ? (
                    <Image
                      src={imageUrl(actor.profile_path, "w500")}
                      alt={actor.name}
                      width={200}
                      height={300}
                      unoptimized
                      loading="lazy"
                    />
                  ) : (
                    <div className="cast-photo-placeholder" aria-hidden="true">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                  <h3>{actor.name}</h3>
                  {actor.character && <p>{actor.character}</p>}
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
