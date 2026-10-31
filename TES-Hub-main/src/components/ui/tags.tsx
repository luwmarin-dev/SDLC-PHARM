import { useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface Tag {
  id: number;
  title: string;
}

interface Props {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const Tags = ({ tags, setTags }: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteTag = (id: number) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTag = () => {
    const value = inputRef.current?.value.trim();
    if (!value) return;

    setTags((prev) => [...prev, { id: Date.now(), title: value }]);

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-[#012D1D] text-sm font-semibold mt-8">
        {t("ui.tags")}
      </h3>
      <div className="bg-white border-2 mt-2 border-[#717973] p-3 min-h-30">
        <div
          className={`flex items-center flex-wrap gap-2 ${tags.length >= 1 ? "mb-2" : ""}`}
        >
          {tags.map((t) => (
            <p
              key={t.id}
              className="bg-[#A4F792] text-[#267320] flex gap-1 items-center w-max rounded-xs px-2 py-1 text-xs"
            >
              {t.title}
              <X
                className="cursor-pointer"
                onClick={() => handleDeleteTag(t.id)}
              />
            </p>
          ))}
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={t("ui.addTags")}
          className="placeholder:text-[#C1C8C2] placeholder:text-sm text-sm outline-none"
          defaultValue=""
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default Tags;
