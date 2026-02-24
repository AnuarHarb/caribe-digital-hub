# AI Curriculum Assistant

Edge Function que actúa como proxy hacia la API de Google Gemini para analizar currículums y dar recomendaciones.

## Despliegue

1. Configura el secret con tu API key de Gemini:

```bash
supabase secrets set GEMINI_API_KEY=tu_api_key_aqui
```

2. Despliega la función:

```bash
supabase functions deploy ai-curriculum-assistant
```

## Uso

La función recibe en el body:
- `curriculum`: Objeto con perfil, professionalProfile, skills, experience, education
- `message`: Mensaje/pregunta del usuario

Requiere autenticación (header `Authorization: Bearer <jwt>`).
