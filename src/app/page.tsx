import Image from "next/image";
import UserInput from "@/components/UserInput";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-[85vh] w-full">
      <p className="text-3xl/16 text-center"> Hi, I'm Aria 👋,<br /> Ask me anything 🙂</p>
      <UserInput />
    </div>
  );
}
