
"use client";

import { useMovieStore } from "@/store/useMovieStore";
import MovieCard from "@/components/MovieCard";
import type { IMovie } from "@/types/movie";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

const imageUrl = (path: string, size: "original") =>
  `https://image.tmdb.org/t/p/${size}${path}`;

const movieTitle = (movie: IMovie) => movie.title ?? movie.name ?? "Untitled";

const movieYear = (movie: IMovie) => {
  const date = movie.release_date ?? movie.first_air_date;
  return date ? date.slice(0, 4) : "";
};

function HeroContent({
  movie,
  loading,
  error,
}: {
  movie?: IMovie;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="content">
      <span className="tag">MOVIE　 TRENDING TODAY</span>
      <h1>{movie ? movieTitle(movie) : "CineSearch"}</h1>
      {movie && (
        <p>
          ⭐ {movie.vote_average.toFixed(1)}　{movieYear(movie)}　
          {movie.media_type === "tv" ? "TV" : "MOVIE"}
        </p>
      )}
      <p className="description">
        {error ?? (movie?.overview || (loading ? "Loading movies..." : ""))}
      </p>
      <div className="actions">
        <button>▶ Play Trailer</button>
        <button>＋ Add to Watchlist</button>
        {movie && (
          <Link
            className="hero-action"
            href={`/movies/${movie.id}?type=${movie.media_type ?? "movie"}`}
          >
            ⓘ More Info
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const trendingMovies = useMovieStore((state) => state.trendingMovies);
  const popularMovies = useMovieStore((state) => state.popularMovies);
  const loading = useMovieStore((state) => state.loading);
  const error = useMovieStore((state) => state.error);
  const fetchMovies = useMovieStore((state) => state.fetchMovies);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const heroMovies = trendingMovies.slice(0, 5);

  useEffect(() => {
    void fetchMovies();
  }, [fetchMovies]);

  const toggleAutoplay = () => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    if (swiper.autoplay.running) {
      swiper.autoplay.stop();
      setAutoplayPaused(true);
    } else {
      swiper.autoplay.start();
      setAutoplayPaused(false);
    }
  };

  return (
    <main className="cinema">
      <header className="navbar">
        <h2 className="logo">
          CINE<span>SEARCH</span>
        </h2>
        <nav>
          <a className="active">Home</a>
          <a>Search</a>
          <a>Discover</a>
          <a>Watchlist</a>
          <a>Favorites</a>
        </nav>
      </header>

      <section className="hero">
        {heroMovies.length > 0 ? (
          <Swiper
            className="hero-swiper"
            modules={[Autoplay]}
            autoplay={
              heroMovies.length > 1
                ? { delay: 5000, disableOnInteraction: false }
                : false
            }
            loop={heroMovies.length > 1}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
          >
            {heroMovies.map((movie) => {
              const background = movie.backdrop_path
                ? `linear-gradient(90deg, #090909 0%, #090909dd 30%, #09090930 100%), linear-gradient(0deg, #090909, transparent 50%), url("${imageUrl(movie.backdrop_path, "original")}")`
                : undefined;

              return (
                <SwiperSlide key={movie.id}>
                  <div
                    className="hero-slide"
                    style={
                      background
                        ? { backgroundImage: background }
                        : undefined
                    }
                  >
                    <HeroContent movie={movie} loading={loading} error={error} />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="hero-slide">
            <HeroContent loading={loading} error={error} />
          </div>
        )}
        {heroMovies.length > 1 && (
          <div className="hero-controls" aria-label="Hero slider controls">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous slide"
            >
              ‹
            </button>
            <span aria-live="polite">
              {activeSlide + 1} / {heroMovies.length}
            </span>
            <button
              type="button"
              onClick={toggleAutoplay}
              aria-label={autoplayPaused ? "Resume slideshow" : "Pause slideshow"}
            >
              {autoplayPaused ? "▶" : "Ⅱ"}
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        )}
      </section>

      <section className="trending">
        <h2>
          Trending Today{" "}
          <span>
            <Link href="/movies?type=trending">See All ›</Link>
          </span>
        </h2>
        <div className="movies">
          {trendingMovies.slice(0, 7).map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      </section>

      <section className="trending">
        <h2>
          Popular movies{" "}
          <span>
            <Link href="/movies?type=popular">See All ›</Link>
          </span>
        </h2>
        <div className="movies">
          {popularMovies.slice(0, 7).map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
