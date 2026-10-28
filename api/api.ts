import type { IMovie } from "@/types/movie";

type TMDBListResponse = {
  results: IMovie[];
  total_pages: number;
};

export type MovieCollectionType = "trending" | "popular";

export type MovieCollectionResponse = {
  results: IMovie[];
  page: number;
  totalPages: number;
};

async function getMoviePage(
  endpoint: string,
  page: number,
): Promise<MovieCollectionResponse> {
  const baseUrl = process.env.TMDB_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.TMDB_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("TMDB_BASE_URL and TMDB_API_KEY must be configured.");
  }

  const url = new URL(`${baseUrl}/${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", String(page));

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(
      `TMDB request failed (${response.status} ${response.statusText}).`,
    );
  }

  const data = (await response.json()) as TMDBListResponse;
  return { results: data.results, page, totalPages: data.total_pages };
}

export function getMovieCollection(
  type: MovieCollectionType,
  page = 1,
): Promise<MovieCollectionResponse> {
  const endpoint =
    type === "trending" ? "trending/all/day" : "movie/popular";
  return getMoviePage(endpoint, page);
}

export async function getTrendingMovies(): Promise<IMovie[]> {
  const data = await getMovieCollection("trending");
  return data.results;
}

export async function getPopularMovies(): Promise<IMovie[]> {
  const data = await getMovieCollection("popular");
  return data.results;
}

export async function getMovieDetails(
  id: number,
  mediaType: "movie" | "tv",
): Promise<IMovie> {
  const baseUrl = process.env.TMDB_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.TMDB_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("TMDB_BASE_URL and TMDB_API_KEY must be configured.");
  }

  const url = new URL(`${baseUrl}/${mediaType}/${id}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(
      `TMDB request failed (${response.status} ${response.statusText}).`,
    );
  }

  return (await response.json()) as IMovie;
}
