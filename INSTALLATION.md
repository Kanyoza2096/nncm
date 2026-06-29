# Security Hardening Installation Guide

## Overview

This security hardening update implements multiple layers of protection for the NNCM Church Portal. Follow these steps to apply the changes.

## Step 1: Install New Dependencies

```bash
npm install cors express-rate-limit
npm install --save-dev @types/cors
```

## Step 2: Update Environment Variables

1. Copy `.env.example` to `.env.local` (local development)
2. Fill in all required credentials:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your actual values:

```bash
GEMINI_API_KEY=your-actual-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other variables
```

**NEVER commit `.env.local` to Git!**

## Step 3: Remove Hardcoded Credentials

❌ **DELETE** the following file:
```bash
rm firebase-applet-config.json
```

This file contained hardcoded API keys and is now replaced by environment variables.

## Step 4: Update Server Implementation

1. Replace `server.ts` with `server-updated.ts`:
```bash
cp server-updated.ts server.ts
```

2. Create security middleware file:
```bash
cp server-security.ts ./
```

3. Ensure validation schemas are in place:
```bash
# Already included in src/lib/validation-schemas.ts
```

## Step 5: Enable Supabase RLS Policies

1. Go to your Supabase Dashboard
2. Open the SQL Editor
3. Create a new query and paste the contents of `supabase-rls-policies.sql`
4. Execute the query

**This will:**
- Enable Row Level Security on all tables
- Create access control policies
- Ensure only authorized users can access sensitive data

## Step 6: Update Frontend Authentication

Replace `src/hooks/useAuth.tsx` with the updated version that:
- Disables demo mode in production
- Only allows sandbox mode in development
- Implements proper authentication flow

## Step 7: Configure CORS for Production

Set the `ALLOWED_ORIGINS` environment variable:

```bash
# For Vercel/production
ALLOWED_ORIGINS=https://nncm.vercel.app,https://nncm.pages.dev

# For local development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Step 8: Test Security

### Local Testing

```bash
# Install dependencies
npm install

# Set development environment variables
cp .env.example .env.local
# Edit .env.local with test values

# Run dev server
npm run dev
```

### Test Rate Limiting

```bash
curl -X POST http://localhost:3000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

Make 10+ requests rapidly to verify rate limiting.

### Test CORS

Attempt a request from a non-whitelisted origin - should be rejected.

### Test Input Validation

```bash
# This should fail validation
curl -X POST http://localhost:3000/api/seo \
  -H "Content-Type: application/json" \
  -d '{"title": "", "description": "test"}' # Empty title
```

Expected response: 400 Bad Request with validation error

## Step 9: Deploy to Production

### On Vercel

1. Update environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`

2. Ensure `firebase-applet-config.json` is NOT in the repository:
   ```bash
   # Verify it's not tracked
   git status | grep firebase-applet-config.json
   ```

3. Push the security-hardening branch to main:
   ```bash
   git push origin security-hardening
   git checkout main
   git merge security-hardening
   git push origin main
   ```

4. Vercel will automatically deploy

### On Other Platforms

FollowPlatform-specific documentation for:
- Setting environment variables
- Ensuring `.env*` files are not deployed
- Configuring CORS origins

## Step 10: Verify Production Security

✅ Checklist:

- [ ] Demo mode disabled (can't login with admin@nncm.org/admin123)
- [ ] RLS policies active on Supabase
- [ ] CORS working (requests from other origins rejected)
- [ ] Rate limiting active (too many requests rejected)
- [ ] Firebase using env vars, not hardcoded config
- [ ] Input validation working (invalid requests rejected)
- [ ] Security headers present (check browser dev tools)
- [ ] Error messages are generic (no sensitive info leaked)
- [ ] Logging configured and working

## Troubleshooting

### "CORS policy violation"

- Check `ALLOWED_ORIGINS` environment variable
- Ensure your deployment URL is included
- Verify the header is being sent correctly

### "Too many requests"

- Rate limiting is working correctly
- Wait 15 minutes or adjust limits in server-security.ts

### "Validation failed"

- Check request body format
- Ensure all required fields are present
- Review validation schemas in src/lib/validation-schemas.ts

### "VITE_SUPABASE_URL not configured"

- Verify .env.local file exists and is in .gitignore
- Check environment variables are set in CI/CD platform
- Ensure variables are sourced before npm run build

## Rolling Back (If Needed)

If you need to revert to the previous version:

```bash
git revert <commit-hash-of-security-hardening>

# Or reset to previous commit
git reset --hard <previous-commit-hash>
```

## Support

For issues or questions about security hardening:
1. Check SECURITY.md for detailed information
2. Review error logs for specific issues
3. Contact the development team

## Next Steps

After deployment:
1. Monitor error logs for issues
2. Test all APIs to ensure functionality
3. Verify RLS policies are working
4. Set up automated security monitoring
5. Schedule regular security audits

---

**Last Updated:** 2026-06-29
**Status:** Ready for Production
