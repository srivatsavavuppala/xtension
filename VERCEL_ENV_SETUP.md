# Quick Vercel Environment Variables Setup

## 🎯 Required Setup for Your Domains

### Step 1: Go to Vercel Dashboard
1. Open your project: https://vercel.com/dashboard
2. Click on your project: **xtension**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables

#### For CORS Restriction (Backend Security)
```
Name: VERCEL_ALLOWED_DOMAIN
Value: xtension-alpha.vercel.app
Environment: Production, Preview, Development (all)
```

#### Optional: Allow Multiple Domains
If you want to allow all your Vercel domains:
```
Name: ALLOWED_ORIGINS
Value: https://xtension-alpha.vercel.app,https://xtension-git-main-srivatsavavuppalas-projects.vercel.app
Environment: Production, Preview, Development (all)
```

#### For API Keys (Required)
```
Name: GROQ_API_KEY
Value: [your-groq-api-key]
Environment: Production, Preview, Development (all)
```

```
Name: PINECONE_API_KEY
Value: [your-pinecone-api-key]
Environment: Production, Preview, Development (all)
```

```
Name: GITHUB_TOKEN
Value: [your-github-token] (optional but recommended)
Environment: Production, Preview, Development (all)
```

### Step 3: Deploy
After adding variables, redeploy:
```bash
vercel --prod
```

Or trigger a new deployment from Vercel dashboard.

## 📋 Your Domain Configuration

### Production Domain (Use This)
- **Domain**: `xtension-alpha.vercel.app`
- **Status**: ✅ Stable, always available
- **Use for**: Production extension, public API
- **API Endpoints**:
  - Summarization: `https://xtension-alpha.vercel.app/api/`
  - RAG API: `https://xtension-alpha.vercel.app/api/rag/`

### Branch Domain
- **Domain**: `xtension-git-main-srivatsavavuppalas-projects.vercel.app`
- **Status**: Updates with main branch
- **Use for**: Testing main branch changes

### Preview Domain
- **Domain**: `xtension-r0rz0f093-srivatsavavuppalas-projects.vercel.app`
- **Status**: Temporary, changes per deployment
- **Use for**: Testing specific deployments

## ✅ What Changed in Code

1. **`popup.js`** - Now uses `xtension-alpha.vercel.app` as default
2. **`backend.py`** - Supports `VERCEL_ALLOWED_DOMAIN` for CORS restriction
3. **RAG API** - Defaults to production domain

## 🧪 Test Your Setup

After deploying, test:

```bash
# Test summarization API
curl https://xtension-alpha.vercel.app/api/

# Test RAG API
curl https://xtension-alpha.vercel.app/api/rag/
```

## 🔧 Override Domain in Extension (Advanced)

Users can override the API domain in the extension by setting:
```javascript
chrome.storage.local.set({ 
  vercelApiBase: 'https://xtension-alpha.vercel.app' 
});
```

Or for RAG API:
```javascript
chrome.storage.local.set({ 
  ragApiBase: 'https://xtension-alpha.vercel.app' 
});
```
