---
name: costa-digital-design
description: >-
  Sistema de diseño y voz de Costa Digital (Bricolage, Instrument, Space Mono, navy/aqua/brillante, pilares Educación Comunidad Empleo Emprendimiento, íconos Phosphor).
  Usar cuando se cree o edite UI, copy, landing, documento, merch o el logo.
  No usar en migraciones, RLS, edge functions ni lógica de auth/jobs salvo que el usuario pida también diseño o texto.
  Dispara con "la casa", "la sede", "hazlo con la marca", "en nuestro estilo", Café 404, Lab Maker, Costa Digital News, La Marea, membresías.
---

# Costa Digital · Diseño y landing pages

Costa Digital es la casa del talento tech del Caribe: sede en Prado (Barranquilla), con café, cowork, salones, lab maker y patio, operada por Fundación Código Abierto (ESAL). Misión: convertir a Barranquilla en el epicentro tech del Caribe. Cuatro pilares: **Educación, Comunidad, Empleo, Emprendimiento**.

**La marca es fija** y gana sobre el look actual del sitio (Inter, Space Grotesk, teal HSL, Lucide) y sobre cualquier framework. El método de landings de campaña (estructura, conversión, estados) se sigue en `references/landing-playbook.md`. Si el usuario pide algo que contradice esto, el usuario gana.

## Cómo trabajar

1. **Identifica el tipo de pieza** y lee solo lo que aplique:
   - Página o componente de este repo → `references/en-este-repo.md` y este archivo.
   - Solo texto → `references/voz-y-escritura.md`.
   - Landing de campaña → `references/landing-playbook.md`.
   - Impreso o merch → `references/impresos-y-merch.md`.
   - Brochure / PDF / HTML suelto → `assets/templates/documento.html`.
2. **Carga los tokens** desde `assets/tokens.css`. En la app, mapea esos mismos valores a `src/index.css` y Tailwind. Nunca escribas un hex suelto dentro de un componente.
3. **Escribe primero, diseña después.**
4. **Antes de entregar**, corre la lista del final.

## En este repo (resumen)

Detalle en `references/en-este-repo.md`.

- Stack: Vite + React + TypeScript + Tailwind + shadcn + `react-i18next`.
- Copy de UI: `src/i18n/locales/es.json` y `en.json`.
- Portada: `src/pages/Landing.tsx`. Es un hub, no una landing de campaña.
- Logo web hoy: PNG en `src/assets/`. SVG de marca: `assets/logo/`.
- Íconos nuevos: **Phosphor** (`@phosphor-icons/react`), línea regular de 2 px, un color. No Material. Al tocar un archivo con Lucide, cámbialo a Phosphor.
- Plantillas HTML: solo documentos o referencia visual. Nunca reescribas una ruta de `src/pages` en HTML suelto.

---

## La marca (fija)

### Color

| Token | Hex | Papel |
|---|---|---|
| `--navy` | #050A30 | La casa. Fondos, hero, sello. Único fondo oscuro permitido. |
| `--aqua` | #86CAC8 | El mar. Acento, botón principal, palabra destacada del título. Menos del 15% de la superficie. |
| `--brillante` | #2E4DB8 | La acción. Enlaces, chips, botón secundario, foco. |
| `--azul` | #183090 | Apoyo. Franja de cifras. |
| `--paper` | #EEF3FB | Fondo claro. |
| `--ink` | #0A0F2C | Texto principal sobre claro. |
| `--muted` | #4E5878 | Texto secundario. |
| `--line` | #D6DFF0 | Bordes de 1 px. |
| `--hero-text` | #DDE4F6 | Párrafo sobre navy. |

Contraste: blanco/navy 19:1, aqua/navy 10:1, blanco/brillante 7:1. **Aqua nunca es texto sobre fondo claro** (1,9:1). Navy sobre aqua es el botón principal.

Gradientes: uno solo, el resplandor radial del hero (`radial-gradient(circle, rgba(46,77,184,.55), transparent 62%)`). Fondos planos en todo lo demás. El énfasis del título es una palabra en aqua, no un degradado.

En Tailwind de este repo, mapea así al editar el tema: `--primary` ← navy, `--accent` ← aqua, `--ring` ← brillante, `--background` ← paper, `--foreground` ← ink, `--border` ← line. Añade `navy`, `aqua`, `brillante`, `azul` como colores nombrados. No dejes el teal `#36D4C3` ni el navy `#0C2642` del look anterior.

### Tipografía

Tres familias, tres trabajos:

- **Bricolage Grotesque** 700/800 · títulos. Tracking cerrado (−1 a −1,5 px en grande). 800 sí; 900 no existe.
- **Instrument Sans** 400/500/600 · texto que se lee de cerca.
- **Space Mono** 400/700 · eyebrows en mayúscula (tracking 2 a 2,5 px), precios, cifras, códigos.

Nunca itálicas. `text-wrap: balance` en títulos y `pretty` en párrafos. Escala Tailwind: sm 14, base 16, lg 18, xl 20, 2xl 24, 3xl 30, 4xl 36, 5xl 48, 6xl 60.

