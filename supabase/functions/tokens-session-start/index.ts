import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { nanoid } from 'npm:nanoid@5.1.5';

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
        const { service_type, estimated_duration_seconds } = body;

        if (!service_type || !['conversational_ai', 'pica_endpoint'].includes(service_type)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid request', 
                details: 'service_type must be conversational_ai or pica_endpoint' 
            }), { 
                status: 400, 
                headers: corsHeaders 
            });
        }

        // Check if user has sufficient tokens for estimated duration
        if (estimated_duration_seconds && estimated_duration_seconds > 0) {
            const requiredTokens = service_type === 'conversational_ai' 
                ? estimated_duration_seconds 
                : Math.ceil(estimated_duration_seconds * 0.5);

            const { data: balance } = await supabase
                .from('user_tokens')
                .select('balance')
                .eq('user_id', user.id)
                .single();

            if (!balance || balance.balance < requiredTokens) {
                return new Response(JSON.stringify({ 
                    error: 'Insufficient tokens for estimated duration',
                    required: requiredTokens,
                    available: balance?.balance || 0
                }), { 
                    status: 400, 
                    headers: corsHeaders 
                });
            }
        }

        // Generate unique session ID
        const sessionId = `${service_type}_${user.id}_${nanoid()}`;

        // Start the usage session in the database
        const { data: sessionUuid, error: sessionError } = await supabase.rpc('start_usage_session', {
            user_id_param: user.id,
            service_type_param: service_type,
            session_id_param: sessionId
        });

        if (sessionError) {
            console.error('Error starting session:', sessionError);
            return new Response(JSON.stringify({ 
                error: 'Failed to start usage session',
                details: sessionError.message
            }), { 
                status: 500, 
                headers: corsHeaders 
            });
        }

        return new Response(JSON.stringify({ 
            session_id: sessionId,
            session_uuid: sessionUuid 
        }), {
            headers: corsHeaders,
        });
    } catch (error) {
        console.error('Error starting usage session:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
});