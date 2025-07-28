# Deployment Troubleshooting Guide

## GitHub Actions Deployment Failure - Fix Applied ✅

### Problem Identified
The GitHub Actions workflow was failing due to Node.js version compatibility issues. The project uses:
- **Vite 7.0.6** which requires Node.js >=20.19.0
- **GitHub Actions** was using an older Node.js version by default

### Solution Applied

#### 1. Updated Azure Static Web Apps Workflow
**File**: `.github/workflows/azure-static-web-apps-witty-grass-0337ffd1e.yml`

**Changes Made**:
- ✅ Added Node.js 20 setup step
- ✅ Added npm caching for faster builds
- ✅ Added environment variables for Supabase

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

#### 2. Created Comprehensive CI/CD Pipeline
**File**: `.github/workflows/azure-cicd.yml`

**Features**:
- ✅ Separate build and deploy stages
- ✅ Staging and production environments
- ✅ Linting and testing steps
- ✅ Artifact management
- ✅ Environment variable support

### Environment Variables Required

Add these secrets to your GitHub repository:

#### Required Secrets:
1. **`AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_GRASS_0337FFD1E`** (already exists)
2. **`VITE_SUPABASE_URL`** - Your Supabase project URL
3. **`VITE_SUPABASE_ANON_KEY`** - Your Supabase anonymous key

#### Optional Secrets for Enhanced Pipeline:
4. **`AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING`** - For staging environment

### How to Add GitHub Secrets:

1. Go to your repository: `https://github.com/RaaHTecH-Org/forces-dominate`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each required secret

### Supabase Configuration:

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**
4. Add them as GitHub secrets

### Expected Build Process:

1. **Build Step**: `npm run build`
   - Compiles TypeScript
   - Bundles with Vite
   - Outputs to `dist/` folder

2. **Deploy Step**: Azure Static Web Apps
   - Takes built files from `dist/`
   - Deploys to Azure CDN
   - Updates DNS routing

### Troubleshooting Steps:

#### If Build Still Fails:

1. **Check Node.js Version**:
   ```yaml
   - name: Check Node.js version
     run: node --version
   ```

2. **Check Environment Variables**:
   ```yaml
   - name: Check env vars
     run: |
       echo "Supabase URL configured: ${{ secrets.VITE_SUPABASE_URL != '' }}"
       echo "Supabase Key configured: ${{ secrets.VITE_SUPABASE_ANON_KEY != '' }}"
   ```

3. **Manual Build Test**:
   ```bash
   npm ci
   npm run build
   ```

#### Common Issues:

- **Missing Environment Variables**: Ensure Supabase secrets are configured
- **TypeScript Errors**: Check for compilation errors in new code
- **Import Errors**: Verify all import paths are correct
- **Dependency Issues**: Ensure all packages are properly installed

### Verification Steps:

After the fix is deployed:

1. ✅ Workflow should complete successfully
2. ✅ Build artifacts should be generated
3. ✅ Azure deployment should succeed
4. ✅ Application should be accessible online

### Next Steps:

1. **Commit and Push** the workflow changes
2. **Add Supabase secrets** to GitHub repository
3. **Monitor** the next deployment
4. **Test** the deployed application

### Files Modified:

- ✅ `.github/workflows/azure-static-web-apps-witty-grass-0337ffd1e.yml`
- ✅ `.github/workflows/azure-cicd.yml` (new)
- ✅ `.env.example` (new)
- ✅ `src/pages/AuthPage.tsx` (enhanced auth)
- ✅ `src/contexts/AuthContext.tsx` (magic link support)

The deployment should now work correctly with the proper Node.js version and environment configuration! 🚀
