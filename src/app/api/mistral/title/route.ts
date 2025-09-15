import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, aiBuckets } from "@/lib/middlewares/rateLimit";
import { checkAndUpdateDailyLimit } from "@/lib/dailyLimit/checkUpdateDailyLimit";

const apiKey = process.env.MISTRAL_API_KEY;

export async function POST(req: NextRequest) {
  // Apply rate limiter with AI bucket & limit 5 per minute
  const rateLimitResponse = rateLimiter(req, {
    bucketMap: aiBuckets,
    limit: 5,
  });
  if (rateLimitResponse) return rateLimitResponse;

  // Check if under daily limit and update it
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

  // Make API call
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
        model: "mistral-medium-latest",
        messages: [
          {
            role: 'system',
            content: `You are a title generator. Your job is to produce a clear, concise, short (max 50 characters), and relevant title summarizing the user's message. Output only the title, with no punctuation or introductions. Use the same language as the message.`,
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
