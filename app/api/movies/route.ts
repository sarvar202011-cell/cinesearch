import {
  getMovieCollection,
  getMovieDetails,
  type MovieCollectionType,
} from "@/api/api";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const type = searchParams.get("type");

  if (type === "detail") {
    const id = Number(searchParams.get("id"));
    const mediaType = searchParams.get("mediaType");

    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      (mediaType !== "movie" && mediaType !== "tv")
    ) {
      return Response.json(
        { error: "A valid movie ID and media type are required." },
        { status: 400 },
      );
    }

    try {
      const movie = await getMovieDetails(id, mediaType);
      return Response.json({ movie });
    } catch (error) {
      console.error(`Failed to load TMDB ${mediaType} ${id}:`, error);

      return Response.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to load movie.",
        },
        { status: 502 },
      );
    }
  }

  if (type !== "trending" && type !== "popular") {
    return Response.json(
      { error: "Movie type must be 'trending', 'popular', or 'detail'." },
      { status: 400 },
    );
  }

  const page = Number(searchParams.get("page") ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 500) {
    return Response.json(
      { error: "Page must be an integer between 1 and 500." },
      { status: 400 },
    );
  }

  try {
    const collection = await getMovieCollection(
      type as MovieCollectionType,
      page,
    );
    return Response.json(collection);
  } catch (error) {
    console.error(`Failed to load ${type} movies from TMDB:`, error);

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load movies.",
      },
      { status: 502 },
    );
  }
}
