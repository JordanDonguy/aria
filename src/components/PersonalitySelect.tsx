import { X } from "lucide-react";
import { useState } from "react";
import type { Personality } from "@/types/ai";

type PersonalitySelectProps = {
  personality: Personality;
  setPersonality: React.Dispatch<React.SetStateAction<Personality>>;
};

export default function PersonalitySelect({ personality, setPersonality }: PersonalitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { value: Personality; label: string }[] = [
    { value: "Friendly, cheerful and approachable", label: "😊 Friendly" },
    { value: "Exuberant, enthusiastic and lively", label: "🤩 Exuberant" },
    { value: "Nerd, curious and analytical", label: "🤓 Nerd" },
    { value: "Robot, precise and unemotional", label: "🤖 Robot" },
    { value: "Cynical, sarcastic and critical", label: "😈 Cynic" },
  ];

  const handleSelect = (value: Personality) => {
    setPersonality(value);
    setIsOpen(false);
  };

  return (
    <>
      {/* Button that opens the modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-2 rounded-xl hover:cursor-pointer hover:bg-[var(--hover-color)]
        bg-[var(--ai-button-color)] text-[var(--text-color)]"
      >
        {options.find(o => o.value === personality)?.label}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[var(--bg-color)]/75 flex justify-center items-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[var(--menu-color)] border rounded-lg p-4 w-3/4 sm:w-64 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Personality</h2>
              <button onClick={() => setIsOpen(false)}>
                <X />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {options.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => handleSelect(o.value)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[var(--hover-color)] text-left hover:cursor-pointer"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
