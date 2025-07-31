# Railway Deployment Guide

## Environment Variables Setup

Railway requires environment variables to be set in the project dashboard. 

### Required Variables

1. **VITE_SUPABASE_URL**
   - Get from: Supabase Dashboard > Settings > API > Project URL
   - Example format: `https://your-project-id.supabase.co`
   - **Important**: Never commit this value to your repository

2. **VITE_SUPABASE_ANON_KEY**
   - Get from: Supabase Dashboard > Settings > API > Project API keys > anon public
   - Example format: `eyJhbGciOiJIUzI1NiIsInR5cCI...` (JWT token)
   - **Important**: This is a public key but should still not be committed to avoid abuse

### How to Set Variables in Railway

1. Go to your [Railway Dashboard](https://railway.app/dashboard)
2. Click on your project
3. Click on your service (usually named after your GitHub repo)
4. Navigate to the **"Variables"** tab
5. Click **"Add Variable"**
6. Add each variable:
   - Variable name: `VITE_SUPABASE_URL`
   - Value: Your Supabase URL (from your Supabase dashboard)
7. Repeat for `VITE_SUPABASE_ANON_KEY`
8. Railway will automatically redeploy after adding variables

### Security Best Practices

1. **Never commit environment files**
   - `.env`, `.env.production`, and `.env.local` should never be in your repository
   - These files are listed in `.gitignore`

2. **Use environment-specific values**
   - Development: Use local Supabase instance or development project
   - Production: Use production Supabase project with proper security rules

3. **Rotate credentials if exposed**
   - If credentials are accidentally committed, rotate them immediately in Supabase
   - Generate new anon keys if needed

4. **Monitor usage**
   - Check Supabase dashboard regularly for unusual activity
   - Set up alerts for rate limits or suspicious patterns

### Troubleshooting

If you see "placeholder.supabase.co" errors:
- This means the environment variables are not being read
- Check the Railway deployment logs
- Ensure variables are named exactly as shown (case-sensitive)
- Try redeploying manually after setting variables

### Build Configuration

Railway uses the `railway.json` file for build configuration:
- Build command: `npm run build`
- Start command: `npm run start`

The build process needs the VITE_ variables at build time, not runtime.

### Local Development

For local development:
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Never commit the `.env` file

### Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security-best-practices)
- [Railway Environment Variables Documentation](https://docs.railway.app/develop/variables)