# Playbook de landings · Costa Digital

Valores visuales: siempre los de `SKILL.md` y `assets/tokens.css` (navy, aqua, brillante, Bricolage, Instrument, Space Mono, Phosphor). Este archivo habla de estructura y conversión.

La **portada** (`src/pages/Landing.tsx`) no es una landing de campaña. No le apliques la regla de una sola acción ni le agregues tagline palabra por palabra. Si el trabajo es la portada, edita las secciones que ya existen.

## 1. Qué es una landing de campaña

**Una oferta → un público → una acción.** Acciones habituales en esta casa: unirse (`/auth`), escribir por WhatsApp, agendar visita, reservar cupo, hacerse Miembro o Residente, pedir diagnóstico, ser aliado (`hola@costadigital.org`).

## 2. Intake

Reúne esto en un solo mensaje. Si falta, asume, dilo en una línea y sigue.

**Propósito:** ¿cuál es LA acción? ¿Qué recibe? ¿Qué cuenta como conversión?
**Público:** ¿quién? ¿tres objeciones? ¿de dónde llega?
**Pruebas:** cifras de la casa, testimonios con nombre, fotos de sede, logos de aliados.
**Restricciones:** registro (institucional o comunidad), prioridad móvil, ¿indexar?

## 3. Estructura

**Arriba del pliegue**
1. Título: resultado + público.
2. Subtítulo: cómo, con un dato.
3. Un CTA: verbo + lo que recibe.
4. Una prueba: cifra, logo o testimonio corto.
5. Visual: foto real o ilustración de una tinta. Nunca banco de imágenes.

**Medio**
6. Problema → solución.
7. Tres a cinco beneficios por resultado.
8. Cómo funciona: tres pasos.
9. Prueba social.
10. Tagline grande (recomendado en campaña; no en la portada).

**Abajo**
11. Preguntas frecuentes: seis a doce.
12. Reversión de riesgo (diagnóstico gratis, primer día de cowork, pausa).
13. CTA final idéntico al primero.

## 4. Tipos de layout

| Tipo | Úsalo cuando |
|---|---|
| A. Hero + secciones | La oferta se entiende con foto y un párrafo (visita, patio, membresía de sede). |
| B. Historia larga | Hay que educar (software para mipymes, impacto para fundaciones). |
| C. Mínima | Tráfico de alta intención: cupo, drop, taller. |
| D. Comparativa | La búsqueda incluye alternativas (cowork, formación). |

La portada actual es un hub tipo A extendido: no la aplanes a C.

## 5. Conversión

- El título del hero repite la promesa de la fuente de tráfico.
- Un solo CTA principal arriba del pliegue en campañas. La portada puede llevar unirse + explorar + ser aliado.
- Beneficio antes que característica. Específico: "tu primer módulo termina en 8 semanas", no "ahorra tiempo".
- Reduce el riesgo con al menos una garantía real.
- La prueba va al lado de la afirmación que sostiene.

## 6. Copy

Pasa por `voz-y-escritura.md`. Fórmulas:

- "{Resultado} sin {dolor}"
- "La {categoría} para {público}"
- "{Resultado} en {tiempo}"

CTA: "Únete a la comunidad", "Escribir por WhatsApp", "Agendar mi visita", "Reservar cupo", "Sé aliado". Nunca "Saber más", "Enviar", "Contáctanos".

## 7. Orden de construcción

Hero → beneficios → cómo funciona → prueba → preguntas → CTA final. Sección por sección. En este repo: componente en `src/components/landing/` o página nueva + claves i18n.

## 8. SEO

- `noindex` en campañas con fecha (drop, convocatoria cerrada).
- Indexar ofertas permanentes. Título con descriptor: "Membresías · Costa Digital, Centro de Innovación del Caribe".
- Usa `SEOHead`. FAQ en pregunta y respuesta literal.

## 9. Tagline (campañas)

Sección de tipografía grande, separada del hero. Mínimo dos líneas. `font-display` `text-4xl` a `text-6xl`, máximo `max-w-2xl`. Puede activar palabra por palabra con `IntersectionObserver`. Ejemplos: "El talento siempre estuvo aquí. Esta es la casa donde se queda." / "El Caribe se programa. Y se programa desde Barranquilla."

## 10. Motion

Todo movimiento: `700ms cubic-bezier(0.32, 0.72, 0, 1)`. Entrada: `translateY(64px) blur(8px)` con `IntersectionObserver`. Nunca `scroll` sin throttle. Hover: fondo o leve escala (sin sombras). Active: `scale(0.98)`. Focus: anillo en `--brillante`.

## 11. Estados

Hover, active, focus visible, loading (skeleton), empty compuesto, error inline. Sin `alert()`. Sin enlaces a `#`.

## 12. Contenido real

Sin Lorem, sin Juan Pérez, sin empresas inventadas, sin cifras redondas falsas. Aliados reales o hueco `[nombre]`. Avatares distintos. Fechas variadas en noticias.

## 13. Publicación

- Legal en el pie: `/terminos`, `/aviso-de-privacidad` (Ley 1581).
- 404 con marca (`src/pages/NotFound.tsx`).
- Validación de formularios en cliente.
- Favicon del isotipo. `og:image` 1200×630.
- HTML semántico. WhatsApp con `?text=` que diga de qué página viene.

## 14. Entrega (antes de codear una campaña)

1. Esquema de secciones.
2. Copy del hero.
3. Beneficios (3–5).
4. Tres pasos.
5. FAQ (6–12).
6. SEO: indexar o no.
7. Layout A/B/C/D y por qué.

Después, página React + i18n. `assets/templates/landing.html` es solo referencia visual.

## 15. Errores típicos

Demasiados CTAs en una campaña; propuesta vaga; prueba enterrada; romper móvil; fotos de banco; "Contáctanos"; reescribir la portada como si fuera un one-pager; crear HTML fuera de `src/`.
