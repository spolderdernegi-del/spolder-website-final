import { Link } from "react-router-dom";

interface RelatedCardProps {
  to: string;
  title: string;
  image?: string | null;
  date: string;
}

// "İlgili haberler/yazılar/projeler" kartı: büyük görsel, altında başlık ve tarih.
const RelatedCard = ({ to, title, image, date }: RelatedCardProps) => (
  <Link to={to} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors">
    {image && <img src={image} alt={title} loading="lazy" className="w-full aspect-video object-cover rounded-md mb-3" />}
    <h4 className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2">{title}</h4>
    <p className="text-xs text-muted-foreground mt-2">{date}</p>
  </Link>
);

export default RelatedCard;
