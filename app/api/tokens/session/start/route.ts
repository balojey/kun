import { NextRequest, NextResponse } from 'next/server';
import { createClientFromToken } from '@/lib/supabase/server';
import { startUsageSession, hassufficientTokens } from '@/lib/tokens/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const startSessionSchema = z.object({
  service_type: z.enum(['conversational_ai', 'pica_endpoint']),
  estimated_duration_seconds: z.number().positive().optional(),
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
    const validation = startSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { service_type, estimated_duration_seconds } = validation.data;

    // Check if user has sufficient tokens for estimated duration
    if (estimated_duration_seconds) {
      const requiredTokens = service_type === 'conversational_ai' 
        ? estimated_duration_seconds 
        : Math.ceil(estimated_duration_seconds * 0.5);

      const hasSufficientTokens = await hassufficientTokens(user.id, requiredTokens);
      
      if (!hasSufficientTokens) {
        return NextResponse.json(
          { error: 'Insufficient tokens for estimated duration' },
          { status: 400 }
        );
      }
    }

    // Generate unique session ID
    const sessionId = `${service_type}_${user.id}_${nanoid()}`;

    const sessionUuid = await startUsageSession(user.id, service_type, sessionId);

    if (!sessionUuid) {
      return NextResponse.json(
        { error: 'Failed to start usage session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      session_id: sessionId,
      session_uuid: sessionUuid 
    });
  } catch (error) {
    console.error('Error starting usage session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}