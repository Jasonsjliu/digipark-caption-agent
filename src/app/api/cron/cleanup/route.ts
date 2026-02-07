import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Verify Authentication (Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Optional: Allow development testing without secret
        if (process.env.NODE_ENV === 'production') {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    try {
        // 2. Initialize Supabase Admin Client
        // We need service_role key to bypass RLS and delete records for ALL users
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase Service Key');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Calculate Date Threshold (7 days ago)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const threshold = sevenDaysAgo.toISOString();

        // 4. Delete Old Records
        const { error, count } = await supabase
            .from('generation_history')
            .delete({ count: 'exact' })
            .lt('created_at', threshold);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Cleanup complete. Deleted ${count} records older than ${threshold}.`,
            deletedCount: count
        });

    } catch (error: any) {
        console.error('Cleanup Cron Failed:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
