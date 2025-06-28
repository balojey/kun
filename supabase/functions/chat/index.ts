import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { deepseek } from 'npm:@ai-sdk/deepseek@0.2.14';
import { streamText, CoreMessage } from 'npm:ai@4.3.16';
import { Pica } from 'npm:@picahq/ai@2.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

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

    const startTime = performance.now();
    let userId: string | null = null;

    try {
        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), { 
                status: 401, 
                headers: corsHeaders 
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401, 
                headers: corsHeaders 
            });
        }

        userId = user.id;

        // Check if user has sufficient tokens for estimated execution (10 seconds)
        const { data: hasTokens, error: checkError } = await supabase.rpc('check_tokens_for_execution', {
            user_id_param: userId,
            estimated_seconds_param: 10.0
        });

        if (checkError || !hasTokens) {
            return new Response(JSON.stringify({ 
                error: 'Insufficient tokens for request',
                details: 'Please purchase more tokens to continue using the service'
            }), { 
                status: 402, 
                headers: corsHeaders 
            });
        }

        const { messages, connectionIds }: { messages: CoreMessage[]; connectionIds: string[] } = await req.json();

        console.log("Connections:", connectionIds);
        
        const pica = new Pica(
            Deno.env.get('PICA_SECRET_KEY') as string,
            {
                connectors: connectionIds,
            },
        );

        const customPrompt = `
You are an AI-powered personal assistant named Aven.

Your core responsibility is to help users manage their digital workspace and productivity through natural conversation. 
You have access to their connected Gmail, Google Calendar, Docs, Sheets, Notion, Slack, and other productivity tools through PicaOS (If none of them have been connected by the user, ask them to do that gracefully). 
You also have access to Tavily, an intelligent internet search tool, for answering user questions and retrieving real-time information.

Your tone should be friendly, clear, and helpful — like a trusted assistant who respects the user's time and priorities.

Your primary tasks include (but are not limited to):

- Reading, searching, and summarizing emails on request.
- Drafting and sending emails on behalf of the user.
- Scheduling or updating events in the user's calendar.
- Managing documents, spreadsheets, and notes.
- Organizing tasks and project management.
- Researching answers or information from the internet using Tavily.
- Asking clarifying questions if needed, but keep your responses short and efficient.

Always try to respond in natural language first, then take action via the appropriate tool if necessary.
Do not explain how you are connected to PicaOS or Tavily. Never!.
Focus on getting things done with minimal friction.

If the user asks about things outside of your capability, reply gracefully and offer to look it up using Tavily if appropriate.
`;
        const generatedPrompt = await pica.generateSystemPrompt();
        const systemPrompt = `${generatedPrompt}\n${customPrompt}`;

        const result = streamText({
            model: deepseek("deepseek-chat"),
            system: systemPrompt || "You are a helpful AI personal assistant that can help manage productivity tools and connected services. Be conversational and helpful.",
            tools: { ...pica.oneTool },
            messages: messages,
            maxSteps: 100,
        });

        // Create the response stream
        // const response = result.toDataStreamResponse();

        // Measure execution time and deduct tokens in background
        EdgeRuntime.waitUntil((async () => {
            try {
                const endTime = performance.now();
                const executionSeconds = (endTime - startTime) / 1000;

                console.log(`Chat execution time: ${executionSeconds} seconds for user ${userId}`);

                // Deduct tokens based on actual execution time
                const { error: deductError } = await supabase.rpc('deduct_tokens_for_execution', {
                    user_id_param: userId,
                    execution_seconds_param: executionSeconds,
                    description_param: `Chat request - ${executionSeconds.toFixed(2)} seconds`,
                    metadata_param: {
                        service_type: 'chat',
                        execution_seconds: executionSeconds,
                        connection_ids: connectionIds
                    }
                });

                if (deductError) {
                    console.error('Error deducting tokens for chat:', deductError);
                }
            } catch (error) {
                console.error('Error in background token deduction:', error);
            }
        })());

        return result.toDataStreamResponse({ headers: corsHeaders });
    } catch (error) {
        console.error('Chat error:', error);

        // Still deduct tokens for failed requests if we have userId
        if (userId) {
            EdgeRuntime.waitUntil((async () => {
                try {
                    const endTime = performance.now();
                    const executionSeconds = (endTime - startTime) / 1000;

                    await supabase.rpc('deduct_tokens_for_execution', {
                        user_id_param: userId,
                        execution_seconds_param: executionSeconds,
                        description_param: `Chat request (failed) - ${executionSeconds.toFixed(2)} seconds`,
                        metadata_param: {
                            service_type: 'chat',
                            execution_seconds: executionSeconds,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        }
                    });
                } catch (deductError) {
                    console.error('Error deducting tokens for failed chat:', deductError);
                }
            })());
        }

        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
});