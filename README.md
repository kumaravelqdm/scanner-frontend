# QR/Barcode Scanner - Personal API Management

A modern web application for managing QR/Barcode scanning operations with user-based access, built with React, TypeScript, Supabase, Material UI, and TailwindCSS.

## ✨ Recent Improvements

- 🎨 **Modern UI**: Redesigned login/signup pages with Material UI components
- 🌊 **Enhanced Styling**: Fixed TailwindCSS v4 configuration for better integration
- 🗄️ **Simplified Database**: Streamlined schema focused on user-based access
- 🔐 **Better Auth**: Enhanced authentication store with better error handling
- 📱 **Responsive Design**: Mobile-first design with gradient backgrounds
- 🛡️ **Enhanced Security**: Comprehensive RLS policies and audit logging
- ⚡ **Performance**: Optimized with proper indexing and query patterns
- 🚀 **Simplified Architecture**: Removed multi-tenant complexity for direct user access

## Features

- 🔐 **Modern Authentication**: Beautiful login/signup forms with Material UI
- 🔑 **API Key Management**: Secure API key generation and management per user
- 📊 **Usage Analytics**: Personal usage statistics and scan history
- 🛡️ **Enterprise Security**: Row Level Security with user-based policies
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🎨 **Modern Design**: Material UI components with custom theme
- 🌐 **Real-time Updates**: Live data synchronization with Supabase

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Framework**: Material UI (MUI) + TailwindCSS v4
- **State Management**: Zustand with persistence
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Real-time)
- **Icons**: Material UI Icons
- **Build Tool**: Vite with optimized configuration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Migrations

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref your-project-ref`
3. Run migrations: `supabase db push`

Or manually run the SQL files in the `supabase/migrations/` directory in your Supabase SQL editor in order:
- `001_initial_schema.sql`
- `002_rls_policies.sql`
- `003_functions.sql`

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

The application includes a streamlined database structure with:

### Core Tables
- **profiles**: User profiles with automatic creation on signup
- **api_keys**: Personal API key management with usage tracking
- **scan_logs**: Comprehensive scan tracking with metadata
- **scan_metadata**: Additional scan information (geo, device, etc.)
- **usage_stats**: Daily usage analytics per user
- **audit_logs**: Complete audit trail for user operations

### Key Features
- **Automatic Profile Creation**: Triggers create profiles on signup
- **User-Based Access**: Direct user ownership without tenant complexity
- **Comprehensive Indexing**: Optimized for high-performance queries
- **Data Integrity**: Foreign key constraints and check constraints
- **Audit Logging**: Function-based audit trail for all operations

## API Usage

Simple API key system for personal use:

```bash
curl -X POST https://your-api-endpoint.com/scan \
  -H "X-API-Key: your_access_key" \
  -H "X-API-Secret: your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "scanned_code": "QR_CODE_DATA",
    "scan_type": "QR",
    "scan_result": "decoded_result",
    "device_info": {
      "browser": "Chrome",
      "os": "macOS"
    }
  }'
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── ProtectedRoute.tsx
│   └── SetupCheck.tsx
├── pages/              # Page components
│   ├── Login.tsx       # Material UI login form
│   ├── Signup.tsx      # Material UI signup form
│   ├── Dashboard.tsx
│   └── KeyManagement.tsx
├── store/              # Zustand stores
│   ├── authStore.ts    # Enhanced auth management
│   └── userStore.ts    # User data management
├── theme/              # Material UI theme
│   └── muiTheme.ts    # Custom theme configuration
├── types/              # TypeScript definitions
│   └── database.ts    # Simplified database types
├── lib/                # Utilities and configurations
│   └── supabase.ts
└── App.tsx             # Main app with theme provider

supabase/
└── migrations/         # Database migration files
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    └── 003_functions.sql
```

## UI/UX Improvements

### Material UI Integration
- Custom theme with consistent color palette
- Responsive design with breakpoint-aware layouts
- Elegant form validation and error handling
- Loading states with smooth animations
- Professional gradients and shadows

### Enhanced Authentication
- Password strength indicator
- Form validation with real-time feedback
- Terms and conditions checkbox
- Mobile-optimized layouts
- Improved error messaging

### TailwindCSS v4 Support
- Fixed PostCSS configuration
- Updated import syntax
- Enhanced color palette
- Better typography system

## Security Features

- **User-Based RLS Policies**: Comprehensive row-level security per user
- **API Key Security**: Hashed storage with usage tracking
- **Audit Logging**: Complete operation tracking
- **Session Management**: Secure token handling
- **Data Validation**: Input sanitization and validation

## Performance Optimizations

- **Database Indexing**: Optimized query performance for user-based access
- **State Persistence**: Zustand with localStorage
- **Lazy Loading**: Component-level code splitting
- **Bundle Optimization**: Vite configuration for minimal bundles
- **Caching Strategy**: Supabase query optimization

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Ensure Material UI theme consistency
6. Submit a pull request with detailed description

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the GitHub repository.`