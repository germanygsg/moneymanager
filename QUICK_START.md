# 🚀 Quick Setup Guide

## Step-by-Step Setup (5 minutes)

### 1. Set Up Database (Choose One)

**Option A: Neon.tech (Recommended - Free)**
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string

**Option B: Supabase (Free)**
1. Go to https://supabase.com
2. Create new project
3. Get database URL from Settings → Database

**Option C: Local PostgreSQL**
```bash
# Install PostgreSQL, then:
createdb moneymanager
```

### 2. Configure Environment

Create `.env` file:
```bash
# Windows PowerShell
New-Item .env

# Or just create it manually in the root folder
```

Add these lines to `.env`:
```env
DATABASE_URL="your-connection-string-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-random-string-here"
```

Generate secret:
```bash
# Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use any random 32+ character string
```

### 3. Initialize Database

```bash
npm run db:push
npm run db:generate
```

### 4. Start App

```bash
npm run dev
```

Open http://localhost:3000 🎉

## First Time Use

1. **Sign Up** - Create your account
2. **Explore** - You'll have a default ledger with categories
3. **Add Transactions** - Start tracking your finances
4. **Invite** - Go to Settings to invite collaborators

## Deploy to Vercel (Production)

1. **Push to GitHub**
```bash
git add .
git commit -m "Add authentication"
git push
```

2. **Deploy on Vercel**
   - Go to vercel.com
   - Import your GitHub repo
   - Add Postgres database (in Storage tab)
   - Add environment variables:
     - `NEXTAUTH_SECRET` - generate with: `openssl rand -base64 32`
     - `NEXTAUTH_URL` - your vercel URL (e.g., https://myapp.vercel.app)
   - Deploy!

3. **Initialize Production Database**
   - After first deploy, go to Vercel project
   - Open "Deployments" tab
   - Click on latest deployment
   - Open terminal/console
   - Run: `npx prisma db push`

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run db:studio        # Open database GUI

# Database
npm run db:push          # Update database schema
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Create migration

# Deployment
npm run build            # Build for production
npm run start            # Start production server
```

## 🆘 Troubleshooting

**Can't connect to database?**
- Check DATABASE_URL is correct
- For cloud databases, ensure IP is whitelisted
- Test connection string in Prisma Studio: `npm run db:studio`

**Prisma Client errors?**
- Run: `npm run db:generate`
- Restart dev server

**Build fails?**
- Ensure all env variables are set
- Check that DATABASE_URL is accessible
- Run: `npm run db:push` first

**Forgot to create .env?**
- Create it in root directory
- Restart dev server after adding env vars

## 📚 Full Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was implemented
- **[README.md](README.md)** - Project overview

## 🎯 What You Get

✅ User authentication (sign up/sign in)
✅ Personal ledger with default categories  
✅ Collaborate by inviting users
✅ Cloud storage (PostgreSQL)
✅ Multi-currency support
✅ All your data synced across devices
✅ Export/import capabilities

---

**Need help?** Check the detailed guides in the documentation files above!
