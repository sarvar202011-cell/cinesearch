import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieDetails } from "@/api/api";
import type { IMovie } from "@/types/movie";

type TrailerPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

const movieTitle = (movie: IMovie) => movie.title ?? movie.name ?? "Untitled";

export default async function TrailerPage({
  params,
  searchParams,
}: TrailerPageProps) {
  return (
    <Suspense
      fallback={
        <main className="cinema">
          <section className="trailer-page">
            <p className="page-message">Loading trailer...</p>
          </section>
        </main>
      }
    >
      <TrailerPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function TrailerPageContent({
  params,
  searchParams,
}: TrailerPageProps) {
  const [{ id }, { type }] = await Promise.all([params, searchParams]);
  const movieId = Number(id);

  if (
    !Number.isSafeInteger(movieId) ||
    movieId < 1 ||
    (type !== "movie" && type !== "tv")
  ) {
    notFound();
  }

  let movie: IMovie | null = null;
  let error: string | null = null;

  try {
    movie = await getMovieDetails(movieId, type);
  } catch (loadError) {
    console.error(`Failed to load trailer for ${type} ${movieId}:`, loadError);
    error = "Failed to load the trailer. Please try again later.";
  }

  const trailer = movie?.videos?.results
    .filter((video) => video.site === "YouTube" && video.type === "Trailer")
    .sort((a, b) => Number(b.official) - Number(a.official))[0];

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

      <section className="trailer-page">
        <div className="trailer-page-content">
          <Link
            className="back-link"
            href={`/movies/${movieId}?type=${type}`}
          >
            ‹ Back to movie
          </Link>
          <h1>{movie ? `Trailer: ${movieTitle(movie)}` : "Movie trailer"}</h1>
          {error ? (
            <p className="page-message">{error}</p>
          ) : trailer ? (
            <div className="trailer-player">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1`}
                title={`Trailer: ${movie ? movieTitle(movie) : "movie"}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="page-message">
              A trailer for this title is not available yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
