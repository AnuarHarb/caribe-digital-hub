import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Shield, Search } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(["admin", "user"]),
});

interface UserRow {
  id: string;
  full_name: string | null;
  account_type: string | null;
  created_at: string | null;
  role: string;
  is_public: boolean | null;
}

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user" as "admin" | "user",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [{ data: profiles }, { data: roles }, { data: profs }] =
        await Promise.all([
          supabase.from("profiles").select("id, full_name, account_type, created_at"),
          supabase.from("user_roles").select("user_id, role"),
          supabase.from("professional_profiles").select("user_id, is_public"),
        ]);

      const roleMap = new Map(
        (roles ?? []).map((r) => [r.user_id, r.role])
      );
      const profMap = new Map(
        (profs ?? []).map((p) => [p.user_id, p.is_public])
      );

      setUsers(
        (profiles ?? []).map((p) => ({
          id: p.id,
          full_name: p.full_name,
          account_type: p.account_type,
          created_at: p.created_at,
          role: (roleMap.get(p.id) as string) ?? "user",
          is_public: profMap.get(p.id) ?? null,
        }))
      );
    } catch {
      toast.error(t("admin.users.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = userSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        },
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success(t("admin.users.created"));
      setDialogOpen(false);
      setFormData({ email: "", password: "", fullName: "", role: "user" });
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || t("admin.users.createError"));
    }
  };

  const handleChangeRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
      toast.success(t("admin.users.roleUpdated"));
      await loadUsers();
    } catch {
      toast.error(t("admin.users.roleError"));
    }
  };

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.full_name ?? "").toLowerCase().includes(q) ||
        (u.account_type ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <article className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">
            {t("admin.users.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.users.subtitle")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {t("admin.users.create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.users.createTitle")}</DialogTitle>
              <DialogDescription>{t("admin.users.createDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("admin.users.name")}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("admin.users.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.users.role")}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v: "admin" | "user") =>
                    setFormData({ ...formData, role: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{t("admin.users.roleUser")}</SelectItem>
                    <SelectItem value="admin">{t("admin.users.roleAdmin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {t("admin.users.create")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          placeholder={t("admin.users.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.name")}</TableHead>
                  <TableHead>{t("admin.users.accountType")}</TableHead>
                  <TableHead>{t("admin.users.visibility")}</TableHead>
                  <TableHead>{t("admin.users.role")}</TableHead>
                  <TableHead>{t("admin.users.createdAt")}</TableHead>
                  <TableHead>{t("admin.users.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.account_type ?? "professional"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_public === null ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : user.is_public ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs" variant="outline">
                          {t("admin.users.public")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {t("admin.users.private")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.role === "admin" && (
                          <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
                        )}
                        <span className="text-sm">
                          {user.role === "admin"
                            ? t("admin.users.roleAdmin")
                            : t("admin.users.roleUser")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.created_at
                        ? format(new Date(user.created_at), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v: "admin" | "user") =>
                          handleChangeRole(user.id, v)
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t("admin.users.roleUser")}</SelectItem>
                          <SelectItem value="admin">{t("admin.users.roleAdmin")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
