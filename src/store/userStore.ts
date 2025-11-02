import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { ApiKey, ScanLog, UsageStats } from '../types/database'

interface UserState {
    apiKeys: ApiKey[]
    scanLogs: ScanLog[]
    usageStats: UsageStats[]
    loading: boolean

    // API Key actions
    fetchApiKeys: () => Promise<void>
    createApiKey: (name?: string) => Promise<{ data: any; error: any }>
    revokeApiKey: (id: number) => Promise<{ error: any }>

    // Scan Log actions
    fetchScanLogs: (limit?: number) => Promise<void>
    logScan: (data: {
        apiKeyId: number
        scannedCode: string
        scanType: 'QR' | 'BARCODE' | 'OTHER'
        scanResult?: string
        deviceInfo?: any
        ipAddress?: string
    }) => Promise<{ data: number | null; error: any }>

    // Usage Stats actions
    fetchUsageStats: (days?: number) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
    apiKeys: [],
    scanLogs: [],
    usageStats: [],
    loading: false,

    fetchApiKeys: async () => {
        try {
            set({ loading: true })
            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (error) {
                console.error("Supabase error in fetchApiKeys:", error);
                set({ loading: false })
                return
            }
            
            if (data) {
                set({ apiKeys: data })
            }
            set({ loading: false })
        } catch (e) {
            console.error("Error in fetchApiKeys:", e);
            set({ loading: false })
        }

    },

    createApiKey: async (name = 'Default API Key') => {
        const { data, error } = await supabase.rpc('create_api_key', {
            p_name: name
        })

        if (!error && data) {
            await get().fetchApiKeys()
        }

        return { data, error }
    },

    revokeApiKey: async (id: number) => {
        const { error } = await supabase
            .from('api_keys')
            .update({ status: 'revoked' })
            .eq('id', id)

        if (!error) {
            set(state => ({
                apiKeys: state.apiKeys.map(key =>
                    key.id === id ? { ...key, status: 'revoked' as const } : key
                )
            }))
        }

        return { error }
    },

    fetchScanLogs: async (limit = 50) => {
        const { data, error } = await supabase
            .from('scan_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!error && data) {
            set({ scanLogs: data })
        }
    },

    logScan: async (data) => {
        const { data: result, error } = await supabase.rpc('log_scan', {
            p_api_key_id: data.apiKeyId,
            p_scanned_code: data.scannedCode,
            p_scan_type: data.scanType,
            p_scan_result: data.scanResult || null,
            p_device_info: data.deviceInfo || null,
            p_ip_address: data.ipAddress || null
        })

        if (!error) {
            await get().fetchScanLogs()
            await get().fetchUsageStats()
        }

        return { data: result, error }
    },

    fetchUsageStats: async (days = 30) => {
        const { data, error } = await supabase
            .from('usage_stats')
            .select('*')
            .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('date', { ascending: false })

        if (!error && data) {
            set({ usageStats: data })
        }
    },
}))