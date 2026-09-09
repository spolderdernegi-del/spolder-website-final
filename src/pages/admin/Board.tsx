import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/lib/toast";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface BoardMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  order: number;
}

const AdminBoard = () => {
  const PRESIDENT_POSITION = "Başkan";
  const isPresident = (member: BoardMember) => member.position === PRESIDENT_POSITION;

  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    image: "",
    order: 0,
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('board')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        console.error("Supabase error:", error);
        toast.error("Üyeler yüklenirken hata: " + error.message);
        return;
      }

      if (data && data.length > 0) {
        setMembers(data);
      } else {
        // Sadece başkan kaydını oluştur, diğer üyeler admin tarafından eklenecek
        const defaultPresident: Omit<BoardMember, "id"> = {
          name: "Prof. Dr. Ahmet Yılmaz",
          position: PRESIDENT_POSITION,
          bio: "Spor yönetimi alanında 20 yıllık deneyime sahip.",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
          order: 1,
        };

        const { data: inserted, error: insertError } = await supabase
          .from('board')
          .insert([defaultPresident])
          .select('*');
        
        if (insertError) {
          console.error("Insert error:", insertError);
        } else if (inserted) {
          setMembers(inserted as BoardMember[]);
        }
      }
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Üyeler yüklenirken hata oluştu");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMember) {
        // Update üyesi
        const { error } = await supabase
          .from('board')
          .update(formData)
          .eq('id', editingMember.id);
        
        if (error) {
          throw error;
        }
        
        toast.success('Üye güncellendi!');
      } else {
        // Yeni üye ekle
        const { error } = await supabase
          .from('board')
          .insert([formData]);
        
        if (error) {
          throw error;
        }
        
        toast.success('Üye eklendi!');
      }

      setIsDialogOpen(false);
      resetForm();
      loadMembers();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const handleEdit = (member: BoardMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio,
      image: member.image,
      order: member.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const member = members.find((m) => m.id === id);
    if (member && isPresident(member)) {
      toast.warning('Başkan silinemez, sadece düzenlenebilir.');
      return;
    }

    if (confirm("Bu üyeyi silmek istediğinizden emin misiniz?")) {
      try {
        const { error } = await supabase
          .from('board')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        toast.success('Üye silindi!');
        loadMembers();
      } catch (error: any) {
        toast.error("Hata: " + error.message);
      }
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      position: "",
      bio: "",
      image: "",
      order: 0,
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Yönetim Kurulu</h1>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Üye Ekle
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sıra</TableHead>
                <TableHead>Fotoğraf</TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Görev</TableHead>
                <TableHead>Biyografi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members
                .sort((a, b) => a.order - b.order)
                .map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.order}</TableCell>
                    <TableCell>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {member.bio}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(member.id)}
                        disabled={isPresident(member)}
                        title={isPresident(member) ? "Başkan silinemez" : "Sil"}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Üye Düzenle" : "Yeni Üye Ekle"}
              </DialogTitle>
              <DialogDescription>
                Yönetim kurulu üyesi bilgilerini girin.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Görev *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biyografi *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <ImageUploadField
                label="Fotoğraf"
                value={formData.image}
                onChange={(value) => setFormData({ ...formData, image: value })}
                required
                aspectRatio={1}
              />

              <div className="space-y-2">
                <Label htmlFor="order">Sıra *</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingMember ? "Güncelle" : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminBoard;
