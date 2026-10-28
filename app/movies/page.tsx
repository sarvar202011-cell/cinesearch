import { Suspense } from "react";
import { notFound } from "next/navigation";
import MovieCollection from "@/components/MovieCollection";

type MoviesPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default function MoviesPage({ searchParams }: MoviesPageProps) {
  return (
    <Suspense
      fallback={
        <main className="cinema">
          <section className="trending collection">
            <p className="page-message">Loading movies...</p>
          </section>
        </main>
      }
    >
      <MovieCollectionFromSearchParams searchParams={searchParams} />
    </Suspense>
  );
}

async function MovieCollectionFromSearchParams({
  searchParams,
}: MoviesPageProps) {
  const { type } = await searchParams;

  if (type !== "trending" && type !== "popular") {
    notFound();
  }

  return <MovieCollection type={type} />;
}
