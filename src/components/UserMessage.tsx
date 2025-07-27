import Markdown from "react-markdown";

type UserMessageProps = {
  content: string;
};

function UserMessage({ content }: UserMessageProps) {
  return (
    <article className="max-w-[80%] self-end ml-auto rounded-2xl px-4 py-2 bg-[var(--chat-msg-color)] w-fit">
          <Markdown>{content}</Markdown>
    </article>
  )
}

export default UserMessage