Jerarquía: eyebrow `text-xs` mono mayúscula · título de sección `text-2xl` Bricolage 700 · hero `text-5xl` (móvil `text-4xl`) Bricolage 800 · párrafo `text-base` · secundario `text-sm` en `--muted` · botón `text-base` Bricolage 800.

Mayúsculas solo en eyebrows y en el wordmark. Títulos en frase normal.

Google Fonts: `Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800`, `Instrument+Sans:wght@400;500;600`, `Space+Mono:wght@400;700`. Respaldo: Arial Black / system-ui / Courier New.

En `tailwind.config.ts`: `font-display` = Bricolage, `font-sans` = Instrument, `font-mono` = Space Mono. En `index.html`, carga esas tres (no Inter ni Space Grotesk).

### Espaciado, esquinas, bordes

Escala: 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 px. Botón principal 12×20 px. Documentos: margen 46 px / 22 px móvil.

Radios Tailwind: tarjetas `rounded-2xl` (16), cajas y botones `rounded-xl` (12), chips `rounded-full`. Radio anidado: interno = externo − separación (si > 2 y la separación < 32).

Bordes de 1 px en `--line` en todo el contenedor o en ninguno. Excepción: notas con borde izquierdo de 4 px (aqua, o `--warn` #C99B3F). Sin sombras.

### Componentes de la casa

- **Hero de marca:** fondo navy, logo horizontal 236 px arriba a la izquierda, eyebrow aqua en mono, **una** palabra del título en aqua, párrafo en `--hero-text` máx. 680 px, un botón principal, resplandor radial arriba a la derecha.
- **Botones:** principal aqua / texto navy / Bricolage 800; secundario brillante / blanco; fantasma borde brillante. El texto dice qué pasa: "Escribir por WhatsApp", "Agendar visita", "Ver los planes". Nunca "Click aquí", "Contáctanos", "Saber más".
- **Chips:** Space Mono mayúscula, fondo paper, texto brillante, `rounded-full`.
- **Tarjetas de servicio:** blanco, borde line, título Bricolage 800 a la izquierda, chip a la derecha, precios en mono brillante a la derecha.
- **Franja de cifras:** fondo `--azul`, números Bricolage aqua.
- **Viñetas:** "→" en aqua.
- **Íconos:** Phosphor, trazo 2 px, monocolor. Nunca Material. Lucide solo hasta sustituirlo.
- **Foto:** gente real en la sede. Texto sobre foto: blanco sobre velo navy al 60%. Ilustración: trazo grueso de una tinta, familia de la ola. Nada 3D ni banco de imágenes.

La portada actual aún no cumple este hero (foto + Inter + varios CTAs). Al rediseñarla, tráela a este modelo. No "respetes" Inter/teal como marca.

### Logo

Archivos en `assets/logo/`. Isotipo: ola en círculo, mar en brillante. Principal: aqua y brillante sobre navy. Sobre claro: anillo y cresta navy, mar brillante. Una tinta: navy, blanco o negro. Horizontal: isotipo a la izquierda, "COSTA" / "DIGITAL" en Bricolage 800 ("DIGITAL" aqua sobre navy, brillante sobre claro), "CENTRO DE INNOVACIÓN" en Space Mono.

Área de respeto = altura de la "C". Mínimo 24 mm / 120 px el completo, 10 mm / 32 px el isotipo. Sin estirar, rotar, recolorear ni añadir palabras. "Made in the Costa" es merch, no logo.

### Nombre y voz (resumen)

Detalle en `references/voz-y-escritura.md`.

Primera mención institucional: **Costa Digital · Centro de Innovación del Caribe**. Corto: "Centro de Innovación".

Dos registros: institucional ("El Caribe se programa") y comunidad ("Aquí se mueve la vaina"). Carácter: honesto, cálido, inclusivo, directo.

Palabra corta; voz activa; cero sinergia, disruptivo, stakeholders, hub. **"Ecosistema" puede quedar** en nav y SEO que ya existen; en copy nuevo prefiere "la casa", "la sede", "la comunidad" si el registro es de comunidad.

## Landings

La **portada** (`/`) es un hub. No le impongas una sola acción de campaña.

Una **landing de campaña** sigue `references/landing-playbook.md` y se implementa en React + i18n. Acción habitual: WhatsApp, visita, cupo, membresía, `contacto@codigoabierto.tech`.

Cifras: 3 años · +120 proyectos en hackatones · +400 graduados · +5.000 personas impactadas. Si falta: `[cifra por confirmar]`.

## Lista de verificación

**Marca**
- [ ] ¿Bricolage / Instrument / Space Mono? ¿Navy, aqua, brillante (sin teal viejo)?
- [ ] ¿Aqua <15% y nunca como texto sobre claro? ¿Un solo gradiente (el del hero)?
- [ ] ¿Phosphor, no Material ni Lucide nuevo?
- [ ] ¿Sirve a Educación, Comunidad, Empleo o Emprendimiento?
- [ ] ¿Costa Digital con descriptor en la primera mención institucional?

**Web**
- [ ] ¿Copy en `es.json` / `en.json`? ¿Sin hex suelto?
- [ ] ¿HTML semántico?

**Campaña**
- [ ] ¿Una oferta, un público, una acción?

**Impreso**
- [ ] ¿Texto en curvas, CMYK o Pantone, sangrado, prueba física?
