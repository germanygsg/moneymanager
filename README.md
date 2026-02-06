# MoneyManager - Collaborative Financial Tracker 💰

A modern, multi-user financial tracking web application with real-time collaboration, role-based access control, and comprehensive financial management features.

## ✨ Features

### 🔐 Authentication & Security
- **Secure Authentication**: Username/password with bcrypt hashing (12 rounds)
- **JWT Sessions**: Secure session management via NextAuth.js
- **Protected Routes**: Automatic authentication checks
- **Password Requirements**: Minimum 6 characters, validated server-side

### 👥 Multi-User Collaboration
- **Ledger Sharing**: Invite users by username to collaborate
- **Role-Based Access**: 
  - **Owner**: Full control (rename, currency, invite/remove users)
  - **Editor**: Can add, edit, and delete transactions and categories
  - **Viewer**: Read-only access to all data
- **Activity Logs**: Complete audit trail of all changes in shared ledgers
- **Real-Time Sync**: Changes visible to all users immediately

### 💼 Ledger Management
- **Multiple Ledgers**: Create and manage multiple financial workspaces
- **Easy Switching**: Switch between owned and shared ledgers instantly
- **Currency Support**: 10+ currencies (USD, EUR, GBP, JPY, CNY, INR, IDR, etc.)
- **Ledger Renaming**: Customize ledger names (owner only)
- **Smart Defaults**: New users get a default ledger with 13 categories

### 💰 Transaction Management
- **Full CRUD**: Create, read, update, and delete transactions
- **Rich Details**: Amount, category, description, date, notes
- **Receipt Attachments**: Attach and compress receipt images (WebP format)
- **Smart Filtering**: Filter by date range, category, type, or search text
- **Bulk Operations**: Export data, clear receipts
- **Validation**: Client and server-side validation

### 📊 Reports & Analytics
- **Visual Dashboards**: Overview cards with key metrics
- **Interactive Charts**: 
  - Income vs Expense pie chart
  - Category breakdown bar charts
- **Time-Based Reports**: Filter by week, month, year, or custom range
- **Category Analysis**: See spending patterns by category
- **Real-Time Calculations**: Automatic balance and summary updates

### 📱 Receipt Management
- **Image Attachments**: Attach photos to transactions
- **Auto-Compression**: Images compressed to WebP (max 800px width)
- **Storage Stats**: View total receipts and storage used
- **Bulk Clear**: Remove all receipt images (owner only)
- **Full-Screen View**: Zoom and view receipts in detail

### 🎨 User Experience
- **Mobile-First Design**: Optimized for touch interactions
- **Responsive Layout**: Adapts to mobile, tablet, and desktop
- **Dark Mode**: System-wide theme toggle
- **Bottom Navigation**: Quick access on mobile devices
- **Floating Action Button**: Fast transaction entry
- **Snackbar Notifications**: Immediate feedback for all actions
- **Loading States**: Skeleton screens and progress indicators

## 🛠 Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15+ (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js (JWT strategy) |
| **UI Library** | Material-UI (MUI) v7 |
| **Charts** | MUI X Charts |
| **Forms** | React Hook Form + Zod |
| **Password Hashing** | bcryptjs |
| **Image Compression** | Browser Canvas API |
| **Deployment** | Vercel |
| **Testing** | Jest + React Testing Library |
| **AI Integration** | Supabase MCP (Model Context Protocol) |

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
# Database (Vercel Postgres)
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

