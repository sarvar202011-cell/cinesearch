import Link from "next/link";

type ActiveNavItem = "home" | "discover" | "watchlist" | "favorites";

const links: { label: string; href: string; id: ActiveNavItem }[] = [
  { label: "Home", href: "/", id: "home" },
  { label: "Discover", href: "/movies?type=trending", id: "discover" },
  { label: "Watchlist", href: "/watchlist", id: "watchlist" },
  { label: "Favorites", href: "/favorites", id: "favorites" },
];

export default function SiteHeader({
  active,
}: {
  active?: ActiveNavItem;
}) {
  return (
    <header className="navbar">
      <h2 className="logo">
        <Link href="/">
          CINE<span>SEARCH</span>
        </Link>
      </h2>
      <nav aria-label="Main navigation">
        {links.map(({ label, href, id }) => (
          <Link
            aria-current={active === id ? "page" : undefined}
            className={active === id ? "active" : undefined}
            href={href}
            key={id}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
