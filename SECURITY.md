# Security Policy & Best Practices

## Overview

This document outlines the security measures implemented in the NNCM Church Portal and provides guidance for maintaining security standards.

## Environment Variables

**NEVER commit `.env` files to the repository.** All sensitive credentials must be stored in environment variables.

### Required Environment Variables

```bash
# API Keys
GEMINI_API_KEY=your-gemini-api-key
APP_URL=https://your-deployment-url.com

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Firebase Configuration (if using Firebase)
VITE_FIREBASE_PROJECT_ID=your-firebase-project
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id

# CORS Configuration
ALLOWED_ORIGINS=https://nncm.vercel.app,https://nncm.pages.dev

# Environment
NODE_ENV=production
LOG_LEVEL=info
```

## Backend Security

### CORS Protection
- Only requests from whitelisted origins are accepted
- Configure `ALLOWED_ORIGINS` environment variable
- All API endpoints enforce CORS policies

### Rate Limiting
- **API endpoints**: 100 requests per 15 minutes per user
- **Auth endpoints**: 5 attempts per 15 minutes per IP
- **Gemini AI**: 10 requests per minute per user
- **Export endpoints**: 5 requests per minute per user

### Input Validation
- All API inputs validated with Zod schemas
- Invalid requests return detailed error messages (development) or generic errors (production)
- SQL injection and XSS attacks prevented through validation

### Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Content-Security-Policy` - Strict CSP policies
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer protection

## Database Security (Supabase)

### Row Level Security (RLS)
**All tables have RLS ENABLED with proper policies.**

See `supabase-rls-policies.sql` for complete policy definitions.

### API Key Restrictions
- Use **Supabase Anon Key** only (read-only where applicable)
- Service Role Key is kept secret and only used on backend
- Rotate keys regularly if compromised

### Data Access
- All database queries go through backend API
- Frontend never directly queries the database
- Backend validates all requests with authentication tokens

## Frontend Security

### Production Mode
- Demo/sandbox mode is **disabled in production**
- All users must authenticate with real credentials
- Sensitive data never stored in localStorage without encryption

### Authentication
- JWT tokens are used for session management
- Tokens are stored securely and sent in Authorization headers
- Logout clears all session data

### Data Handling
- Personal information is encrypted at rest in Supabase
- API responses sanitized to prevent XSS
- Error messages don't leak sensitive information

## Deployment Security

### Production Checklist
- [ ] All environment variables configured
- [ ] Firebase and Supabase credentials rotated
- [ ] RLS policies enabled on all tables
- [ ] CORS whitelist updated
- [ ] Demo mode disabled (production build only)
- [ ] SSL/TLS enabled
- [ ] Security headers verified
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Backups configured
- [ ] firebase-applet-config.json deleted from repo

### Continuous Monitoring
- Monitor error logs for suspicious patterns
- Review rate limit violations
- Track failed authentication attempts
- Monitor API response times

## Incident Response

### If Credentials Are Compromised
1. Immediately rotate the compromised credential
2. Review access logs for unauthorized access
3. Check for data exfiltration
4. Update `.env.example` with new placeholder
5. Notify users if personal data was accessed
6. Create security incident report

### If XSS/Injection Attack Is Detected
1. Investigate the source and impact
2. Patch the vulnerability immediately
3. Review and update validation schemas
4. Deploy security update
5. Audit similar code patterns
6. Test for similar vulnerabilities

## Regular Security Tasks

### Weekly
- Review error logs
- Check rate limit usage
- Monitor failed auth attempts

### Monthly
- Review CORS whitelist
- Audit database access patterns
- Check for security updates
- Review new dependencies for vulnerabilities

### Quarterly
- Rotate API keys
- Review and update RLS policies
- Security audit of codebase
- Penetration testing
- Update security documentation

## Reporting Security Issues

If you discover a security vulnerability:
1. **Do NOT** open a public issue
2. Email security details to: security@nncm.org
3. Include detailed description and reproduction steps
4. Allow 48 hours for response
5. Do not disclose vulnerability publicly until patch is released

## Common Security Mistakes to Avoid

❌ **DON'T:**
- Commit `.env` files to repository
- Hardcode API keys in code
- Store sensitive data in localStorage without encryption
- Use demo credentials in production
- Disable RLS for convenience
- Trust frontend validation alone
- Log sensitive user data
- Ignore security warnings from dependencies

✅ **DO:**
- Use environment variables for all secrets
- Validate inputs on both frontend and backend
- Implement proper error handling
- Keep dependencies up to date
- Monitor security advisories
- Conduct regular security audits
- Document security decisions
- Test security measures regularly

## Resources

- [Supabase Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Firebase Security Rules](https://firebase.google.com/docs/security)
- [CWE Top 25](https://cwe.mitre.org/top25/)

## Questions?

For security-related questions, please contact the security team or open an issue in a private channel.
