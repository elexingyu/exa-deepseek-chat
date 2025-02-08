import { deepseek } from '@ai-sdk/deepseek';
import { fireworks } from '@ai-sdk/fireworks';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: fireworks('accounts/fireworks/models/deepseek-r1'),
    system: "You are a helpful assistant that takes in the web for information and replies to the user. Please detect the user's language and respond in the same language.",
    messages,
  });

  return result.toDataStreamResponse({ sendReasoning: true });
}