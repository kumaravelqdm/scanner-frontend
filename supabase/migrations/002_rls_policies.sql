-- -------------------------------
-- Row Level Security (RLS) Policies
-- -------------------------------

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table api_keys enable row level security;
alter table scan_logs enable row level security;
alter table scan_metadata enable row level security;
alter table usage_stats enable row level security;
alter table audit_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
    for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
    for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
    for insert with check (auth.uid() = id);

-- API Keys policies
create policy "Users can view own api keys" on api_keys
    for select using (auth.uid() = user_id);

create policy "Users can create own api keys" on api_keys
    for insert with check (auth.uid() = user_id);

create policy "Users can update own api keys" on api_keys
    for update using (auth.uid() = user_id);

create policy "Users can delete own api keys" on api_keys
    for delete using (auth.uid() = user_id);

-- Scan Logs policies
create policy "Users can view own scan logs" on scan_logs
    for select using (auth.uid() = user_id);

create policy "Users can create own scan logs" on scan_logs
    for insert with check (auth.uid() = user_id);

-- Scan Metadata policies
create policy "Users can view own scan metadata" on scan_metadata
    for select using (
        exists (
            select 1 from scan_logs 
            where scan_metadata.scan_log_id = scan_logs.id 
            and scan_logs.user_id = auth.uid()
        )
    );

create policy "Users can create own scan metadata" on scan_metadata
    for insert with check (
        exists (
            select 1 from scan_logs 
            where scan_metadata.scan_log_id = scan_logs.id 
            and scan_logs.user_id = auth.uid()
        )
    );

-- Usage Stats policies
create policy "Users can view own usage stats" on usage_stats
    for select using (auth.uid() = user_id);

create policy "Users can create own usage stats" on usage_stats
    for insert with check (auth.uid() = user_id);

create policy "Users can update own usage stats" on usage_stats
    for update using (auth.uid() = user_id);

-- Audit Logs policies
create policy "Users can view own audit logs" on audit_logs
    for select using (auth.uid() = user_id);

create policy "Users can create own audit logs" on audit_logs
    for insert with check (auth.uid() = user_id);
