import { NextResponse } from 'next/server';

const apiKey = process.env.MISTRAL_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const { message } = await req.json() as { message: string };

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          {
            role: 'system',
            content: `You are a title generator. Your job is to produce a clear, concise, and relevant title summarizing the user's message. Output only the title, with no punctuation or introductions. Use the same language as the message.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 300,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mistral API error response:", errorText);
      return NextResponse.json(
        { error: `Mistral API error: ${response.status} ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Failed to send message to Mistral:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
