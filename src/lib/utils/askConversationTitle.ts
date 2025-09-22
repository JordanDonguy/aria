// Ask a conversation title to Mistral
export async function askConversationTitle(message: string) {
  try {
    const res = await fetch("/api/mistral/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message }),
    });

    if (res.status === 429) {
      return "New conversation"   // Fallback title
    }

    if (!res.body) {
      throw new Error("No response body");
    }
    const data = await res.json();
    const title = data.choices?.[0]?.message?.content.replace(/^["']+|["']+$/g, '').trim();;

    return title;
  } catch (error) {
    console.error("Error calling Mistral API:", error);
    return "New conversation"   // Fallback title
  }
}
