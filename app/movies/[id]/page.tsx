import { Suspense } from "react";
import { notFound } from "next/navigation";
import MovieDetails from "@/components/MovieDetails";

type MoviePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default function MoviePage({ params, searchParams }: MoviePageProps) {
  return (
    <Suspense
      fallback={
        <main className="cinema">
          <section className="movie-details">
            <p className="page-message">Loading movie details...</p>
          </section>
        </main>
      }
    >
      <MovieDetailsRoute params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function MovieDetailsRoute({ params, searchParams }: MoviePageProps) {
  const [{ id }, { type }] = await Promise.all([params, searchParams]);
  const movieId = Number(id);

  if (
    !Number.isSafeInteger(movieId) ||
    movieId < 1 ||
    (type !== "movie" && type !== "tv")
  ) {
    notFound();
  }

  return <MovieDetails id={movieId} mediaType={type} />;
}
