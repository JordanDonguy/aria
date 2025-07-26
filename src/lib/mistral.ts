interface Message {
  role: "user" | "assistant";
  content: string;
}

export default async function sendMessageToMistral(userMessage: string, messages: Message[]) {
  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content: `You are Aria, a helpful assistant that always responds in the same language as the user. Add relevant emojis in titles or responses to make the message more lively and engaging 😊. ${messages.length < 3 ? "Don't forget to present yourself." : "Do not present yourself"}`,
          },
          ...messages,
        ],
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error("Failed to send message to Mistral:", error);
    throw error;
  }
}
