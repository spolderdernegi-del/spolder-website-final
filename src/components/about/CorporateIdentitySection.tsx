import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import erkekLogo from "@/assets/logo_erkek_tek.webp";
import disiLogo from "@/assets/logo_disi.webp";
import { useRef } from "react";

const ColorSwatch = ({ name, className, hex }: { name: string; className: string; hex: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center gap-3">
      <div ref={ref} className={`h-10 w-10 rounded border border-border ${className}`} />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{hex}</span>
      </div>
    </div>
  );
};

export default function CorporateIdentitySection() {
  return (
    <div className="space-y-8" id="kurumsal-kimlik">
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
              <div className="h-28 w-44 bg-foreground/10 rounded-lg border flex items-center justify-center p-5">
                <img src={erkekLogo} alt="SPOLDER Logo Erkek" className="max-h-24 w-auto" />
              </div>
              {/* Beyaz yazılı logo için koyu anthracite arka plan */}
              <div className="h-28 w-44 bg-anthracite rounded-lg border flex items-center justify-center p-5">
                <img src={disiLogo} alt="SPOLDER Logo Dişi" className="max-h-24 w-auto" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href="/docs/spolder_vector_logo.ai" target="_blank" rel="noopener noreferrer" download>Vektör Logo (AI)</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/docs/spolder_logokullanimklavuzu.pdf" target="_blank" rel="noopener noreferrer" download>Logo Kullanım Kılavuzu (PDF)</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/docs/spolder_logokullanimklavuzu_updated.pdf" target="_blank" rel="noopener noreferrer" download>Marka Kılavuzu (PDF)</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Renk Paleti</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <ColorSwatch name="Yeşil" className="bg-primary" hex="#2FAC66" />
            <ColorSwatch name="Turkuaz" className="bg-secondary" hex="#2DAAE2" />
            <ColorSwatch name="Koyu Gri" className="bg-foreground" hex="#2B2B2C" />
            <ColorSwatch name="Açık Gri" className="bg-background" hex="#F7F7F7" />
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
