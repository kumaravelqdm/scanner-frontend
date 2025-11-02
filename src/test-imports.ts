// Test file to verify imports are working correctly
import { supabase, isSupabaseConfigured } from './lib/supabase'
import type { Profile, ApiKey } from './types/database'

// This file is just to test that all imports work correctly
// It can be deleted after verification

const testProfile: Profile = {
  id: 'test',
  full_name: 'Test User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const testApiKey: ApiKey = {
  id: 1,
  user_id: 'test-user-id',
  name: 'Test API Key',
  access_key: 'test-key',
  secret_hash: 'test-hash',
  status: 'active',
  usage_count: 0,
  created_at: new Date().toISOString()
}

console.log('All imports working correctly!', {
  supabase: !!supabase,
  isConfigured: isSupabaseConfigured(),
  testProfile,
  testApiKey
})
