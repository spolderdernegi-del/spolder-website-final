import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import erkekLogo from "@/assets/logo_erkek_tek.webp";
import disiLogo from "@/assets/logo_disi.webp";
import { useEffect, useRef, useState } from "react";

const rgbToHex = (rgb: string) => {
  // Expect formats like: "rgb(r, g, b)" or "rgba(r, g, b, a)"
  const match = rgb.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/i);
  if (!match) return "";
  const r = Math.max(0, Math.min(255, parseInt(match[1], 10)));
  const g = Math.max(0, Math.min(255, parseInt(match[2], 10)));
  const b = Math.max(0, Math.min(255, parseInt(match[3], 10)));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const ColorSwatch = ({ name, className }: { name: string; className: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState<string>("");

  useEffect(() => {
    if (!ref.current) return;
    const bg = getComputedStyle(ref.current).backgroundColor;
    const asHex = rgbToHex(bg);
    if (asHex) setHex(asHex);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div ref={ref} className={`h-10 w-10 rounded ${className}`} />
      <span className="text-sm text-muted-foreground">
        {name} {hex && ` ${hex}`}
      </span>
    </div>
  );
};

export default function CorporateIdentitySection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Kurumsal Kimlik</h2>
        <p className="mt-2 text-muted-foreground">Logo kullanım kılavuzu, renk paleti ve tipografi.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo Önizleme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              {/* Siyah/renkli logo için daha koyu (foreground %10) arka plan */}
              <div className="h-28 w-44 bg-foreground/10 rounded-lg border shadow-card flex items-center justify-center p-5">
                <img src={erkekLogo} alt="SPOLDER Logo Erkek" className="max-h-24 w-auto" />
              </div>
              {/* Beyaz yazılı logo için koyu anthracite arka plan */}
              <div className="h-28 w-44 bg-anthracite rounded-lg border shadow-card flex items-center justify-center p-5">
                <img src={disiLogo} alt="SPOLDER Logo Dişi" className="max-h-24 w-auto" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href="/docs/sporled_vector_logo.pdf" target="_blank" rel="noopener noreferrer" download>Vektör Logo (PDF)</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/docs/spolder_logokullanimklavuzu.pdf" target="_blank" rel="noopener noreferrer" download>Logo Kullanım Kılavuzu (PDF)</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Renk Paleti</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <ColorSwatch name="Primary" className="bg-primary" />
            <ColorSwatch name="Foreground" className="bg-foreground" />
            <ColorSwatch name="Background" className="bg-background" />
            <ColorSwatch name="Anthracite" className="bg-anthracite" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanım Notları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc pl-6 space-y-2">
            <li>Logolar orantılı şekilde, arka plan kontrastına dikkat edilerek kullanılmalıdır.</li>
            <li>Minimum boşluk ve yanlış kullanım örnekleri PDFde belirtilmiştir.</li>
            <li>Renkler Tailwind tema değişkenleri ile tanımlıdır: primary, foreground, background vb.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
