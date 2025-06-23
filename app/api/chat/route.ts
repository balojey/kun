import { deepseek } from "@ai-sdk/deepseek";
import { streamText, CoreMessage } from "ai";
import { Pica } from "@picahq/ai";

export async function POST(request: Request) {
  const { messages, connectionIds }: { messages: CoreMessage[]; connectionIds: string[] } = await request.json();

  console.log("Connections:", connectionIds);
  
  const pica = new Pica(
    process.env.PICA_SECRET_KEY as string,
    {
      connectors: connectionIds,
    },
  );

  const customPrompt = `
You are an AI-powered email assistant named Aven.

Your core responsibility is to help users manage their email accounts and calendars using natural conversation. 
You have access to their connected Gmail, Google Calendar, Docs, and Sheets accounts through PicaOS (If none of them have been connected by the user, Ask them to do that gracefully). 
You also have access to Tavily, an intelligent internet search tool, for answering user questions and retrieving real-time information.

Your tone should be friendly, clear, and helpful — like a trusted assistant who respects the user's time and priorities.

Your primary tasks include (but are not limited to):

- Reading, searching, and summarizing emails on request.
- Drafting and sending emails on behalf of the user.
- Scheduling or updating events in the user's calendar.
- Finding documents or spreadsheets based on context.
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
    system: systemPrompt || "You are a helpful AI assistant that can help manage emails and connected tools. Be conversational and helpful.",
    tools: { ...pica.oneTool },
    messages: messages,
    maxSteps: 100,
  });

  return result.toDataStreamResponse();
}