3. **Initialize Database**
```bash
npx prisma generate
npx prisma db push
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Open in Browser**

Visit [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Click "Sign Up" and create your account
2. You'll automatically get:
   - A default ledger named "My Ledger"
   - 13 pre-configured categories (5 income, 8 expense)
3. Start adding transactions!
4. Invite collaborators from Settings → Invite User

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[API Documentation](api.md)** | Complete REST API reference for all 16 endpoints with request/response examples |
| **[Database Schema](schema.md)** | Comprehensive database schema with 6 tables, relationships, and indexes |
| **[User Flow & UX](userflow.md)** | User journeys, interaction patterns, and UX guidelines |
| **[Quick Start Guide](QUICK_START.md)** | Step-by-step setup and deployment guide |
| **[MCP Setup Guide](MCP_SETUP.md)** | Supabase Model Context Protocol integration for AI-powered database operations |
| **[MCP Usage Examples](MCP_EXAMPLES.md)** | Example queries and use cases for interacting with the database via MCP |

## 🌐 Deployment to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables
6. Click "Deploy"

**Required Environment Variables:**
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## 📁 Project Structure

```
moneymanager/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (16 endpoints)
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── transactions/   # Transaction CRUD
│   │   │   ├── categories/     # Category CRUD
│   │   │   ├── ledgers/        # Ledger management
│   │   │   ├── ledger/         # Ledger operations & sharing
│   │   │   ├── user/           # User preferences
│   │   │   ├── logs/           # Activity logs
│   │   │   └── receipts/       # Receipt management
│   │   ├── auth/               # Auth pages (signin, signup)
│   │   ├── categories/         # Category management page
│   │   ├── transactions/       # Transaction list page
│   │   ├── reports/            # Reports and analytics
│   │   ├── settings/           # Settings page
│   │   ├── logs/               # Activity logs page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Dashboard (home)
│   ├── components/             # React Components
│   │   ├── Layout/             # AppBar, Sidebar, Navigation
│   │   ├── Dashboard/          # Charts, Cards, Lists
│   │   ├── Forms/              # Transaction & Category forms
│   │   ├── Common/             # Shared components
│   │   ├── Logs/               # Activity log components
│   │   └── Reports/            # Report components
│   ├── contexts/               # React Contexts
│   │   ├── LedgerContext.tsx   # Ledger state management
│   │   └── CurrencyContext.tsx # Currency management
│   ├── hooks/                  # Custom Hooks
│   │   └── useTransactions.ts  # Transaction data hook
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── types.ts            # TypeScript types
│   │   ├── storage.ts          # Default categories
│   │   ├── logger.ts           # Activity logging
│   │   ├── utils.ts            # Helper functions
│   │   └── imageCompression.ts # Receipt compression
│   └── theme/                  # MUI Theme
│       └── theme.ts            # Theme configuration
├── prisma/
│   └── schema.prisma           # Database schema (6 tables)
├── public/                     # Static assets
│   └── logo.png                # App logo
├── api.md                      # API documentation
├── schema.md                   # Database documentation
├── userflow.md                 # UX documentation
├── QUICK_START.md              # Setup guide
├── README.md                   # This file
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
└── vercel.json                 # Vercel config
```

## 🗄️ Database Schema

The application uses **6 tables** in PostgreSQL:

| Table | Description | Key Features |
|-------|-------------|--------------|
| **User** | User accounts | Username (unique), hashed password, preferences |
| **Ledger** | Financial workspaces | Name, currency, owner |
| **LedgerUser** | Sharing junction table | User-ledger relationship, roles |
| **Category** | Income/Expense categories | Name, type, icon, color |
| **Transaction** | Financial transactions | Amount, date, category, receipt |
| **ActivityLog** | Audit trail | Action, user, timestamp, entity |

**Relationships:**
- User → Ledger (1:N, owns)
- User ↔ Ledger (N:M, via LedgerUser)
- Ledger → Category (1:N)
- Ledger → Transaction (1:N)
- Category → Transaction (1:N)

See [schema.md](schema.md) for complete details.

## 🎯 Default Categories

When you sign up, you get **13 default categories**:

### Income (5 categories)
| Category | Icon | Color |
|----------|------|-------|
| Salary | 💼 | Green |
| Freelance | 💻 | Blue |
| Investment | 📈 | Purple |
| Gift | 🎁 | Orange |
| Other Income | 💰 | Teal |

### Expense (8 categories)
| Category | Icon | Color |
|----------|------|-------|
| Food & Dining | 🍔 | Red |
| Transportation | 🚗 | Orange |
| Shopping | 🛒 | Purple |
| Entertainment | 🎬 | Blue |
| Bills & Utilities | 📱 | Orange |
| Healthcare | 🏥 | Teal |
| Education | 📚 | Dark Gray |
| Other Expense | 💸 | Gray |

## 🔌 API Overview

**16 RESTful API Endpoints:**

### Authentication (2)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Transactions (4)
- `GET /api/transactions` - List all
- `POST /api/transactions` - Create
- `PUT /api/transactions/[id]` - Update
- `DELETE /api/transactions/[id]` - Delete

### Categories (4)
- `GET /api/categories` - List all
- `POST /api/categories` - Create
- `PUT /api/categories/[id]` - Update
- `DELETE /api/categories/[id]` - Delete

### Ledgers (5)
- `GET /api/ledgers` - List all ledgers
- `POST /api/ledgers` - Create ledger
- `PATCH /api/ledger/[id]` - Rename ledger
- `PATCH /api/ledger/[id]/currency` - Update currency
- `GET /api/user/ledger` - Get user's first ledger

### Sharing (4)
- `POST /api/ledger/invite` - Invite user
- `GET /api/ledger/invite` - List shared users
- `PATCH /api/ledger/invite/[id]` - Update role
- `DELETE /api/ledger/invite/[id]` - Remove access

### Other (3)
- `GET /api/logs` - Activity logs
- `GET /api/receipts/stats` - Receipt statistics
- `DELETE /api/receipts/stats` - Clear all receipts

See [api.md](api.md) for complete API documentation.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Type checking
npm run type-check
```

