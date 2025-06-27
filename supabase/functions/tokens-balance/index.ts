import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
            status: 405, 
            headers: corsHeaders 
        });
    }

    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), { 
                status: 401, 
                headers: corsHeaders 
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401, 
                headers: corsHeaders 
            });
        }

        const { data: balance, error: balanceError } = await supabase
            .from('user_tokens')
            .select('balance, total_purchased, total_consumed')
            .eq('user_id', user.id)
            .single();

        if (balanceError) {
            return new Response(JSON.stringify({ error: 'Token account not found' }), { 
                status: 404, 
                headers: corsHeaders 
            });
        }

        return new Response(JSON.stringify(balance), {
            headers: corsHeaders,
        });
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
});