import { Users, Heart, Lightbulb } from "lucide-react";

const leaders = [
  {
    initials: "AH",
    name: "Anuar Harb",
    role: "Cofundador · General Partner de Caribe Ventures",
    bio: "Desarrollador de software, líder del Google Developer Group Barranquilla y fundador de Fundación Código Abierto. Es quien sostiene la visión y lidera la transformación del Caribe en el nuevo epicentro tech, y como General Partner de Caribe Ventures impulsa el capital que hace crecer al ecosistema.",
  },
  {
    initials: "GT",
    name: "Grace Torres",
    role: "Cofundadora · Directora de operaciones y del Tech Centre",
    bio: "Cofundadora, directora de operaciones y abogada, y directora del Tech Centre. Es quien hace que todo esté en orden y que las cosas sucedan como deben suceder: convierte la visión en realidad y mantiene el movimiento funcionando todos los días.",
  },
];

const values = [
  {
    icon: Lightbulb,
    title: "Innovación con propósito",
    description: "Creemos que la tecnología es la industria de las oportunidades.",
  },
  {
    icon: Users,
    title: "Comunidad primero",
    description: "El ecosistema se construye con y para las personas.",
  },
  {
    icon: Heart,
    title: "Impacto que cambia vidas",
    description: "Cada beca, evento y programa transforma realidades en la región.",
  },
];

export function ConocenosTeam() {
  return (
    <section id="equipo" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Quiénes lo hacen posible
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
            El equipo detrás del movimiento
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Anuar Harb y Grace Torres, una pareja de soñadores que decidió
            transformar la historia tecnológica del Caribe colombiano.
          </p>
        </header>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          {leaders.map((leader) => (
            <article
              key={leader.name}
              className="rounded-xl border border-border bg-card p-8 text-center shadow-sm"
            >
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent/20 text-accent"
                aria-hidden="true"
              >
                <span className="font-display text-2xl font-bold">
                  {leader.initials}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                {leader.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-accent">
                {leader.role}
              </p>
              <p className="mt-4 text-muted-foreground">{leader.bio}</p>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="text-center font-display text-2xl font-bold text-primary md:text-3xl">
            Lo que nos mueve
          </h3>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold text-foreground">
                    {value.title}
                  </h4>
                  <p className="mt-2 text-muted-foreground">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
