import { deepseek } from "@ai-sdk/deepseek";
import { streamText, CoreMessage } from "ai";
import { Pica } from "@picahq/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { messages }: { messages: CoreMessage[] } = await request.json();
  
  // Get user's connections for context
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let connections: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', user.id);
    connections = data || [];
  }

  const connectionIds = connections.map(c => c.connection_id);
  
  const pica = new Pica(
    process.env.PICA_SECRET_KEY as string,
    {
      connectors: connectionIds,
    },
  );

  const systemPrompt = await pica.generateSystemPrompt();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPrompt || "You are a helpful AI assistant that can help manage emails and connected tools. Be conversational and helpful.",
    tools: { ...pica.oneTool },
    messages: messages,
    maxSteps: 100,
  });

  return result.toDataStreamResponse();
}