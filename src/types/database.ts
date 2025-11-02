// Database types for Simple QR/Barcode Scanner
export interface Profile {
  id: string
  full_name: string
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: number
  user_id: string
  name: string
  access_key: string
  secret_hash: string
  status: 'active' | 'revoked'
  last_used_at?: string
  usage_count: number
  created_at: string
}

export interface ScanLog {
  id: number
  user_id: string
  api_key_id?: number
  scanned_code: string
  scan_type: 'QR' | 'BARCODE' | 'OTHER'
  scan_result?: string
  device_info?: Record<string, any>
  ip_address?: string
  created_at: string
}

export interface ScanMetadata {
  id: number
  scan_log_id: number
  geo_info?: Record<string, any>
  browser?: string
  os?: string
  app_version?: string
  created_at: string
}

export interface UsageStats {
  id: number
  user_id: string
  date: string
  scan_count: number
  last_update: string
}

export interface AuditLog {
  id: number
  user_id?: string
  action: string
  meta?: Record<string, any>
  created_at: string
}
