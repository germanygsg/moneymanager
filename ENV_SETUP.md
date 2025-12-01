# Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/moneymanager?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
```

## For Local Development

1. Set up a PostgreSQL database locally or use a cloud provider
2. Update `DATABASE_URL` with your database connection string
3. Generate a secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

## For Vercel Production

1. Add a Vercel Postgres database to your project
2. Vercel will automatically set `DATABASE_URL`
3. Add `NEXTAUTH_SECRET` in Vercel environment variables:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add: `NEXTAUTH_SECRET` with a secure random string
4. Add `NEXTAUTH_URL` as your production URL (e.g., `https://your-app.vercel.app`)
