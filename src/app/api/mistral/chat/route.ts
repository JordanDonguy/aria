// src/app/api/mistral/route.ts
import { NextResponse } from 'next/server';

interface Message {
  role: "user" | "assistant";
  content: string;
}

const apiKey = process.env.MISTRAL_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const { messages } = await req.json() as { messages: Message[] };

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: [
          {
            role: "system",
            content: `You are Aria, a helpful assistant that always responds in the same language as the user. Add relevant emojis in titles or responses to make the message more lively and engaging 😊. ${messages.length < 3 ? "Don't forget to present yourself." : "Do not present yourself"
              }`,
          },
          ...messages,
        ],
        max_tokens: 2000,
        stream: true,
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

    // Return the Mistral API response as a stream passthrough (or you can customize)
    const body = response.body;
    if (!body) {
      return NextResponse.json({ error: "No response body from Mistral" }, { status: 500 });
    }

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Failed to send message to Mistral:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
