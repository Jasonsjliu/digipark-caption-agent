'use client';

import { createClient } from '@/lib/supabase/client';

// Types
export interface CloudKeyword {
    id: string;
    keyword: string;
    category: string;
    labelEn?: string;
}

export interface CloudVariableConfig {
    [key: string]: {
        disabled: string[];
        custom: Array<{
            value: string;
            label: string;
            labelEn: string;
            isCustom: boolean;
        }>;
        deleted?: string[];
    };
}

interface LibraryEntry {
    id: string;
    user_id: string | null;
    type: 'keyword' | 'preset';
    category: string | null;
    label: string;
    content: Record<string, unknown> | null;
    created_at: string;
}

const DEVICE_ID_KEY = 'dipark_device_id';

// Get or create a device ID for anonymous users
function getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';

    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = 'device_' + crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

// ============ KEYWORDS SYNC ============

export async function loadKeywordsFromCloud(): Promise<CloudKeyword[]> {
    const supabase = createClient();
    const deviceId = getDeviceId();

    // Query keywords that belong to this device OR are system presets
    const { data, error } = await supabase
        .from('library_entries')
        .select('*')
        .eq('type', 'keyword')
        .or(`label.eq.${deviceId},label.eq.system_preset`);

    if (error) {
        console.error('Failed to load keywords from cloud:', error);
        return [];
    }

    return (data as LibraryEntry[]).map(entry => ({
        id: entry.id,
        keyword: entry.content?.keyword as string || entry.category || '',
        category: entry.content?.category as string || entry.category || 'general',
        labelEn: entry.content?.labelEn as string
    }));
}

export async function saveKeywordToCloud(keyword: Omit<CloudKeyword, 'id'>): Promise<CloudKeyword | null> {
    const supabase = createClient();
    const deviceId = getDeviceId();

    const { data, error } = await supabase
        .from('library_entries')
        .insert({
            type: 'keyword',
            category: keyword.category,
            label: deviceId, // Use device ID as label for filtering
            content: {
                keyword: keyword.keyword,
                labelEn: keyword.labelEn,
                category: keyword.category
            }
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to save keyword to cloud:', error);
        return null;
    }

    return {
        id: data.id,
        keyword: keyword.keyword,
        category: keyword.category,
        labelEn: keyword.labelEn
    };
}

export async function deleteKeywordFromCloud(id: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('library_entries')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Failed to delete keyword from cloud:', error);
        return false;
    }

    return true;
}

// ============ VARIABLE CONFIG SYNC ============

const VARIABLE_CONFIG_LABEL = 'variable_config';

export async function loadVariableConfigFromCloud(): Promise<CloudVariableConfig | null> {
    const supabase = createClient();
    const deviceId = getDeviceId();

    const { data, error } = await supabase
        .from('library_entries')
        .select('*')
        .eq('type', 'preset')
        .eq('category', deviceId)
        .eq('label', VARIABLE_CONFIG_LABEL)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No config found, return null
            return null;
        }
        console.error('Failed to load variable config from cloud:', error);
        return null;
    }

    return (data as LibraryEntry).content as CloudVariableConfig;
}

export async function saveVariableConfigToCloud(config: CloudVariableConfig): Promise<boolean> {
    const supabase = createClient();
    const deviceId = getDeviceId();

    // Upsert - update if exists, insert if not
    const { error } = await supabase
        .from('library_entries')
        .upsert({
            type: 'preset',
            category: deviceId,
            label: VARIABLE_CONFIG_LABEL,
            content: config
        }, {
            onConflict: 'type,category,label'
        });

    if (error) {
        // If upsert fails due to missing constraint, try insert/update manually
        const { data: existing } = await supabase
            .from('library_entries')
            .select('id')
            .eq('type', 'preset')
            .eq('category', deviceId)
            .eq('label', VARIABLE_CONFIG_LABEL)
            .single();

        if (existing) {
            const { error: updateError } = await supabase
                .from('library_entries')
                .update({ content: config })
                .eq('id', existing.id);

            if (updateError) {
                console.error('Failed to update variable config:', updateError);
                return false;
            }
        } else {
            const { error: insertError } = await supabase
                .from('library_entries')
                .insert({
                    type: 'preset',
                    category: deviceId,
                    label: VARIABLE_CONFIG_LABEL,
                    content: config
                });

            if (insertError) {
                console.error('Failed to insert variable config:', insertError);
                return false;
            }
        }
    }

    return true;
}

// ============ SYNC UTILITIES ============

// Sync keywords from localStorage to cloud (for migration)
export async function migrateKeywordsToCloud(localKeywords: CloudKeyword[]): Promise<void> {
    const cloudKeywords = await loadKeywordsFromCloud();
    const cloudKeywordSet = new Set(cloudKeywords.map(k => k.keyword));

    for (const kw of localKeywords) {
        if (!cloudKeywordSet.has(kw.keyword)) {
            await saveKeywordToCloud(kw);
        }
    }
}

// Sync variable config from localStorage to cloud (for migration)
export async function migrateVariableConfigToCloud(localConfig: CloudVariableConfig): Promise<void> {
    const cloudConfig = await loadVariableConfigFromCloud();

    if (!cloudConfig) {
        // No cloud config, upload local
        await saveVariableConfigToCloud(localConfig);
    } else {
        // Merge configs - prefer cloud but add any local-only items
        const mergedConfig = { ...cloudConfig };

        for (const key of Object.keys(localConfig)) {
            if (!mergedConfig[key]) {
                mergedConfig[key] = localConfig[key];
            } else {
                // Merge custom options
                const localCustom = localConfig[key].custom || [];
                const cloudCustom = mergedConfig[key].custom || [];
                const cloudCustomValues = new Set(cloudCustom.map(c => c.value));

                for (const opt of localCustom) {
                    if (!cloudCustomValues.has(opt.value)) {
                        cloudCustom.push(opt);
                    }
                }
                mergedConfig[key].custom = cloudCustom;

                // Merge deleted
                const localDeleted = localConfig[key].deleted || [];
                const cloudDeleted = mergedConfig[key].deleted || [];
                mergedConfig[key].deleted = [...new Set([...cloudDeleted, ...localDeleted])];

                // Merge disabled
                const localDisabled = localConfig[key].disabled || [];
                const cloudDisabled = mergedConfig[key].disabled || [];
                mergedConfig[key].disabled = [...new Set([...cloudDisabled, ...localDisabled])];
            }
        }

        await saveVariableConfigToCloud(mergedConfig);
    }
}
