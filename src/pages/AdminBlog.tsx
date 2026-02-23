import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TipTapEditor } from "@/components/blog/TipTapEditor";
import { useAuth } from "@/hooks/useAuth";
import { useBlogImageUpload } from "@/hooks/useBlogImageUpload";
import type { Database } from "@/integrations/supabase/types";

type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
type BlogStatus = Database["public"]["Enums"]["blog_status"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminBlog() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uploadImage } = useBlogImageUpload(user?.id);

  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "<p></p>",
    cover_image_url: "",
    status: "draft" as BlogStatus,
  });

  const loadPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data ?? []);
    } catch (err) {
      toast.error("Error al cargar artículos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!data) {
        toast.error("No tienes permisos para acceder a esta página");
        navigate("/");
        return;
      }
      setIsAdmin(true);
      await loadPosts();
    };
    checkAdmin();
  }, [navigate, loadPosts]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : slugify(title),
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = "";
    const result = await uploadImage(file);
    if ("url" in result) {
      setFormData((prev) => ({ ...prev, cover_image_url: result.url }));
      toast.success("Imagen subida");
    } else {
      toast.error(result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "<p></p>",
      cover_image_url: "",
      status: "draft",
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPostRow) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      cover_image_url: post.cover_image_url ?? "",
      status: post.status as BlogStatus,
    });
    setEditingId(post.id);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const basePayload = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      cover_image_url: formData.cover_image_url || null,
      status: formData.status,
    };

    if (editingId) {
      const updatePayload: Record<string, unknown> = { ...basePayload };
      if (formData.status === "published") {
        const existing = posts.find((p) => p.id === editingId);
        if (existing && !existing.published_at) {
          updatePayload.published_at = new Date().toISOString();
        }
      }
      const { error } = await supabase
        .from("blog_posts")
        .update(updatePayload)
        .eq("id", editingId);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Artículo actualizado");
    } else {
      const insertPayload = {
        ...basePayload,
        author_id: user.id,
        published_at: formData.status === "published" ? new Date().toISOString() : null,
      };
      const { error } = await supabase.from("blog_posts").insert(insertPayload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Artículo creado");
    }
    setDialogOpen(false);
    resetForm();
    await loadPosts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    toast.success("Artículo eliminado");
    setDeleteId(null);
    await loadPosts();
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "-";

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <Navbar />
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-display">
                  {t("admin.blog.title")}
                </CardTitle>
                <CardDescription>{t("admin.blog.description")}</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("admin.blog.newPost")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? t("admin.blog.editPost") : t("admin.blog.newPost")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("admin.blog.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Título del artículo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">{t("admin.blog.slug")}</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                        placeholder="url-del-articulo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="excerpt">{t("admin.blog.excerpt")}</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                        placeholder="Breve resumen..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.blog.coverImage")}</Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleCoverUpload}
                          className="hidden"
                          id="cover-upload"
                        />
                        <label htmlFor="cover-upload">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span className="cursor-pointer flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              Subir imagen
                            </span>
                          </Button>
                        </label>
                        {formData.cover_image_url && (
                          <img
                            src={formData.cover_image_url}
                            alt=""
                            className="h-20 w-32 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.blog.content")}</Label>
                      <TipTapEditor
                        content={formData.content}
                        onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
                        placeholder="Escribe el contenido..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.blog.status")}</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData((p) => ({ ...p, status: v as BlogStatus }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{t("admin.blog.draft")}</SelectItem>
                          <SelectItem value="published">{t("admin.blog.published")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit">{t("admin.blog.save")}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Cargando...</p>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t("admin.blog.noPosts")}</p>
                <p className="text-sm mt-1">{t("admin.blog.createFirst")}</p>
                <Button onClick={openCreate} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.blog.newPost")}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status === "published" ? t("admin.blog.published") : t("admin.blog.draft")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(post.published_at ?? post.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteId(post.id)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("admin.blog.confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("admin.blog.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
