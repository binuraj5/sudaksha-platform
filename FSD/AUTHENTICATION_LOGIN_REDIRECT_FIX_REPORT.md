# Login Redirect Fix – Test Report

## Problem

Login pages were redirecting back to the login URL with `callbackUrl` in the query string instead of completing sign-in and redirecting the user to their target page (e.g. `/assessments/clients/[clientId]/dashboard`).

**Example:**
```
http://localhost:3000/assessments/login?callbackUrl=%2Fassessments%2Fclients%2Fcml7htk7x000cma38j2v6bw1y%2Fdashboard
```

User stayed on the login page after submitting valid credentials instead of being sent to the dashboard.

---

## Root Cause

Aligned with **FSD/AUTHENTICATION_ARCHITECTURE.md** and the [NextAuth issue #1264](https://github.com/nextauthjs/next-auth/issues/1264):

- **`signIn(..., { redirect: false })`** was used to control redirects manually.
- With the Credentials provider, `redirect: false` prevents the full auth callback from running.
- The session cookie is set during that callback, so with `redirect: false` the session cookie is never set.
- After sign-in, the code did `window.location.replace(callbackUrl)`.
- The middleware saw no session cookie and redirected back to the login page with `callbackUrl`.

---

## Solution

**Native form POST** instead of `signIn()` JavaScript fetch:

1. The login form uses `action="/api/auth/callback/credentials"` and `method="POST"` for a **native HTML form submission**.
2. This triggers a full page navigation; the browser receives the `Set-Cookie` response and stores it before following the redirect.
3. `signIn()` with fetch (even with `redirect: true`) can fail to persist the session cookie with the Credentials provider.

---

## Changes

### 1. `app/assessments/(auth)/login/page.tsx`

- **Normal flow:** Native form POST to `/api/auth/callback/credentials` with hidden fields `csrfToken`, `callbackUrl`, and visible `email`/`password`. On submit, the form does a programmatic `form.submit()` (after `e.preventDefault()` for validation) so the browser performs a full POST and receives the redirect with `Set-Cookie`.
- **Debug flow:** Still uses `signIn()` with `redirect: false` when `?debug=1` is present.

### 2. `app/assessments/auth/admin/login/page.tsx`

- **Same change:** Use `redirect: true` and `callbackUrl` instead of `redirect: false` plus `window.location.href`.

### 3. `src/lib/auth-config.ts` (unchanged)

- Redirect callback already handles relative `callbackUrl` correctly:

```typescript
async redirect({ url, baseUrl }) {
    if (url.startsWith("/")) return `${baseUrl.replace(/\/$/, "")}${url}`;
    if (new URL(url).origin === new URL(baseUrl).origin) return url;
    return `${baseUrl.replace(/\/$/, "")}/assessments`;
}
```

---

## Verification Steps

1. **Access protected page while logged out**
   - Go to `http://localhost:3000/assessments/clients/[clientId]/dashboard`
   - Should redirect to `/assessments/login?callbackUrl=%2Fassessments%2Fclients%2F[clientId]%2Fdashboard`

2. **Sign in with valid credentials**
   - Enter email and password
   - Click “Sign In”
   - Should redirect to `/assessments/clients/[clientId]/dashboard` (or the intended page) with the session established.

3. **Error handling**
   - Enter invalid credentials
   - Should remain on the login page and show an error message.

4. **Admin login**
   - Go to `/assessments/auth/admin/login`
   - Sign in as Super Admin
   - Should redirect to `/assessments/admin/dashboard` (or the configured `callbackUrl`).

---

## References

- **FSD/AUTHENTICATION_ARCHITECTURE.md** – Recommended flow: single login page, role-based redirects, respect for `callbackUrl`.
- [NextAuth #1264](https://github.com/nextauthjs/next-auth/issues/1264) – Session not set when using `redirect: false` with Credentials provider.
- NextAuth docs: [Client API – signIn](https://next-auth.js.org/getting-started/client#signin) – Recommends `redirect: true` for correct session handling.
