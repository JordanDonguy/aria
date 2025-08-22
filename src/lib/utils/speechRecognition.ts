"use client";

export function createSpeechRecognition({
  lang,
  onResult,
  onError,
  onStop,
}: {
  lang?: string; // optional override
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStop?: () => void;
}) {
  if (typeof window === "undefined") {
    console.warn("SpeechRecognition not supported in this environment.");
    return null;
  }

  const SpeechRecognitionClass =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    console.warn("SpeechRecognition not supported in this browser.");
    return null;
  }

  // fallback to system/browser language if no lang provided
  const systemLang = navigator.language || "en-US";

  const recognition = new SpeechRecognitionClass() as SpeechRecognition & {
    abort: () => void;
  };

  recognition.lang = lang || systemLang;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (onError) {
      onError(event.error);
    } else {
      console.error("Speech recognition error:", event.error);
    }
  };

  recognition.addEventListener("end", () => {
    if (onStop) {
      onStop();
    }
  });

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}
