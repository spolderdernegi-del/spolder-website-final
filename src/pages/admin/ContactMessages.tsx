import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Loader } from "lucide-react";
import { toast } from "@/lib/toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(data || []);
      
      // Tüm mesajları okundu olarak işaretle
      const unreadIds = (data || []).filter((m: ContactMessage) => !m.is_read).map((m: ContactMessage) => m.id);
      if (unreadIds.length > 0) {
        await supabase
          .from('contact_messages')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    } catch (err: any) {
      toast.error('Mesajlar yüklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu mesaj silinsin mi?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Mesaj silindi');
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      toast.error('Silme hatası: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard'a Dön
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gelen Mesajlar</h1>
              <p className="text-muted-foreground text-sm">İletişim formundan gönderilen mesajlar</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Henüz mesaj yok.</div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Gönderen</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Konu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Mesaj</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tarih</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {messages.map((msg) => (
                  <tr key={msg.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 ${!msg.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!msg.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                        <div>
                          <div className="font-semibold text-foreground">{msg.name}</div>
                          <div className="text-xs text-muted-foreground">{msg.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{msg.subject || '-'} </td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-pre-wrap max-w-lg">{msg.message}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(msg.created_at).toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(msg.id)}
                        disabled={deletingId === msg.id}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {deletingId === msg.id ? 'Siliniyor...' : 'Sil'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminContactMessages;
