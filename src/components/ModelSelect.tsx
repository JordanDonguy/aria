import { Cpu, X } from "lucide-react";
import { useState } from "react";

type ModelSelectProps = {
  aiModel: "small" | "medium";
  setAiModel: React.Dispatch<React.SetStateAction<"small" | "medium">>;
};

export default function ModelSelect({ aiModel, setAiModel }: ModelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "small", label: "Fast", icon: <Cpu size={16} /> },
    { value: "medium", label: "Deep", icon: <Cpu size={16} /> },
  ] as const;

  const handleSelect = (value: "small" | "medium") => {
    setAiModel(value);
    setIsOpen(false);
  };

  // Selected AI model
  const selected = options.find((o) => o.value === aiModel);

  return (
    <>
      {/* Button that opens the modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 border px-2 rounded-lg hover:cursor-pointer hover:bg-[var(--hover-color)]
        border-[var(--input-text-color)] bg-[var(--ai-button-color)] text-[var(--text-color)]"
      >
        {selected?.icon}
        {selected?.label}
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[var(--bg-color)]/75 flex justify-center items-center z-50"
          onClick={() => setIsOpen(false)} // close the modal when clicking outside (blur)
        >
          <div
            className="bg-[var(--menu-color)] border rounded-lg p-4 w-3/4 sm:w-64 shadow-xl"
            onClick={(e) => e.stopPropagation()} // prevent modal from closing when clicking on it
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Model</h2>
              <button onClick={() => setIsOpen(false)}>
                <X />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {options.map(o => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => handleSelect(o.value)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[var(--hover-color)] text-left hover:cursor-pointer"
                >
                  {o.icon}
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
