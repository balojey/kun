import { deepseek } from "@ai-sdk/deepseek";
import { streamText, CoreMessage } from "ai";
import { Pica } from "@picahq/ai";

export async function POST(request: Request) {
  const { transcript, connectionIds } = await request.json();
  console.log("Received transcript:", transcript);
  console.log("Received connections:", connectionIds);
  const messages: CoreMessage[] = [{
      role: "user",
      content: transcript
  }];

  const pica = new Pica(
    process.env.PICA_SECRET_KEY as string,
    {
      connectors: connectionIds,
      // headers: {
      //   "Access-Control-Allow-Origin": "*",
      //   "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
      //   "Access-Control-Allow-Headers": "Content-Type",
      // }
    },
  );

  const systemPrompt = await pica.generateSystemPrompt();

  const stream = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPrompt,
    tools: { ...pica.oneTool },
    messages: messages,
    maxSteps: 5,
  });

  if (!stream.textStream) {
      throw new Error("Stream does not support text streaming.");
  }

  let responseText = '';
  for await (const chunk of stream.textStream) {
    responseText += chunk;
  }
  console.log('Pica response:', responseText);
  return new Response(responseText.trim()) || new Response('Command executed successfully!');
}