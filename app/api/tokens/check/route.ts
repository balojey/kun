import { NextRequest, NextResponse } from 'next/server';
import { createClientFromToken } from '@/lib/supabase/server';
import { hassufficientTokens } from '@/lib/tokens/server';
import { z } from 'zod';

const checkTokensSchema = z.object({
  required_tokens: z.number().positive('Required tokens must be positive'),
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
    const validation = checkTokensSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { required_tokens } = validation.data;

    const sufficient = await hassufficientTokens(user.id, required_tokens);

    return NextResponse.json({ sufficient });
  } catch (error) {
    console.error('Error checking tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}