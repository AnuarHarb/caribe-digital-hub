import { Navbar } from "@/components/Navbar";
import { EventsSection } from "@/components/EventsSection";

export default function Events() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <EventsSection />
      
      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              © 2025 Costa Digital • Movimiento Tecnológico del Caribe
            </p>
            <p className="text-accent font-semibold text-sm">
              Barranquilla • Cartagena • Santa Marta
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
