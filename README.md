
# Forces Dominate

## Overview

Forces Dominate is a modern React app built with Vite, TypeScript, shadcn/ui, and Tailwind CSS. It features a robust authentication UI supporting both email/password and magic link (passwordless) login via Supabase, with full error and loading state handling. The app is designed for seamless deployment to Azure Static Web Apps.

---

## Features

- **Authentication UI**: Sign up/sign in with email/password or magic link (Supabase OTP)
- **Loading & Error Handling**: User feedback for all auth actions
- **Protected Routes**: Example demo page for authenticated users
- **Responsive Design**: Built with shadcn/ui and Tailwind CSS
- **SPA Routing**: Configured for Azure Static Web Apps

---

## Local Development

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
4. **Start the dev server:**
   ```sh
   npm run dev
   ```

---

## Authentication & Supabase Setup

- Create a [Supabase](https://supabase.com/) project
- Get your Project URL and anon public key from Supabase dashboard
- Add them to your `.env` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- The Auth UI supports both email/password and magic link (OTP) login

---

## Deployment: Azure Static Web Apps

This project is ready for deployment to Azure Static Web Apps (SWA).

### Key Notes:
- **Node.js 20+ is required** (see `.nvmrc`)
- The build command must be set to `npm run build` in your workflow or Azure portal
- SPA routing is enabled via `staticwebapp.config.json`
- Required environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### GitHub Actions Workflow
The repo includes a pre-configured workflow for Azure SWA deployment. If you customize, ensure:

```yaml
app_build_command: "npm run build"
```

### Troubleshooting
- If deployment fails, check:
  - Node.js version in workflow matches `.nvmrc`
  - `app_build_command` is set
  - All required environment variables are present in Azure portal or GitHub secrets
- For SPA routing issues, verify `staticwebapp.config.json` is present and correct

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/azure/static-web-apps/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)

---

## Credits

Created by RaaHTecH-Org. Powered by open source.
