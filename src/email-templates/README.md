# Email Templates for Costa Digital

## Verify Email Template

The `verify-email.html` template is designed for Supabase's **Confirm signup** email.

### Setup in Supabase Dashboard

1. Go to **Authentication** > **Email Templates**
2. Select **Confirm signup**
3. Copy the contents of `verify-email.html` and paste into the template body
4. Ensure **Site URL** is set correctly in **Authentication** > **URL Configuration** (e.g. `https://yourdomain.com`)
5. Add your domain to **Redirect URLs** if using a custom callback path

### Template Variables (Supabase)

- `{{ .ConfirmationURL }}` — Full verification link (required)
- `{{ .SiteURL }}` — Your app's base URL (used for logo)
- `{{ .Email }}` — User's email address
- `{{ .Token }}` — 6-digit OTP (if using OTP flow)

### Logo

The template references the logo at `{{ .SiteURL }}/logos/costa-digital.png`. Ensure the logo is deployed to your `public/logos/` folder so it loads in emails.
