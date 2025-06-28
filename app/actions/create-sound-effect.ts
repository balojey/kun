'use server';

import type { CreateSoundEffectRequest } from '@elevenlabs/elevenlabs-js/api';

import { getElevenLabsClient, handleError } from '@/app/actions/utils';
import { Err, Ok, Result } from '@/types';

export async function createSoundEffect(
  request: CreateSoundEffectRequest
): Promise<Result<{ audioBase64: string; processingTimeMs: number }>> {
  const startTime = performance.now();
  const clientResult = await getElevenLabsClient();
  if (!clientResult.ok) return Err(clientResult.error);

  try {
    const client = clientResult.value;
    const stream = await client.textToSoundEffects.convert(request);

    const audioBase64 = await streamToBase64(stream);

    const processingTimeMs = Math.round(performance.now() - startTime);

    return Ok({
      audioBase64: `data:audio/wav;base64,${audioBase64}`,
      processingTimeMs,
    });
  } catch (error) {
    return handleError(error, 'sound effect generation');
  }
}

async function streamToBase64(audioStream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = audioStream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  // Convert Uint8Array to base64
  const base64 = Buffer.from(merged).toString('base64');
  return base64;
}
