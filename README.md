# Dexter Cashflow 💰

A modern, mobile-first financial tracking web application built with Next.js, TypeScript, and Material-UI.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, and Delete financial transactions
- 📊 **Data Visualization**: Interactive charts showing income vs expenses and category breakdowns
- 📱 **Mobile Responsive**: Optimized for mobile devices with touch-friendly interface
- 🎨 **Modern UI**: Built with Material-UI Dashboard template
- 💾 **Local Storage**: Data persists in browser localStorage
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 📈 **Real-time Calculations**: Automatic balance and summary calculations

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Charts**: MUI X Charts
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Hooks
- **Styling**: Emotion (CSS-in-JS)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd dexter-cashflow
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## Data Storage

Data is stored locally in the browser's localStorage. This means:
- Data persists across browser sessions
- Data is device-specific (not synced across devices)
- Clearing browser data will delete all transactions
- No backend server required

## Future Enhancements

Potential features for future versions:
- Cloud storage and multi-device sync
- User authentication
- Export to CSV/Excel
- Budget planning and alerts
- Recurring transactions
- Multiple currency support
- Advanced filtering and reporting

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and Material-UI
