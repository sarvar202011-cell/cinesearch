import Link from "next/link";
import type { IMovie } from "@/types/movie";

const imageUrl = (path: string) =>
  `https://image.tmdb.org/t/p/w500${path}`;

const movieTitle = (movie: IMovie) => movie.title ?? movie.name ?? "Untitled";

export default function MovieCard({ movie }: { movie: IMovie }) {
  const poster = movie.poster_path ?? movie.backdrop_path;
  const background = poster
    ? `linear-gradient(0deg,#000,transparent 70%),url(${imageUrl(poster)})`
    : "linear-gradient(135deg,#242424,#111)";
  const mediaType = movie.media_type === "tv" ? "tv" : "movie";

  return (
    <Link
      className="movie"
      href={`/movies/${movie.id}?type=${mediaType}`}
      style={{ backgroundImage: background }}
    >
      <small>{mediaType === "tv" ? "TV" : "MOVIE"}</small>
      <h3>{movieTitle(movie)}</h3>
    </Link>
  );
}
