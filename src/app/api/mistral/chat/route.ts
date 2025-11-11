// src/app/api/mistral/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, aiBuckets } from "@/lib/middlewares/rateLimit";
import { checkAndUpdateDailyLimit } from "@/lib/dailyLimit/checkUpdateDailyLimit";
import sanitizeHtml from "sanitize-html";
import type { Model, Personality } from '@/types/ai';

interface Message {
  role: "user" | "assistant";
  content: string;
}

const apiKey = process.env.MISTRAL_API_KEY;

export async function POST(req: NextRequest) {
  // 1. Apply rate limiter with AI bucket & limit 5 per minute
  const rateLimitResponse = rateLimiter(req, {
    bucketMap: aiBuckets,
    limit: 5,
  });
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Check if under daily limit and update it
  const daily = await checkAndUpdateDailyLimit();
  if (!daily.allowed) {
    const retryAfter = daily.retryAfter ?? 3600; // fallback to 1 hour (in seconds)
    const retryAfterHours = Number(Math.max(retryAfter / 3600, 1).toFixed(1)); // minimum 1 hour

    return NextResponse.json(
      { error: `"Daily usage limit reached. Please try again in ${retryAfterHours < 2 ? retryAfterHours + " hour" : retryAfterHours + " hours"} 🙏` },
      {
        status: 429,
        headers: {
          'Retry-After': daily.retryAfter?.toString() || "1",
        },
      }
    )
  };

  try {
    // 3. API key check
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
  
    // 4. Parse client request
    const { messages, model, personality } = await req.json() as {
      messages: Message[],
      model: Model,
      personality: Personality
    };

    // 5. Sanitize user messages
    const cleanMessages = messages.map((msg) =>
      msg.role === "user"
        ? {
          ...msg,
          content: sanitizeHtml(msg.content, {
            allowedTags: [],
            allowedAttributes: {},
          }),
        }
        : msg
    );

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // 6. Send request to Mistral API
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `mistral-${model}-latest`,
        messages: [
          {
            role: "system",
            content: `You are Aria, a helpful assistant.
                      Your personality is: ${personality}.
                      Add h3 and h4 titles and hr separations.
                      Add relevant emojis in titles or responses to make messages more lively 😊. 
                      ${messages.length < 3 ? "Don't forget to present yourself." : "Do not present yourself."} 
                      Avoid using HTML or Markdown tables; use lists or clear formatting instead.`,
          },
          ...cleanMessages,
        ],
        max_tokens: 4000,
        stream: true,
      }),
    });

    // 7. Handle Mistral API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mistral API error response:", errorText);
      return NextResponse.json(
        { error: `Mistral API error: ${response.status} ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    const body = response.body;
    if (!body) {
      return NextResponse.json({ error: "No response body from Mistral" }, { status: 500 });
    }

    // 8. Wrap Mistral response in a readable stream
    const readable = new ReadableStream({
      async start(controller) {
        const reader = body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          controller.enqueue(value); // forward chunk immediately
        }

        controller.close();
      }
    });

    // 9. Return streaming response to client
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Failed to send message to Mistral:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
