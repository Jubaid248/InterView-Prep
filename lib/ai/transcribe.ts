/**
 * Deepgram Pre-Recorded Speech-to-Text API Integration.
 * Transcribes audio recordings using Deepgram's nova-2 model with smart_format enabled.
 *
 * @param audioBase64 - Base64 encoded audio string from the frontend recorder
 * @returns Object containing the transcribed text
 */
export async function transcribeAudio(
  audioBase64: string
): Promise<{ text: string }> {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    throw new Error(
      "DEEPGRAM_API_KEY is missing. Please add DEEPGRAM_API_KEY=your_key to .env.local"
    );
  }

  if (!audioBase64 || audioBase64.trim().length === 0) {
    throw new Error("No audio data received for transcription.");
  }

  try {
    const audioBuffer = Buffer.from(audioBase64, "base64");

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey.trim()}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Deepgram API Error ${response.status}]:`, errorText);
      throw new Error(
        `Deepgram API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return { text: transcript.trim() };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[transcribeAudio Error]:", errorMessage);
    throw new Error(`Transcription failed: ${errorMessage}`);
  }
}
