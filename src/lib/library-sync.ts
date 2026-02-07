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

// ============ KEYWORDS SYNC ============

export async function loadKeywordsFromCloud(): Promise<CloudKeyword[]> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // If no user, we might want to return empty or handle local fallback higher up.
    // However, the component Logic (KeywordLibrary.tsx) handles local fallback if cloud returns empty array.
    // So for anonymous users, returning [] is correct here, as they have no cloud data.
    if (!user) return [];

    // Query keywords that belong to this user OR are system presets
    const { data, error } = await supabase
        .from('library_entries')
        .select('*')
        .eq('type', 'keyword')
        .or(`user_id.eq.${user.id},label.eq.system_preset`);

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('Cannot save keyword: User not logged in');
        return null;
    }

    const { data, error } = await supabase
        .from('library_entries')
        .insert({
            type: 'keyword',
            category: keyword.category,
            label: 'user_keyword',
            user_id: user.id,
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('library_entries')
        .select('*')
        .eq('type', 'preset')
        .eq('user_id', user.id)
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('Cannot save config: User not logged in');
        return false;
    }

    // Upsert - update if exists, insert if not
    const { error } = await supabase
        .from('library_entries')
        .upsert({
            type: 'preset',
            category: 'user_settings',
            label: VARIABLE_CONFIG_LABEL,
            user_id: user.id,
            content: config
        }, {
            onConflict: 'type,user_id,label'
        });

    if (error) {
        // Fallback for complex constraints if implicit upsert fails
        console.error('Failed to upsert variable config:', error);
        return false;
    }

    return true;
}

// ============ SYNC UTILITIES ============

// Sync keywords from localStorage to cloud (Migration helper)
export async function migrateKeywordsToCloud(localKeywords: CloudKeyword[]): Promise<void> {
    const cloudKeywords = await loadKeywordsFromCloud();
    const cloudKeywordSet = new Set(cloudKeywords.map(k => k.keyword));

    for (const kw of localKeywords) {
        if (!cloudKeywordSet.has(kw.keyword)) {
            // Only migrate if not exists
            if (!kw.id?.startsWith('local_')) continue; // Skip if it looks like a cloud ID but somehow valid
            await saveKeywordToCloud(kw);
        }
    }
}
