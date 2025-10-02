import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { z } from "zod";

const eventSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  location: z.string().min(3, "El lugar debe tener al menos 3 caracteres"),
  organizer: z.string().min(2, "El organizador debe tener al menos 2 caracteres"),
  registration_link: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  image_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  registration_link: string | null;
  description: string | null;
  image_url: string | null;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    organizer: "",
    registration_link: "",
    description: "",
    image_url: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Debes iniciar sesión");
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
      toast.error("No tienes permisos de administrador");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchEvents();
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validation = eventSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const eventData = {
        ...formData,
        registration_link: formData.registration_link || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Evento actualizado");
      } else {
        const { error } = await supabase
          .from("events")
          .insert([eventData]);

        if (error) throw error;
        toast.success("Evento creado");
      }

      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar evento");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Evento eliminado");
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar evento");
    }
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      organizer: event.organizer,
      registration_link: event.registration_link || "",
      description: event.description || "",
      image_url: event.image_url || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      date: "",
      time: "",
      location: "",
      organizer: "",
      registration_link: "",
      description: "",
      image_url: "",
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Gestión de Eventos</CardTitle>
                <CardDescription>Administra los eventos de Costa Digital</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
                    </DialogTitle>
                    <DialogDescription>
                      Completa los detalles del evento
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Evento</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizer">Organizador</Label>
                        <Input
                          id="organizer"
                          value={formData.organizer}
                          onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Lugar</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción (opcional)</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción breve del evento"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_url">URL de Imagen (opcional)</Label>
                      <Input
                        id="image_url"
                        type="url"
                        placeholder="https://..."
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration_link">Link de Registro (opcional)</Label>
                      <Input
                        id="registration_link"
                        type="url"
                        placeholder="https://..."
                        value={formData.registration_link}
                        onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingEvent ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando eventos...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay eventos creados aún
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Lugar</TableHead>
                    <TableHead>Organizador</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{new Date(event.date + "T00:00:00").toLocaleDateString()}</TableCell>
                      <TableCell>{event.time}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>{event.organizer}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(event)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
}
