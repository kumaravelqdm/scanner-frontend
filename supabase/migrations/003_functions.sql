-- -------------------------------
-- Database Functions
-- -------------------------------

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
  values (new.id, new.raw_user_meta_data->>'full_name', now(), now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to generate API key
create or replace function public.generate_api_key()
returns text as $$
begin
  return encode(gen_random_bytes(32), 'base64');
end;
$$ language plpgsql security definer;

create or replace function public.create_api_key(
  p_name text default 'Default API Key'
)
returns json as $$
declare
  v_access_key text;
  v_secret text;
  v_secret_hash text;
  v_api_key_id bigint;
  v_user_id uuid;
begin
  -- Get current user
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;
  
  -- Generate access key and secret (base64url-safe)
  v_access_key := 'ak_' || replace(replace(encode(gen_random_bytes(16), 'base64'), '+', '-'), '/', '_');
  v_secret := replace(replace(encode(gen_random_bytes(32), 'base64'), '+', '-'), '/', '_');
  v_secret_hash := crypt(v_secret, gen_salt('bf'));
  
  -- Insert API key
  insert into api_keys (user_id, name, access_key, secret_hash)
  values (v_user_id, p_name, v_access_key, v_secret_hash)
  returning id into v_api_key_id;
  
  -- Log audit
  insert into audit_logs (user_id, action, meta)
  values (v_user_id, 'API_KEY_CREATED', json_build_object('api_key_id', v_api_key_id, 'name', p_name));
  
  return json_build_object(
    'id', v_api_key_id,
    'access_key', v_access_key,
    'secret', v_secret,
    'name', p_name
  );
end;
$$ language plpgsql security definer;


-- Function to log scan
create or replace function public.log_scan(
  p_api_key_id bigint,
  p_scanned_code text,
  p_scan_type text,
  p_scan_result text default null,
  p_device_info jsonb default null,
  p_ip_address text default null
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
  
  -- Insert scan log
  insert into scan_logs (
    user_id, api_key_id, scanned_code, scan_type, 
    scan_result, device_info, ip_address
  )
  values (
    v_user_id, p_api_key_id, p_scanned_code, p_scan_type,
    p_scan_result, p_device_info, p_ip_address
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

-- Function for updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to profiles
create trigger tr_profiles_updated_at before update on profiles
    for each row execute function update_updated_at();

-- Function to verify API key and secret (for server authentication)
create or replace function public.verify_api_key(
  p_access_key text,
  p_secret text
)
returns json as $$
declare
  v_api_key_record record;
begin
  -- Find the API key record
  select * into v_api_key_record
  from api_keys 
  where access_key = p_access_key 
  and status = 'active';
  
  -- Check if API key exists
  if not found then
    return json_build_object(
      'success', false,
      'error', 'Invalid access key'
    );
  end if;
  
  -- Verify the secret using crypt function (bcrypt)
  if not (v_api_key_record.secret_hash = crypt(p_secret, v_api_key_record.secret_hash)) then
    return json_build_object(
      'success', false,
      'error', 'Invalid secret'
    );
  end if;
  
  -- Update last_used_at and usage_count
  update api_keys 
  set 
    last_used_at = now(),
    usage_count = usage_count + 1
  where id = v_api_key_record.id;
  
  -- Return success with API key info
  return json_build_object(
    'success', true,
    'api_key_info', json_build_object(
      'id', v_api_key_record.id,
      'user_id', v_api_key_record.user_id,
      'name', v_api_key_record.name,
      'access_key', v_api_key_record.access_key,
      'status', v_api_key_record.status,
      'created_at', v_api_key_record.created_at,
      'last_used_at', now(),
      'usage_count', v_api_key_record.usage_count + 1
    )
  );
end;
$$ language plpgsql security definer;
