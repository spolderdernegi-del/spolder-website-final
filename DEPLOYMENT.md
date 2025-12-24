# Deployment Checklist

## Pre-Deployment

- [ ] All tests pass locally: `npm run build` ✅
- [ ] Git main branch is clean: `git status` ✅
- [ ] Latest changes pushed: `git push origin main` ✅
- [ ] Supabase migrations applied: `npx supabase db push` ✅

## Vercel Environment Setup

1. Go to Vercel Project Settings → Environment Variables
2. Add the following variables:
   ```
   VITE_SUPABASE_URL=https://exjexjkqxzfbbopsfxvp.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-anon-key>
   ```
3. Save and trigger a redeployment

## Post-Deployment Verification

### Homepage
- [ ] Main page loads without errors
- [ ] HeroSlider displays `showInSlider=true` events/projects
- [ ] Links to sub-pages work

### Public Pages
- [ ] Haberler (News): Only `publishStatus='published'` visible
- [ ] Etkinlikler (Events): Only published events show
- [ ] Blog: Only published posts visible
- [ ] Projeler (Projects): Only published projects visible

### Admin Panel
- [ ] Login page loads (test: admin@spolder.org / spolder2024)
- [ ] Create new event/news/project → verify in DB and homepage
- [ ] Toggle publish status → verify filtering on public pages
- [ ] Bulk delete → verify records removed
- [ ] Media Library: Upload image → verify in DB
- [ ] Ayarlar (Settings): Change password → verify in `settings` table

### Data Integrity
- [ ] No localStorage data is being written (check browser DevTools → Application)
- [ ] All reads/writes go through Supabase
- [ ] Multi-device sync: Open admin on two devices → verify changes sync

## Rollback Plan

If issues occur:
1. Revert to previous deploy: Click "Rollback" in Vercel Deployments tab
2. Or roll back migration locally: `npx supabase migration list && npx supabase migration down`

## Notes

- **Auth:** Currently using simple email/password. Consider adding Supabase auth sign-ups in future.
- **Media/Files:** Currently base64 stored in DB. For production scale, migrate to Supabase Storage buckets.
- **RLS:** SELECT is public; INSERT/UPDATE/DELETE require authentication.
