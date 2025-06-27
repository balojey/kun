import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { AuthKitToken } from 'npm:@picahq/authkit-node@1.0.3';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { v4 as uuidv4 } from 'npm:uuid@11.1.0';

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        console.log("CORS preflight request received");
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
            status: 405, 
            headers: corsHeaders 
        });
    }

    try {
        const authKitToken = new AuthKitToken(Deno.env.get('PICA_SECRET_KEY') as string);
        
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
        
        const { data: { user } } = await supabase.auth.getUser(token);
        console.log("User from Supabase:", user);

        const identity = user?.id || uuidv4();
        const authToken = await authKitToken.create({
            identity,
            identityType: "user"
        });

        return new Response(JSON.stringify(authToken), {
            headers: corsHeaders,
        });
    } catch (error) {
        console.error('AuthKit token error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
});