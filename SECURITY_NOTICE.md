# 🔐 Security Notice

## Important Information About Your Supabase Credentials

You recently shared your Supabase credentials in our conversation:

- **Supabase URL**: `https://uimdbodamoeyukrghchb.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbWRib2RhbW9leXVrcmdoY2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTYwMzksImV4cCI6MjA4MTAzMjAzOX0.kMFpnaZN04ac94u0wcXJFsS58lX88h8RCM2de3rwYIc`

## ⚠️ Security Recommendation

For security reasons, we strongly recommend that you **rotate (change) your Supabase anon key** as soon as possible since it has been exposed in this conversation.

### How to Rotate Your Supabase Keys:

1. Log in to your Supabase dashboard
2. Go to your project
3. Navigate to **Settings** → **API**
4. Click **Regenerate** next to the Anon key
5. Update your application with the new key

### Why This Is Important:

- The anon key provides access to your Supabase project
- While it has limited permissions, it can still be used to read data from public tables
- Rotating the key ensures that no unauthorized parties can access your data

### Environment Variable Setup:

After rotating your key, make sure to update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://uimdbodamoeyukrghchb.supabase.co
SUPABASE_ANON_KEY=your_new_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🛡️ Best Practices Going Forward:

1. **Never share credentials** in chat conversations or code repositories
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** as a security best practice
4. **Use the service role key** only on the server-side, never in client-side code
5. **Monitor your Supabase logs** for any suspicious activity

## 📋 Testing Your New Configuration:

After updating your keys, you can test your configuration using:

```bash
cd lms-backend
npm run check-env
```

This will verify that your environment variables are properly configured.

If you need any assistance with rotating your keys or updating your configuration, please let me know.