## 📱 Mobile Experience

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: 48px minimum tap targets
- **Bottom Navigation**: Quick access to main sections
- **Swipe Gestures**: Swipe to edit/delete transactions
- **Pull to Refresh**: Refresh data with pull gesture
- **PWA Ready**: Can be installed as a Progressive Web App

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Recommended |
| Firefox | Latest | ✅ Supported |
| Safari | Latest | ✅ Supported |
| Edge | Latest | ✅ Supported |

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Sessions**: Secure, stateless authentication
- **CSRF Protection**: Built-in NextAuth protection
- **SQL Injection**: Protected via Prisma ORM
- **XSS Protection**: React's built-in escaping
- **Role-Based Access**: Enforced at API level

## 🤖 AI Integration with Supabase MCP

MoneyManager now supports Supabase's Model Context Protocol (MCP), enabling AI assistants to interact directly with your database and backend services through natural language.

### What You Can Do

- **Query Database**: Ask AI to retrieve transaction data, analyze spending patterns, or generate reports
- **Manage Schema**: Understand table structures, relationships, and indexes through conversational queries
- **Database Operations**: Perform CRUD operations using natural language instead of manual SQL
- **Documentation Access**: Get instant answers about the database schema and project structure

### Quick Start

1. Install an MCP-compatible client (Claude Desktop, VS Code, Cursor, etc.)
2. Add the MCP server configuration from `mcp.json` to your client
3. Authenticate with your Supabase account (or use the project's database URL)
4. Start interacting with your database using natural language

See **[MCP_SETUP.md](MCP_SETUP.md)** for complete setup instructions and usage examples.

## ✅ Completed Features

- ✅ User authentication (signup, signin, sessions)
- ✅ Multi-user collaboration with role-based access
- ✅ Multiple ledger support
- ✅ Ledger sharing (invite, roles, remove)
- ✅ Activity logging for audit trail
- ✅ Transaction CRUD with validation
- ✅ Category CRUD with usage protection
- ✅ Receipt image management (compress, store, clear)
- ✅ Multiple currency support (10+ currencies)
- ✅ Dark mode toggle
- ✅ Mobile-responsive design
- ✅ Export/Import data (JSON)
- ✅ Comprehensive API (16 endpoints)
- ✅ Complete documentation (API, Schema, UX)
- ✅ Supabase MCP integration for AI-powered database operations

## 🔮 Future Enhancements

- 📊 Advanced analytics and trend analysis
- 📅 Budget planning with alerts
- 🔄 Recurring transactions (monthly bills)
- 🏷️ Transaction tags and custom fields
- 📧 Email notifications for shared ledger activity
- 🌍 Internationalization (i18n)
- 📱 Native mobile apps (React Native)
- 💱 Multi-currency transactions
- 📈 Predictive insights and AI suggestions
- 🔗 Bank account integration
- 📄 PDF report generation
- 🔔 Push notifications
- 📊 Custom report builder

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/moneymanager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/moneymanager/discussions)
- **Email**: support@moneymanager.app

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI powered by [Material-UI](https://mui.com/)
- Database by [Prisma](https://www.prisma.io/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Deployed on [Vercel](https://vercel.com/)

---

**Built with ❤️ for better financial management**

*Last Updated: January 2026*
