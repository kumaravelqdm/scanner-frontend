# Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to get these values:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key
4. Paste them into your `.env.local` file

## 2. Database Setup

Run the SQL migration files in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the files in this order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions.sql`

## 3. Install Dependencies

Make sure you have all required packages installed:

```bash
npm install
```

If you need to install Tailwind CSS:

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Test the Application

1. Open your browser to `http://localhost:5173`
2. You should see a setup warning if environment variables are missing
3. Once configured, you can:
   - Sign up for a new account
# Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to get these values:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key
4. Paste them into your `.env.local` file

## 2. Database Setup

Run the SQL migration files in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the files in this order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions.sql`

## 3. Install Dependencies

Make sure you have all required packages installed:

```bash
npm install
```

If you need to install Tailwind CSS:

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Test the Application

1. Open your browser to `http://localhost:5173`
2. You should see a setup warning if environment variables are missing
3. Once configured, you can:
   - Sign up for a new account
   - Generate API keys
   - View the dashboard
   - Track your scan usage

## Troubleshooting

### PostCSS Error
If you see a PostCSS error about Tailwind CSS, make sure you have the correct packages:
- `@tailwindcss/postcss` (not just `tailwindcss`)
- `postcss`
- `autoprefixer`

### Import Errors
If you see module import errors, make sure:
1. All dependencies are installed
2. Environment variables are set
3. The development server is running

### Database Errors
If you see database-related errors:
1. Check that migrations have been run
2. Verify your Supabase credentials
3. Ensure RLS policies are enabled
   - Generate API keys
   - View the dashboard

## Troubleshooting

### PostCSS Error
If you see a PostCSS error about Tailwind CSS, make sure you have the correct packages:
- `@tailwindcss/postcss` (not just `tailwindcss`)
- `postcss`
- `autoprefixer`

### Import Errors
If you see module import errors, make sure:
1. All dependencies are installed
2. Environment variables are set
3. The development server is running

### Database Errors
If you see database-related errors:
1. Check that migrations have been run
2. Verify your Supabase credentials
3. Ensure RLS policies are enabled
