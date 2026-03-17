# Email Templates for Costa Digital

Plantillas de correo con el logo y colores de Costa Digital:
- **Primary:** `#153a5b` (azul oscuro)
- **Secondary:** `#1e4a6f` (azul medio)
- **Accent:** `#2dd4bf` (turquesa)
- **Background:** `#e8f4f8` (azul claro)

## Confirmar correo Template

The `confirmar-correo.html` template is designed for Supabase's **Confirm signup** email (verificación al registrarse).

### Setup in Supabase Dashboard

1. Go to **Authentication** > **Email Templates**
2. Select **Confirm signup**
3. Copy the contents of `confirmar-correo.html` and paste into the template body
4. (Optional) Change the subject to: `Confirma tu correo - Costa Digital`
5. Ensure **Site URL** is set correctly in **Authentication** > **URL Configuration** (e.g. `https://yourdomain.com`)
6. Add your domain to **Redirect URLs** if using a custom callback path

## Reset Password Template (Restablecer contraseña)

The `reset-password.html` template is designed for Supabase's **Reset password** email.

### Setup in Supabase Dashboard

1. Go to **Authentication** > **Email Templates**
2. Select **Reset password**
3. Copy the contents of `reset-password.html` and paste into the template body
4. (Optional) Change the subject to: `Restablecer contraseña - Costa Digital`
5. Ensure **Site URL** is set correctly in **Authentication** > **URL Configuration**

### Template Variables (Supabase)

- `{{ .ConfirmationURL }}` — Full reset link (required)
- `{{ .SiteURL }}` — Your app's base URL (used for logo)
- `{{ .Email }}` — User's email address
- `{{ .Token }}` — 6-digit OTP (if using OTP flow)
- `{{ .RedirectTo }}` — Redirect URL passed when `resetPasswordForEmail` is called

## Magic Link Template (Inicio de sesión)

The `magic-link.html` template is designed for Supabase's **Magic Link** email (inicio de sesión sin contraseña).

### Setup in Supabase Dashboard

1. Go to **Authentication** > **Email Templates**
2. Select **Magic Link**
3. Copy the contents of `magic-link.html` and paste into the template body
4. (Optional) Change the subject to: `Inicia sesión en Costa Digital`
5. Ensure **Site URL** is set correctly in **Authentication** > **URL Configuration**

### Template Variables (Supabase)

- `{{ .ConfirmationURL }}` — Full magic link (required)
- `{{ .SiteURL }}` — Your app's base URL (used for logo)
- `{{ .Email }}` — User's email address
- `{{ .Token }}` — 6-digit OTP (if using OTP flow)
- `{{ .RedirectTo }}` — Redirect URL passed when `signInWithOtp` is called

### Logo

The template references the logo at `{{ .SiteURL }}/logos/costa-digital.png`. Ensure the logo is deployed to your `public/logos/` folder so it loads in emails.
