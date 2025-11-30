# Vercel Domain Configuration Guide

## Your Assigned Domains

You have **3 domains** assigned to your Vercel project:

1. **Production Domain**: `xtension-alpha.vercel.app` ⭐ (Use this for production)
2. **Git Branch Domain**: `xtension-git-main-srivatsavavuppalas-projects.vercel.app` (main branch)
3. **Preview Domain**: `xtension-r0rz0f093-srivatsavavuppalas-projects.vercel.app` (preview deployment)

## 🎯 Which Domain to Use?

### For Production:
- **Use**: `xtension-alpha.vercel.app`
- This is your stable production domain
- Always points to your production deployment

### For Development/Testing:
- Use the preview domains for testing new features
- They automatically update with each deployment

## 🔧 Configuration Steps

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project dashboard:
1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

#### For Production Domain:
```
VERCEL_ALLOWED_DOMAIN=xtension-alpha.vercel.app
```

#### For All Domains (if you want to allow all):
```
ALLOWED_ORIGINS=https://xtension-alpha.vercel.app,https://xtension-git-main-srivatsavavuppalas-projects.vercel.app,https://xtension-r0rz0f093-srivatsavavuppalas-projects.vercel.app
```

#### For Extension Configuration:
```
VERCEL_API_BASE=https://xtension-alpha.vercel.app
```

### Step 2: Update Extension Code

The extension (`popup.js`) needs to know which API endpoint to use. You have two options:

#### Option A: Use Environment Variable (Recommended)
The extension will read from Chrome storage or use a default.

#### Option B: Hardcode Production Domain
Update `popup.js` line 1523 to use:
```javascript
'https://xtension-alpha.vercel.app/api/'
```

### Step 3: Deploy

After setting environment variables:
```bash
vercel --prod
```

## 📝 Domain Breakdown

### `xtension-alpha.vercel.app`
- **Type**: Production domain
- **Purpose**: Main API endpoint
- **Stability**: Always available
- **Use for**: Production extension, public API

### `xtension-git-main-srivatsavavuppalas-projects.vercel.app`
- **Type**: Git branch domain
- **Purpose**: Points to main branch
- **Stability**: Updates with main branch deployments
- **Use for**: Testing main branch changes

### `xtension-r0rz0f093-srivatsavavuppalas-projects.vercel.app`
- **Type**: Preview deployment
- **Purpose**: Specific deployment preview
- **Stability**: Temporary, changes with each deployment
- **Use for**: Testing specific PRs/commits

## 🔐 CORS Configuration

The backend (`backend.py`) now supports domain restriction via:

1. **`VERCEL_ALLOWED_DOMAIN`** - Single domain (e.g., `xtension-alpha.vercel.app`)
2. **`ALLOWED_ORIGINS`** - Multiple domains (comma-separated)

### Example Configurations:

**Restrict to production only:**
```bash
VERCEL_ALLOWED_DOMAIN=xtension-alpha.vercel.app
```

**Allow all Vercel domains:**
```bash
ALLOWED_ORIGINS=https://xtension-alpha.vercel.app,https://xtension-git-main-srivatsavavuppalas-projects.vercel.app
```

**Allow everything (development):**
```
# Leave both variables unset - defaults to "*"
```

## 🚀 Quick Setup

1. **In Vercel Dashboard:**
   - Settings → Environment Variables
   - Add: `VERCEL_ALLOWED_DOMAIN` = `xtension-alpha.vercel.app`
   - Add: `VERCEL_API_BASE` = `https://xtension-alpha.vercel.app` (optional)

2. **Update Extension:**
   - Change hardcoded URL in `popup.js` to use production domain
   - Or use Chrome storage to configure dynamically

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

## 🧪 Testing

Test your endpoints:

```bash
# Production API
curl https://xtension-alpha.vercel.app/api/

# RAG API
curl https://xtension-alpha.vercel.app/api/rag/
```

## 📌 Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Settings** → **Domains** in Vercel
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Update `VERCEL_ALLOWED_DOMAIN` to include your custom domain
4. Update extension to use custom domain

## ⚠️ Important Notes

- **Production domain** (`xtension-alpha.vercel.app`) is the most stable
- **Preview domains** change with each deployment
- Always use HTTPS in production
- Update CORS settings when adding new domains
- Test CORS restrictions before deploying to production
