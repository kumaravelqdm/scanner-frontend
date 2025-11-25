-- -------------------------------
-- Add metadata column to scan_logs
-- -------------------------------

-- Add metadata column to store custom key-value pairs
alter table scan_logs 
add column if not exists metadata jsonb default '{}'::jsonb;

-- Create index for metadata searches
create index if not exists idx_scan_logs_metadata on scan_logs using gin (metadata);

-- Update log_scan function to accept metadata parameter
create or replace function public.log_scan(
  p_api_key_id bigint,
  p_scanned_code text,
  p_scan_type text,
  p_scan_result text default null,
  p_device_info jsonb default null,
  p_ip_address text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint as $$
declare
  v_scan_log_id bigint;
  v_user_id uuid;
  v_api_key_record record;
begin
  -- Get API key info to get user_id
  select * into v_api_key_record
  from api_keys 
  where id = p_api_key_id 
  and status = 'active';
  
  -- Check if API key exists and is active
  if not found then
    raise exception 'Invalid or inactive API key ID: %', p_api_key_id;
  end if;
  
  v_user_id := v_api_key_record.user_id;
  
  -- Insert scan log with metadata
  insert into scan_logs (
    user_id, api_key_id, scanned_code, scan_type, 
    scan_result, device_info, ip_address, metadata
  )
  values (
    v_user_id, p_api_key_id, p_scanned_code, p_scan_type,
    p_scan_result, p_device_info, p_ip_address, p_metadata
  )
  returning id into v_scan_log_id;
  
  -- Update usage stats
  insert into usage_stats (user_id, date, scan_count)
  values (v_user_id, current_date, 1)
  on conflict (user_id, date)
  do update set 
    scan_count = usage_stats.scan_count + 1,
    last_update = now();
  
  -- Update API key usage
  update api_keys 
  set usage_count = usage_count + 1, 
      last_used_at = now()
  where id = p_api_key_id;
  
  -- Log audit
  insert into audit_logs (user_id, action, meta)
  values (v_user_id, 'SCAN_LOGGED', json_build_object('scan_log_id', v_scan_log_id));
  
  return v_scan_log_id;
end;
$$ language plpgsql security definer;
