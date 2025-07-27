import Markdown from "react-markdown";

type AssistantMessageProps = {
  content: string;
};

function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <article className="w-full self-start max-w-screen">
      <Markdown>{content}</Markdown>
    </article>
  )
}

export default AssistantMessage