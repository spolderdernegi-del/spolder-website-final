import { Link } from "react-router-dom";
import { useRelatedStyle } from "@/lib/relatedStyle";

interface RelatedCardProps {
  to: string;
  title: string;
  image?: string | null;
  date: string;
}

const RelatedCard = ({ to, title, image, date }: RelatedCardProps) => {
  const style = useRelatedStyle();

  if (style === "3" && image) {
    return (
      <Link to={to} className="group relative block overflow-hidden rounded-lg aspect-video">
        <img src={image} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 p-3">
          <h4 className="font-medium text-sm text-white line-clamp-2 drop-shadow">{title}</h4>
          <p className="text-xs text-white/80 mt-1">{date}</p>
        </div>
      </Link>
    );
  }

  if (style === "2") {
    return (
      <Link to={to} className="flex gap-3 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
        {image && <img src={image} alt={title} loading="lazy" className="w-20 h-16 object-cover rounded-md shrink-0" />}
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2">{title}</h4>
          <p className="text-xs text-muted-foreground mt-2">{date}</p>
        </div>
      </Link>
    );
  }

  // Seçenek 1 (varsayılan) ve görseli olmayan kayıtlar
  return (
    <Link to={to} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors">
      {image && <img src={image} alt={title} loading="lazy" className="w-full aspect-video object-cover rounded-md mb-3" />}
      <h4 className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2">{title}</h4>
      <p className="text-xs text-muted-foreground mt-2">{date}</p>
    </Link>
  );
};

export default RelatedCard;
