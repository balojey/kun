import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserTokenBalance } from '@/lib/tokens/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const balance = await getUserTokenBalance(user.id);

    if (!balance) {
      return NextResponse.json({ error: 'Token account not found' }, { status: 404 });
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}