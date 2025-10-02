import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import logoImage from "@/assets/costa-digital-logo.png";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      toast.success("Sesión cerrada");
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoImage} alt="Costa Digital" className="h-8 w-8" />
          <span className="font-display text-xl font-bold text-primary">
            COSTA DIGITAL
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/eventos">
            <Button variant="ghost">Eventos</Button>
          </Link>
          
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Link to="/admin/eventos">
                    <Button variant="outline">Gestionar Eventos</Button>
                  </Link>
                  <Link to="/admin/configuracion">
                    <Button variant="outline">Configuración</Button>
                  </Link>
                </>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default">Iniciar Sesión</Button>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
