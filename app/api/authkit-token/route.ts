import { NextRequest, NextResponse } from "next/server";
import { AuthKitToken } from "@picahq/authkit-node";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS requests
export async function OPTIONS(req: NextRequest) {
    console.log("CORS preflight request received");
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    const authKitToken = new AuthKitToken(process.env.PICA_SECRET_KEY as string);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User from Supabase:", user);

    const identity = user?.id || uuidv4();
    const token = await authKitToken.create({
        identity,
        identityType: "user"
    });

    // Add CORS headers to the response
    return NextResponse.json(token, {
        headers: corsHeaders,
    });
}
