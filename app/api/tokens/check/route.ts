import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hassufficientTokens } from '@/lib/tokens/server';
import { z } from 'zod';

const checkTokensSchema = z.object({
  required_tokens: z.number().positive('Required tokens must be positive'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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