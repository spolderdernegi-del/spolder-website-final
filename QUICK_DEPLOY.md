# Quick Deploy Reference

**Vercel Environment Variables to Add:**

```
Variable 1:
  Name:  VITE_SUPABASE_URL
  Value: https://exjexjkqxzfbbopsfxvp.supabase.co

Variable 2:
  Name:  VITE_SUPABASE_PUBLISHABLE_KEY
  Value: sb_publishable_zKqJFYVQTOFGwxbb2hI7oA_UnGrbWFF
```

**Steps:**
1. Vercel Dashboard → spolder-website-final project
2. Settings → Environment Variables
3. Add both variables with Production environment
4. Save & Redeploy
5. Wait ~2 min for build
6. Test at: https://spolder-website-final.vercel.app/admin

**Test Credentials:**
- Email: admin@spolder.org
- Password: spolder2024

**Check After Deploy:**
- Homepage loads
- /admin/login works
- Create test event → appears on homepage slider
- Taslak content hidden from public pages
