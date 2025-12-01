# Multi-User Authentication & Database Migration Guide

This document explains how to set up and deploy the multi-user Money Manager application with authentication and PostgreSQL database.

## Overview

The app now includes:
- ✅ **User Authentication** with NextAuth.js (username/password)
- ✅ **Multi-user Support** with ledger sharing capabilities
- ✅ **PostgreSQL Database** via Prisma ORM
- ✅ **Vercel-ready** for online deployment

## Local Development Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database - Use your local PostgreSQL or a cloud provider
DATABASE_URL="postgresql://username:password@localhost:5432/moneymanager?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
```

**Note**: With Prisma 7, the `DATABASE_URL` is configured in `prisma.config.ts` which reads from your `.env` file.

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Set Up the Database

#### Option A: Use a cloud PostgreSQL (Recommended for testing)
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free tier): https://railway.app

#### Option B: Local PostgreSQL
Install PostgreSQL locally and create a database:
```bash
createdb moneymanager
```

### 4. Initialize the Database

Push the schema to your database:
```bash
npm run db:push
```

Or create a migration:
```bash
npm run db:migrate
```

### 5. Generate Prisma Client

```bash
npm run db:generate
```

### 6. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll be redirected to the sign-in page.

## Deploying to Vercel

### 1. Set Up Vercel Postgres

1. Go to your project on Vercel
2. Navigate to the **Storage** tab
3. Create a new **Postgres** database
4. Vercel will automatically add the `DATABASE_URL` environment variable

### 2. Set Environment Variables on Vercel

Add the following environment variables in your Vercel project settings:

1. **NEXTAUTH_URL**: `https://your-app-name.vercel.app` (your production URL)
2. **NEXTAUTH_SECRET**: Generate a secure random string:
   ```bash
   openssl rand -base64 32
   ```

### 3. Deploy

Push your code to your Git repository, and Vercel will automatically deploy:

```bash
git add .
git commit -m "Add multi-user authentication and PostgreSQL"
git push
```

### 4. Initialize the Production Database

After deployment, you need to push the schema to the production database. You can do this in two ways:

#### Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel env pull .env.local
npx prisma db push
```

#### Option B: Run in Vercel
Add a build command in Vercel that includes:
```
prisma db push --accept-data-loss && next build
```

**Note**: The build script in `package.json` already includes `prisma generate`, which creates the Prisma client.

## Features

### Authentication

- **Sign Up**: New users can create an account with username and password
- **Sign In**: Existing users can log in
- **Sign Out**: Users can log out from the settings page
- **Password Security**: Passwords are hashed using bcrypt (12 rounds)

### Multi-User Ledger Sharing

1. Go to **Settings** page
2. Click **Invite** button in the "Collaboration" section
3. Enter the username of the user you want to invite
4. The invited user will have **editor** access to your ledger
5. You can remove access anytime by clicking the X button next to their name

### Data Model

- **User**: Stores user credentials
- **Ledger**: Each user has a default ledger (can be shared)
- **LedgerUser**: Junction table for sharing ledgers
- **Category**: Income/Expense categories (ledger-specific)
- **Transaction**: Financial transactions (ledger-specific)

## Database Management

### View Database in Prisma Studio

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit data.

### Create a Migration

```bash
npm run db:migrate
```

This creates a new migration file in `prisma/migrations/`.

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

**Warning**: This will delete all data!

## Migration from LocalStorage

The app currently still uses localStorage for the transaction data. To fully migrate to database:

1. Export your current data from Settings → Export Data
2. The data will be available in the database after signing up
3. You can import it back if needed

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify your `DATABASE_URL` is correct
2. Check that your database is running
3. Ensure your IP is whitelisted (for cloud databases)

### Prisma Client Not Found

Run:
```bash
npm run db:generate
```

### Build Fails on Vercel

1. Check that environment variables are set correctly
2. Ensure the database URL is accessible from Vercel
3. Check the build logs for specific errors

## Next Steps

- The current implementation creates a default ledger for each user on signup
- Default categories are automatically created
- You can extend the schema to add more features like:
  - Multiple ledgers per user
  - Different permission levels (viewer, editor, admin)
  - Ledger templates
  - Transaction comments and attachments

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT sessions are used for authentication
- Database queries use Prisma's parameterized queries (SQL injection protection)
- Always use HTTPS in production
- Keep your `NEXTAUTH_SECRET` secure and never commit it to Git
