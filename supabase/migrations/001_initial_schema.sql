-- -------------------------------
-- Supabase DB: Simple QR/Barcode Scanner
-- Using Supabase Auth for users
-- -------------------------------

-- 1. Profile table (linked to auth.users)
create table if not exists profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name varchar(255),
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- 2. API Keys table
create table if not exists api_keys (
    id bigserial primary key,
    user_id uuid references profiles(id) on delete cascade,
    name varchar(255) not null,
    access_key varchar(255) unique not null,
    secret_hash varchar(255) not null,
    status varchar(20) default 'active' check (status in ('active', 'revoked')),
    created_at timestamp default now(),
    last_used_at timestamp,
    usage_count bigint default 0
);

-- 3. Scan Logs table
create table if not exists scan_logs (
    id bigserial primary key,
    user_id uuid references profiles(id) on delete cascade,
    api_key_id bigint references api_keys(id) on delete set null,
    scanned_code text not null,
    scan_type varchar(20) check (scan_type in ('QR','BARCODE','OTHER')),
    scan_result text,
    device_info jsonb,
    ip_address varchar(50),
    created_at timestamp default now()
);

-- Indexes for scan_logs
create index if not exists idx_scan_logs_user_created on scan_logs(user_id, created_at);
create index if not exists idx_scan_logs_api_key on scan_logs(api_key_id);

-- 4. Scan Metadata table
create table if not exists scan_metadata (
    id bigserial primary key,
    scan_log_id bigint references scan_logs(id) on delete cascade,
    geo_info jsonb,
    browser varchar(100),
    os varchar(100),
    app_version varchar(50),
    created_at timestamp default now()
);

-- 5. Usage Stats table
create table if not exists usage_stats (
    id bigserial primary key,
    user_id uuid references profiles(id) on delete cascade,
    date date not null,
    scan_count int default 0,
    last_update timestamp default now(),
    unique (user_id, date)
);

-- 6. Audit Logs table
create table if not exists audit_logs (
    id bigserial primary key,
    user_id uuid references profiles(id) on delete set null,
    action varchar(50) not null,  -- e.g., "API_KEY_CREATED", "SCAN_LOGGED"
    meta jsonb,
    created_at timestamp default now()
);
