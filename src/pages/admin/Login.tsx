import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let adminEmail = 'admin@spolder.org';
      let adminPassword = 'spolder2024';

      // Supabase settings tablosundan admin bilgilerini al (varsa)
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['admin_email', 'admin_password']);

        if (!settingsError && settings && settings.length > 0) {
          // Settings varsa, oradan al
          adminEmail = settings?.find(s => s.key === 'admin_email')?.value || adminEmail;
          adminPassword = settings?.find(s => s.key === 'admin_password')?.value || adminPassword;
          console.log("Admin bilgileri Supabase'den alındı");
        } else {
          console.log("Settings tablosu bulunamadı, varsayılan bilgiler kullanılıyor");
        }
      } catch (settingsErr) {
        console.warn("Settings okunamadı, varsayılan bilgiler kullanılıyor:", settingsErr);
      }

      // Girilen bilgileri kontrol et
      if (email === adminEmail && password === adminPassword) {
        console.log("Giriş başarılı!");
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminEmail", email);
        navigate("/admin");
      } else {
        throw new Error("E-posta veya şifre hatalı!");
      }
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      setError(err.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">SPOLDER Yönetim Paneli</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                E-posta
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@spolder.org"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Şifre
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Yetkisiz erişim yasaktır
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
