# Leaders Portal — Setup Guide

## Environment Variables

Add these to your `.env.local` (local dev) and Vercel dashboard (production).

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret for JWT signing. Generate with: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `NEXTAUTH_URL` | Your production URL — `https://1stmeathdunboynescouts.ie` |
| `SANITY_API_READ_TOKEN` | Sanity read-only token (see below) |

`NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are already set.

---

## Step 1 — Create a Google OAuth App

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add **Authorised JavaScript origins**:
   - `http://localhost:3000` (local dev)
   - `https://1stmeathdunboynescouts.ie` (production)
7. Add **Authorised redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://1stmeathdunboynescouts.ie/api/auth/callback/google`
8. Copy the **Client ID** → `AUTH_GOOGLE_ID`
9. Copy the **Client Secret** → `AUTH_GOOGLE_SECRET`

---

## Step 2 — Create a Sanity Read Token

1. Go to [sanity.io/manage](https://sanity.io/manage) → your project
2. Navigate to **API → Tokens**
3. Click **Add API token**
4. Set permissions to **Viewer** (read-only)
5. Copy the token → `SANITY_API_READ_TOKEN`

---

## Step 3 — Add a Leader's Email in Sanity Studio

1. Open Sanity Studio at `/studio`
2. In the left sidebar, click **Leader Profile**
3. Click **+ New Leader Profile**
4. Fill in:
   - **Email** — must exactly match the Google account email (e.g. `john.smith@gmail.com`)
   - **Name** — display name shown in the portal
   - **Role** — their role within the group
   - **Active** — leave checked to grant access
5. Click **Publish**

The leader can now sign in immediately — no restart needed.

To **revoke access**, uncheck **Active** and republish. Their next page load will be redirected.

---

## Step 4 — Vercel Environment Variables

In your Vercel project dashboard → **Settings → Environment Variables**, add:

```
AUTH_SECRET        = <generated secret>
AUTH_GOOGLE_ID     = <from Google Console>
AUTH_GOOGLE_SECRET = <from Google Console>
NEXTAUTH_URL       = https://1stmeathdunboynescouts.ie
SANITY_API_READ_TOKEN = <from Sanity>
```

> **Note**: `NEXTAUTH_URL` is not strictly required in Vercel deployments (Auth.js v5 
> auto-detects it), but setting it explicitly avoids any edge-case redirect issues.

---

## How It Works

```
Leader visits /leaders/dashboard
        │
        ▼
middleware.ts checks JWT cookie
        │
   No session? ──→ /leaders/login  (Google sign-in)
        │                │
        │           Google OAuth completes
        │                │
        │           auth.ts jwt() callback
        │           queries Sanity for email match
        │           stores isAuthorizedLeader + role in JWT
        │
   Has session but isAuthorizedLeader = false? ──→ /leaders/unauthorized
        │
   isAuthorizedLeader = true? ──→ Allow through to dashboard
```

---

## Adding Private Resources

1. Open Sanity Studio at `/studio`
2. Click **Leader Resource → + New Leader Resource**
3. Fill in title, category, body content
4. Optionally attach a file (PDF, Word, etc.)
5. Leave **Restrict to Roles** empty to show to all leaders, or select specific roles
6. Publish — it appears immediately on the dashboard

