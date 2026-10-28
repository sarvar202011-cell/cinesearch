import Link from "next/link";

type MovieTrailerButtonProps = {
  id: number;
  mediaType: "movie" | "tv";
};

export default function MovieTrailerButton({
  id,
  mediaType,
}: MovieTrailerButtonProps) {
  return (
    <Link
      className="trailer-button"
      href={`/movies/${id}/trailer?type=${mediaType}`}
    >
      ▶ Play Trailer
    </Link>
  );
}
