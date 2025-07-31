# Railway Deployment Guide

## Environment Variables Setup

Railway requires environment variables to be set in the project dashboard. 

### Required Variables

1. **VITE_SUPABASE_URL**
   - Get from: Supabase Dashboard > Settings > API > Project URL
   - Example: `https://your-project.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Get from: Supabase Dashboard > Settings > API > Project API keys > anon public
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI...`

### How to Set Variables in Railway

1. Go to your [Railway Dashboard](https://railway.app/dashboard)
2. Click on your project
3. Click on your service (usually named after your GitHub repo)
4. Navigate to the **"Variables"** tab
5. Click **"Add Variable"**
6. Add each variable:
   - Variable name: `VITE_SUPABASE_URL`
   - Value: Your Supabase URL
7. Repeat for `VITE_SUPABASE_ANON_KEY`
8. Railway will automatically redeploy after adding variables

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
EOF < /dev/null