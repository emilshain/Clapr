# How to Deploy Clapr

## Option 1: Deploy Everything to Vercel (Easiest)

### Step 1: Push to GitHub

```bash
cd clapr
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repo (`emilshain/Clapr`)
4. Click **Import**

### Step 3: Add Environment Variables

In the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-...` (your OpenAI API key)
3. Click **Save**

### Step 4: Deploy

Click **Deploy**. Wait 2-3 minutes.

Your app is now live at `https://clapr.vercel.app` (or your custom domain).

---

## Option 2: Deploy Frontend to Vercel + Backend to Railway

Use this if you want more control or want to keep backend separate.

### Frontend to Vercel

Same as Option 1, but skip the environment variable.

### Backend to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create a new project
cd backend
railway init

# 4. Set environment variables
railway variable add OPENAI_API_KEY=sk-...

# 5. Deploy
railway up
```

Railway will give you a URL like `https://clapr-api.railway.app`.

### Update Frontend

In `frontend/.env.production`:

```
VITE_BACKEND_URL=https://clapr-api.railway.app
```

Redeploy frontend to Vercel.

---

## Option 3: Deploy Separately (Maximum Control)

### Frontend: Vercel

```bash
# Same as Option 1
```

### Backend: Railway, Render, or Fly.io

**Railway:**
```bash
railway up
```

**Render:**
1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Add environment variable: `OPENAI_API_KEY`
6. Deploy

**Fly.io:**
```bash
# Install Fly CLI, then:
fly auth login
fly launch
fly deploy
```

---

## Troubleshooting

**"Backend not found"**
- Check `VITE_BACKEND_URL` env var is set correctly in Vercel
- Make sure `OPENAI_API_KEY` is set in backend deployment

**"OpenAI API Error"**
- Verify `OPENAI_API_KEY` is valid
- Check it has quotes removed: should be just `sk-...` not `"sk-..."`

**"CORS Error"**
- Frontend and backend on same domain (Vercel) = automatic
- Different domains = check `FRONTEND_ORIGIN` env var in backend

---

## Recommended: Just Use Vercel (Option 1)

Simplest, free tier covers this project, both frontend and backend on same domain = no CORS issues.
