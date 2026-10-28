import "./globals.css";
import "swiper/css";
import SavedMovieHydrator from "@/components/SavedMovieHydrator";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SavedMovieHydrator />
        {children}
      </body>
    </html>
  );
}
