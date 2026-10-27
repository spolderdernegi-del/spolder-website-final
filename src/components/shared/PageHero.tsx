import type { ReactNode } from "react";
import { usePageHeroImage } from "@/lib/pageHeroes";

interface PageHeroProps {
  pageKey: string;
  children: ReactNode;
}

/**
 * Sayfa başlık alanı. Varsayılan yeşil; admin panelinden görsel eklenirse görsel,
 * ana sayfadaki slider gibi yarı saydam header'ın ALTINDA da devam eder.
 */
const PageHero = ({ pageKey, children }: PageHeroProps) => {
  const image = usePageHeroImage(pageKey);
  if (!image) {
    return <section className="bg-gradient-green py-20">{children}</section>;
  }
  return (
    <section
      className="relative -mt-20 pt-40 pb-24 bg-cover bg-center bg-primary"
      style={{ backgroundImage: `url("${image.replace(/"/g, "%22")}")` }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative">{children}</div>
    </section>
  );
};

export default PageHero;
