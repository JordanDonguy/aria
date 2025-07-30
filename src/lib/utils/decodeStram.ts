export async function decodeStream(
  response: Response,
  updateLastMessage: (content: string) => void,
): Promise<string> {
  // Initialize reader (for streamed response)
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is empty or not readable");

  // Initialize decoder and assistantContent
  const decoder = new TextDecoder("utf-8");
  let assistantContent = "";

  // Decode and adds response's chunks to messages up until streamed response's done
  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    // Decode and clean chunks
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      // Only process lines that start with "data: "
      if (!line.startsWith("data: ")) continue;

      // Remove the "data: " prefix to extract the raw JSON string
      const jsonStr = line.slice(6).trim();

      // If the server sent the "[DONE]" signal, skip it (to not try to parse it and have error)
      if (jsonStr === "[DONE]") continue;

      // Parse the JSON string into an object
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse stream JSON", e);
        continue;
      }

      // Extract the new token from the stream (might be a word or part of one)
      const token = parsed.choices?.[0]?.delta?.content;

      // If a token exists, append it to the assistant's message and update last message's content of messages
      if (token) {
        assistantContent += token;
        updateLastMessage(assistantContent);
      }
    }
  }; return assistantContent;
}
