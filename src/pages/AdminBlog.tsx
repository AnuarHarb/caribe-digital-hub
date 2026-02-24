import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, ImageIcon, ArrowLeft, Eye, EyeOff, Newspaper } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TipTapEditor } from "@/components/blog/TipTapEditor";
import { TagInput } from "@/components/blog/TagInput";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { useBlogImageUpload } from "@/hooks/useBlogImageUpload";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
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

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type ViewMode = "list" | "editor";

export default function AdminBlog() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("es") ? es : enUS;
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { uploadImage } = useBlogImageUpload(user?.id);

  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "<p></p>",
    cover_image_url: "",
    status: "draft" as BlogStatus,
    tags: [] as string[],
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
      toast.error(t("admin.blog.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
        toast.error(t("admin.blog.noPermission"));
        navigate("/");
        return;
      }
      setIsAdmin(true);
      await loadPosts();
    };
    checkAdmin();
  }, [navigate, loadPosts, t]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (statusFilter === "draft") result = result.filter((p) => p.status === "draft");
    else if (statusFilter === "published") result = result.filter((p) => p.status === "published");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [posts, statusFilter, searchQuery]);

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
      toast.success(t("admin.blog.imageUploaded"));
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
      tags: [],
    });
    setEditingId(null);
    setShowPreview(false);
  };

  const openCreate = () => {
    resetForm();
    setViewMode("editor");
  };

  const openEdit = (post: BlogPostRow) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      cover_image_url: post.cover_image_url ?? "",
      status: post.status as BlogStatus,
      tags: post.tags ?? [],
    });
    setEditingId(post.id);
    setViewMode("editor");
  };

  const handleBackToList = () => {
    setViewMode("list");
    resetForm();
    loadPosts();
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
      tags: formData.tags.length > 0 ? formData.tags : [],
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
      toast.success(t("admin.blog.updated"));
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
      toast.success(t("admin.blog.created"));
    }
    handleBackToList();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error(t("admin.blog.deleteError"));
      return;
    }
    toast.success(t("admin.blog.deleted"));
    setDeleteId(null);
    await loadPosts();
  };

  const formatDate = (d: string | null) =>
    d ? format(new Date(d), "d MMM yyyy", { locale }) : "-";

  if (!isAdmin) return null;

  if (viewMode === "editor") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={handleBackToList} className="gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t("admin.blog.backToList")}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-6 lg:max-w-[66%]">
              <div className="space-y-2">
                <Label htmlFor="title">{t("admin.blog.titleLabel")}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={t("admin.blog.titlePlaceholder")}
                  required
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.blog.content")}</Label>
                <TipTapEditor
                  content={formData.content}
                  onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
                  placeholder={t("admin.blog.contentPlaceholder")}
                  className="min-h-[300px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">{t("admin.blog.excerpt")}</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder={t("admin.blog.excerptPlaceholder")}
                  rows={3}
                />
              </div>
            </div>

            <aside className="w-full space-y-6 lg:w-[33%] lg:min-w-[280px]">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{editingId ? t("admin.blog.editPost") : t("admin.blog.newPost")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t("admin.blog.slug")}</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                      placeholder={t("admin.blog.slugPlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.blog.coverImage")}</Label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCoverUpload}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label htmlFor="cover-upload">
                        <Button type="button" variant="outline" size="sm" className="w-full gap-2" asChild>
                          <span className="cursor-pointer flex items-center justify-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            {t("admin.blog.uploadImage")}
                          </span>
                        </Button>
                      </label>
                      {formData.cover_image_url && (
                        <img
                          src={formData.cover_image_url}
                          alt=""
                          className="mt-2 aspect-video w-full rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.blog.tags")}</Label>
                    <TagInput
                      value={formData.tags}
                      onChange={(tags) => setFormData((p) => ({ ...p, tags }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview((v) => !v)}
                      className="gap-2"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="h-4 w-4" aria-hidden />
                          {t("admin.blog.preview")} (off)
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" aria-hidden />
                          {t("admin.blog.preview")}
                        </>
                      )}
                    </Button>
                    <Button type="submit">{t("admin.blog.save")}</Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </form>

          {showPreview && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">{t("admin.blog.preview")}</CardTitle>
                <CardDescription>
                  {t("blog.publishedOn")} {formData.status === "published" ? format(new Date(), "d 'de' MMMM yyyy", { locale }) : "-"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <article>
                  <header className="space-y-6">
                    <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl leading-tight">
                      {formData.title || t("admin.blog.titlePlaceholder")}
                    </h1>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {getInitials(profile?.full_name)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{profile?.full_name ?? "-"}</p>
                        <p className="text-sm">
                          {t("blog.publishedOn")}{" "}
                          {formData.status === "published"
                            ? format(new Date(), "d 'de' MMMM yyyy", { locale })
                            : "-"}
                        </p>
                      </div>
                    </div>
                    {formData.cover_image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        <img
                          src={formData.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </header>
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none mt-8 prose-headings:font-display prose-img:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: formData.content || "<p></p>" }}
                  />
                </article>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {t("admin.blog.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("admin.blog.description")}</p>
        </header>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <Input
              placeholder={t("admin.blog.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <TabsList>
                <TabsTrigger value="all">{t("admin.blog.filterAll")}</TabsTrigger>
                <TabsTrigger value="draft">{t("admin.blog.filterDraft")}</TabsTrigger>
                <TabsTrigger value="published">{t("admin.blog.filterPublished")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" aria-hidden />
            {t("admin.blog.newPost")}
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Newspaper className="h-8 w-8 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-4 font-medium text-foreground">
                {posts.length === 0 ? t("admin.blog.noPosts") : t("admin.blog.noResults")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t("admin.blog.createFirst")}</p>
              <Button onClick={openCreate} className="mt-6 gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                {t("admin.blog.newPost")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Newspaper className="h-12 w-12 text-muted-foreground" aria-hidden />
                    </div>
                  )}
                </div>
                <CardHeader className="flex-1 pb-2">
                  <CardTitle className="line-clamp-2 text-base">{post.title}</CardTitle>
                  {post.excerpt && (
                    <CardDescription className="line-clamp-2 mt-1">{post.excerpt}</CardDescription>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status === "published" ? t("admin.blog.published") : t("admin.blog.draft")}
                    </Badge>
                    {(post.tags ?? []).length > 0 &&
                      (post.tags ?? []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(post.published_at ?? post.created_at)}
                  </p>
                </CardHeader>
                <CardContent className="flex gap-2 pt-0">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(post)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteId(post.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("admin.blog.confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("admin.blog.deleteConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
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
