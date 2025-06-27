import { NextRequest, NextResponse } from "next/server";
import { AuthKitToken } from "@picahq/authkit-node";
import { createClientFromToken } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Handle OPTIONS requests
export async function OPTIONS(req: NextRequest) {
    console.log("CORS preflight request received");
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    const authKitToken = new AuthKitToken(process.env.PICA_SECRET_KEY as string);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = await createClientFromToken(token);
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User from Supabase:", user);

    const identity = user?.id || uuidv4();
    const authToken = await authKitToken.create({
        identity,
        identityType: "user"
    });

    // Add CORS headers to the response
    return NextResponse.json(authToken, {
        headers: corsHeaders,
    });
}