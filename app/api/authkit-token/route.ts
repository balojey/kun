import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check if PicaOS API key is configured
    if (!env.PICA_SANDBOX_API_KEY) {
      return NextResponse.json(
        { error: 'PicaOS API key not configured' },
        { status: 500 }
      );
    }

    // Get the authenticated user from Supabase
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, we'll simulate token generation since we don't have the actual PicaOS SDK
    // In a real implementation, you would use @picahq/authkit-node here
    const mockToken = `pica_token_${user.id}_${Date.now()}`;

    // TODO: Replace with actual PicaOS AuthKit token generation
    // const { AuthKit } = require('@picahq/authkit-node');
    // const authKit = new AuthKit({ apiKey: env.PICA_SANDBOX_API_KEY });
    // const token = await authKit.generateToken({ userId: user.id });

    return NextResponse.json(
      { token: mockToken },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('AuthKit token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}