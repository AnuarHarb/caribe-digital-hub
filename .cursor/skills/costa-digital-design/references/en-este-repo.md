# Cómo aplicar la marca en este repo

La marca (colores, letras, Phosphor, pilares) está en `SKILL.md` y `assets/tokens.css`. Este archivo solo dice **dónde tocarlo** para no crear un sitio HTML paralelo.

El look actual (Inter, Space Grotesk, teal HSL, Lucide) es deuda. Al editar UI, muévelo a la marca. No lo copies como si fuera el sistema oficial.

## Mapa

| Qué | Dónde |
|---|---|
| Tokens de marca (fuente de verdad) | `.cursor/skills/costa-digital-design/assets/tokens.css` |
| Tokens de la app (hay que alinearlos) | `src/index.css` + `tailwind.config.ts` |
| Fuentes | `index.html` · deben ser Bricolage, Instrument Sans, Space Mono |
| Botón, card, input… | `src/components/ui/*` |
| Portada | `src/pages/Landing.tsx` + `src/components/landing/*` |
| Nav / pie | `Navbar.tsx`, `Footer.tsx` |
| Copy | `src/i18n/locales/es.json`, `en.json` |
| Logo web | `src/assets/costa-digital-logo.png` · SVG en `assets/logo/` |
| SEO | `src/components/SEOHead.tsx` |
| Rutas | `src/App.tsx` |

## Rutas públicas

`/`, `/conocenos`, `/programas`, `/comunidades`, `/aliados`, `/noticias`, `/noticias/:slug`, `/talento`, `/auth`, `/terminos`, `/aviso-de-privacidad`. `/sede` → `/conocenos#sede`. No crees `/membresias` o `/la-marea` si el usuario no lo pide.

## Al tocar el tema

1. En `index.html` carga Google Fonts de la marca (quita Inter y Space Grotesk).
2. En `tailwind.config.ts`:
   - `fontFamily.display` = Bricolage Grotesque
   - `fontFamily.sans` = Instrument Sans
   - `fontFamily.mono` = Space Mono
   - colores `navy` `#050A30`, `aqua` `#86CAC8`, `brillante` `#2E4DB8`, `azul` `#183090`, `paper` `#EEF3FB`, `ink` `#0A0F2C`
   - `--primary` = navy, `--accent` = aqua, `--ring` = brillante, `--background` = paper
3. En componentes usa `bg-navy`, `text-aqua`, `font-display`, `font-mono`. No hex suelto.
4. Dark mode: el fondo oscuro es navy, no un gris inventado.

## Íconos Phosphor

Paquete: `@phosphor-icons/react`.

```tsx
import { ArrowRight } from "@phosphor-icons/react";

<ArrowRight size={24} weight="regular" color="currentColor" />
```

- `weight="regular"` (línea ~2 px). `bold` solo si el trazo se pierde en pequeño.
- Un color: `currentColor` o `aqua` / `brillante` / `navy`. Nunca multicolor ni Material.
- Al editar un archivo que importe `lucide-react`, sustituye esos íconos por Phosphor en el mismo cambio.
- No instales otro set.

## Reglas de implementación

1. Edita el componente o la página que ya cubre el caso.
2. Copy en i18n (es + en).
3. No HTML suelto para rutas. `assets/templates/` es documento o referencia.
4. No toques `supabase/`, migraciones, RLS ni edge functions por diseño.
5. Contacto: `hola@costadigital.org` · WhatsApp `+57 310 390 0986`.

## Portada vs campaña

Si el usuario pide "una landing", pregunta en un solo mensaje si es **rediseñar la portada** o **una campaña**. Campaña = página nueva + ruta + i18n + `SEOHead` + playbook. Portada = secciones en `src/components/landing/`, con la marca de este skill (no el teal/Inter viejo).
