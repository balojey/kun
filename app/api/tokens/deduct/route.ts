import { NextRequest, NextResponse } from 'next/server';
import { createClientFromToken } from '@/lib/supabase/server';
import { deductTokens } from '@/lib/tokens/server';
import { z } from 'zod';

const deductTokensSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.any()).optional().default({}),
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
    const validation = deductTokensSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { amount, description, metadata } = validation.data;

    const success = await deductTokens(supabase, user.id, amount, description, metadata);

    if (!success) {
      return NextResponse.json(
        { error: 'Insufficient tokens or deduction failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deducting tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}