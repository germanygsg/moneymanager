# Online Ledger - Financial Tracker 💰

A modern, multi-user financial tracking web application with authentication, collaborative ledgers, and cloud storage.

## ✨ Features

### Core Features
- ✅ **Multi-User Authentication**: Secure sign-up and sign-in with username/password
- 👥 **Ledger Sharing**: Invite other users to collaborate on your ledger
- 📊 **Data Visualization**: Interactive charts showing income vs expenses and category breakdowns
- 💾 **Cloud Storage**: Data stored in PostgreSQL database via Vercel
- 🔒 **Secure**: Passwords hashed with bcrypt, JWT sessions

### Financial Management
- ✅ **CRUD Operations**: Create, Read, Update, and Delete financial transactions
- 📱 **Mobile Responsive**: Optimized for mobile devices with touch-friendly interface
- 💱 **Multi-Currency Support**: Choose from multiple currencies (USD, EUR, IDR, etc.)
- 📈 **Real-time Calculations**: Automatic balance and summary calculations
- 🌓 **Dark Mode**: Toggle between light and dark themes

### Collaboration
- 👤 **User Accounts**: Each user has their own secure account
- 🤝 **Share Ledgers**: Invite collaborators by username
- 🔐 **Access Control**: Manage who can access your ledger
- 💼 **Team Finance**: Perfect for couples, families, or small teams

## 🛠 Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Library**: Material-UI (MUI) v7
- **Charts**: MUI X Charts
- **Forms**: React Hook Form + Zod validation
- **Password Security**: bcryptjs
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone and Install**
```bash
cd moneymanager
npm install
```

2. **Set Up Environment Variables**

Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/moneymanager"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

3. **Initialize Database**
```bash
npm run db:push
npm run db:generate
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Open in Browser**

Visit [http://localhost:3000](http://localhost:3000) - you'll be redirected to sign up!

### First Time Setup

1. Click "Sign Up" and create your account
2. You'll automatically get a default ledger with categories
3. Start adding transactions!
4. Invite collaborators from Settings → Invite User

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete guide for deploying to Vercel
- **[Environment Setup](ENV_SETUP.md)** - Environment variables configuration

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel will automatically detect Next.js and configure the build settings
6. Click "Deploy"

## Project Structure

```
dexter-cashflow/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── Layout/       # Layout components (AppBar, Sidebar)
│   │   ├── Dashboard/    # Dashboard components (Charts, Cards, Lists)
│   │   ├── Forms/        # Form components
│   │   └── Common/       # Shared components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and types
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── storage.ts    # localStorage utilities
│   │   └── utils.ts      # Helper functions
│   └── theme/            # MUI theme configuration
├── public/               # Static assets
└── package.json
```

## Data Structure

Transactions are stored with the following fields:
- **Date**: Transaction date
- **Category**: Transaction category (Food, Transport, Salary, etc.)
- **Description**: Transaction details
- **Amount**: Transaction amount in IDR
- **Type**: Income or Expense

## Default Categories

### Expense Categories
- Food
- Transport
- Shopping
- Entertainment
- Utilities
- Healthcare
- Other

### Income Categories
- Salary
- Business
- Investment

## Features in Detail

### Dashboard
- Overview cards showing total income, expenses, balance, and transaction count
- Pie chart comparing income vs expenses
- Bar chart showing expenses by category
- Top expenses and income sources lists
- Recent transactions list

### Transaction Management
- Add new transactions with validation
- Edit existing transactions
- Delete transactions with confirmation
- Filter by date range, category, and type
- Search transactions

### Mobile Optimization
- Responsive layout that adapts to screen size
- Touch-friendly buttons and interactions
- Floating action button for quick access
- Collapsible sidebar navigation

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 💾 Data Storage

Data is stored in a PostgreSQL database:
- ✅ **Cloud Storage**: Data synced across all your devices
- ✅ **Multi-User**: Each user has their own account and ledger
- ✅ **Collaboration**: Share your ledger with other users
- ✅ **Secure**: All passwords are hashed, data is protected
- ✅ **Persistent**: Data stored safely in Vercel Postgres

## 🎯 Completed Features

- ✅ Cloud storage and multi-device sync
- ✅ User authentication
- ✅ Multi-user collaboration
- ✅ Multiple currency support
- ✅ Export/Import data

## 🔮 Potential Future Enhancements

- 📊 Advanced reporting and analytics
- 📅 Budget planning and alerts
- 🔄 Recurring transactions
- 📁 Multiple ledgers per user
- 🏷️ Transaction tags and notes
- 📧 Email notifications
- 🌍 Multiple language support

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and Material-UI
