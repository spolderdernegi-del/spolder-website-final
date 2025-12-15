import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Save, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankInfo {
  bankName: string;
  accountHolder: string;
  iban: string;
  accountNumber: string;
  branch: string;
  swift: string;
}

const BankInfo = () => {
  const { toast } = useToast();
  const [showIban, setShowIban] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "Türkiye İş Bankası",
    accountHolder: "SPOLDER Spor Politikaları Derneği",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    accountNumber: "1234567890",
    branch: "Kızılay/Ankara",
    swift: "ISBKTRISXXX",
  });

  useEffect(() => {
    const stored = localStorage.getItem('spolder_bank_info');
    if (stored) {
      setBankInfo(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('spolder_bank_info', JSON.stringify(bankInfo));
    toast({
      title: "Başarılı",
      description: "IBAN bilgileri güncellendi",
    });
  };

  const handleChange = (field: keyof BankInfo, value: string) => {
    setBankInfo(prev => ({ ...prev, [field]: value }));
  };

  const maskIban = (iban: string) => {
    if (!showIban && iban.length > 8) {
      return iban.substring(0, 8) + " **** **** **** ****" + iban.substring(iban.length - 4);
    }
    return iban;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IBAN Bilgileri</h1>
          <p className="text-muted-foreground mt-1">
            Bağış ve ödeme bilgilerini yönetin
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Kaydet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Banka Hesap Bilgileri
          </CardTitle>
          <CardDescription>
            Web sitesinde gösterilecek bağış hesap bilgilerini düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Banka Adı</Label>
              <Input
                id="bankName"
                value={bankInfo.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="Örn: Türkiye İş Bankası"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Hesap Sahibi</Label>
              <Input
                id="accountHolder"
                value={bankInfo.accountHolder}
                onChange={(e) => handleChange('accountHolder', e.target.value)}
                placeholder="Örn: SPOLDER Spor Politikaları Derneği"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <div className="relative">
                <Input
                  id="iban"
                  value={showIban ? bankInfo.iban : maskIban(bankInfo.iban)}
                  onChange={(e) => handleChange('iban', e.target.value)}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="pr-10"
                  disabled={!showIban}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowIban(!showIban)}
                >
                  {showIban ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                IBAN numarasını görmek/düzenlemek için göz ikonuna tıklayın
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Hesap Numarası</Label>
                <Input
                  id="accountNumber"
                  value={bankInfo.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Şube</Label>
                <Input
                  id="branch"
                  value={bankInfo.branch}
                  onChange={(e) => handleChange('branch', e.target.value)}
                  placeholder="Kızılay/Ankara"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="swift">SWIFT Kodu</Label>
              <Input
                id="swift"
                value={bankInfo.swift}
                onChange={(e) => handleChange('swift', e.target.value)}
                placeholder="ISBKTRISXXX"
              />
              <p className="text-xs text-muted-foreground">
                Uluslararası bağışlar için SWIFT kodu
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-3">Önizleme (Web sitesinde nasıl görünecek)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Banka:</span>
                <span className="font-medium">{bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hesap Sahibi:</span>
                <span className="font-medium">{bankInfo.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IBAN:</span>
                <span className="font-mono text-xs">{bankInfo.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Şube:</span>
                <span className="font-medium">{bankInfo.branch}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankInfo;
