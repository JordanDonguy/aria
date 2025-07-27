import Markdown from "react-markdown";

type AssistantMessageProps = {
  content: string;
  isLast?: boolean
};

function AssistantMessage({ content, isLast = false }: AssistantMessageProps) {
  return (
    <article
      className={`w-full self-start max-w-screen h-full flex-1
        ${isLast ? "min-h-[60vh]" : ""}
      `}
    >
      <Markdown>{content}</Markdown>
    </article>
  )
}

export default AssistantMessage