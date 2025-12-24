# Vercel Deployment Guide - SPOLDER Website

## Step 1: Local Pre-Flight Check

Run these commands in your terminal:

```bash
# Verify build works
npm run build

# Check git status
git status

# Should show "working tree clean" - if not, commit first
git log --oneline -5
```

**Expected Output:**
```
✓ 1834 modules transformed.
dist/index.html ... kB
✓ built in ~10s
```

---

## Step 2: Verify Supabase Project Reference

From your Supabase dashboard or .env.local:
- **Project URL:** https://exjexjkqxzfbbopsfxvp.supabase.co
- **Publishable Key:** (Find in Settings → API → anon public key)

---

## Step 3: Add Environment Variables to Vercel

1. Go to: **Vercel Dashboard** → **Projects** → Select `spolder-website-final`

2. Navigate to: **Settings** → **Environment Variables**

3. Click **Add Environment Variable** and fill in:

   **Variable 1:**
   ```
   Name:  VITE_SUPABASE_URL
   Value: https://exjexjkqxzfbbopsfxvp.supabase.co
   Environment: Production
   ```

   **Variable 2:**
   ```
   Name:  VITE_SUPABASE_PUBLISHABLE_KEY
   Value: <paste-your-sb_public_... key here>
   Environment: Production
   ```

4. Click **Save**

---

## Step 4: Trigger Deployment

Option A: **Automatic** (if linked to GitHub)
- Just push to main: `git push origin main`
- Vercel auto-deploys within ~1 minute

Option B: **Manual**
- Vercel Dashboard → **Deployments** → **Redeploy** button

**Wait for:**
```
✓ Build successful
✓ Production deployment ready
```

---

## Step 5: Production Verification

Once deployed (URL will be on Vercel dashboard):

### Test Homepage
```
https://your-vercel-url.vercel.app/
- Load should complete without errors
- HeroSlider should show events/projects with showInSlider=true
```

### Test Public Pages
```
https://your-vercel-url.vercel.app/haberler
- Only publishStatus='published' news visible

https://your-vercel-url.vercel.app/etkinlikler
- Only published events visible

https://your-vercel-url.vercel.app/blog
- Only published posts visible

https://your-vercel-url.vercel.app/projeler
- Only published projects visible
```

### Test Admin Panel
```
https://your-vercel-url.vercel.app/admin/login

Login with:
  Email: admin@spolder.org
  Password: spolder2024

Then test:
- [ ] Create new event → should appear in DB + homepage slider
- [ ] Toggle publish status → should appear/disappear on public page
- [ ] Upload media → should save to Supabase
- [ ] Change password → should save to settings table
```

### Test Multi-Device Sync
```
1. Open admin on Device A
2. Open admin on Device B
3. Create content on Device A
4. Refresh Device B → content should appear instantly
```

---

## Step 6: Troubleshooting

### Env vars not loading
- [ ] Check Vercel Dashboard: Settings → Environment Variables
- [ ] Verify spelling: `VITE_SUPABASE_URL` (exact case)
- [ ] Redeploy after adding vars

### Admin login fails
- [ ] Check browser console for error messages
- [ ] Verify Supabase project is accessible
- [ ] Test credentials: admin@spolder.org / spolder2024

### Public pages show no content
- [ ] Check Supabase Dashboard: Table Browser → news/events/blog/projects
- [ ] Verify records have `publishStatus='published'`
- [ ] Check RLS policies: Auth → Policies (should allow SELECT for all)

### Build failed
- [ ] Check Vercel Deployment Logs for error
- [ ] Run `npm run build` locally to reproduce
- [ ] Fix and push to main again

---

## Step 7: Production Checklist

- [ ] Env vars added to Vercel
- [ ] Build successful
- [ ] Homepage loads
- [ ] All public pages load with published content only
- [ ] Admin login works
- [ ] CRUD operations work
- [ ] Multi-device sync verified
- [ ] No console errors

---

## Live URLs After Deployment

Once live:
- **Homepage:** https://your-vercel-url.vercel.app
- **Admin:** https://your-vercel-url.vercel.app/admin
- **Supabase Dashboard:** https://app.supabase.com/projects/exjexjkqxzfbbopsfxvp

---

## Rollback (if needed)

1. Go to Vercel Dashboard → **Deployments**
2. Find the last known good deployment
3. Click **...** → **Redeploy**

---

## Next Steps (Future)

- [ ] Migrate media/files to Supabase Storage (replace base64)
- [ ] Set up custom domain in Vercel
- [ ] Enable analytics in Vercel
- [ ] Configure automated backups for Supabase

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Check ARCHITECTURE.md for system overview
