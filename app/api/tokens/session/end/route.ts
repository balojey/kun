import { NextRequest, NextResponse } from 'next/server';
import { createClientFromToken } from '@/lib/supabase/server';
import { endUsageSession } from '@/lib/tokens/server';
import { z } from 'zod';

const endSessionSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  duration_seconds: z.number().min(0, 'Duration must be non-negative'),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = await createClientFromToken(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = endSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { session_id, duration_seconds } = validation.data;

    const success = await endUsageSession(session_id, duration_seconds);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to end session or insufficient tokens' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending usage session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}