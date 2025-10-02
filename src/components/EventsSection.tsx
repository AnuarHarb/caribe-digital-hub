import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  if (loading) {
    return (
      <section id="eventos" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
            Próximos Eventos
          </h2>
          <div className="text-center text-muted-foreground">Cargando eventos...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="eventos" className="py-20 px-4 bg-accent/5">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
          Próximos Eventos
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Únete a nuestra comunidad en los próximos encuentros
        </p>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No hay eventos programados por el momento.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ¡Mantente atento a futuras actualizaciones!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {event.image_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    {formatEventDate(event.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-primary" />
                    <span>{event.organizer}</span>
                  </div>
                  {event.registration_link && (
                    <Button
                      className="w-full mt-4"
                      asChild
                    >
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Registrarse
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
