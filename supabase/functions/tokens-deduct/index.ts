import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
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

        const body = await req.json();
        const { amount, description, metadata = {} } = body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return new Response(JSON.stringify({ 
                error: 'Invalid request', 
                details: 'amount must be a positive number' 
            }), { 
                status: 400, 
                headers: corsHeaders 
            });
        }

        if (!description || typeof description !== 'string') {
            return new Response(JSON.stringify({ 
                error: 'Invalid request', 
                details: 'description is required' 
            }), { 
                status: 400, 
                headers: corsHeaders 
            });
        }

        const { data: success, error: deductError } = await supabase.rpc('deduct_tokens', {
            user_id_param: user.id,
            amount_param: amount,
            description_param: description,
            metadata_param: metadata
        });

        if (deductError) {
            console.error('Error deducting tokens:', deductError);
            return new Response(JSON.stringify({ 
                error: 'Insufficient tokens or deduction failed' 
            }), { 
                status: 400, 
                headers: corsHeaders 
            });
        }

        return new Response(JSON.stringify({ success: !!success }), {
            headers: corsHeaders,
        });
    } catch (error) {
        console.error('Error deducting tokens:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
});