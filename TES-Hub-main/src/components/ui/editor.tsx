import { ChevronDownIcon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

type HeaderLevel = false | 1 | 2 | 3;

const BLOCK_OPTIONS: { labelKey: string; value: HeaderLevel }[] = [
  { labelKey: "editor.normalText", value: false },
  { labelKey: "editor.heading1", value: 1 },
  { labelKey: "editor.heading2", value: 2 },
  { labelKey: "editor.heading3", value: 3 },
];

function ToolbarDivider() {
  return <div className="h-6 w-px bg-border" />;
}

export default function Editor({
  value,
  onChange,
  placeholder,
  error,
  className,
}: Props) {
  const { t } = useTranslation();
  const quillRef = useRef<ReactQuill>(null);
  const [blockFormat, setBlockFormat] = useState<HeaderLevel>(false);

  const modules = useMemo(
    () => ({
      toolbar: "#toolbar",
    }),
    [],
  );

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const updateBlockFormat = () => {
      if (!editor.hasFocus()) return;
      const format = editor.getFormat();
      const header = format.header;
      setBlockFormat(
        header === 1 || header === 2 || header === 3 ? header : false,
      );
    };

    editor.on("selection-change", updateBlockFormat);
    editor.on("text-change", updateBlockFormat);

    return () => {
      editor.off("selection-change", updateBlockFormat);
      editor.off("text-change", updateBlockFormat);
    };
  }, []);

  const applyBlockFormat = (level: HeaderLevel) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    editor.format("header", level);
    setBlockFormat(level);
    editor.focus();
  };

  const currentBlockKey =
    BLOCK_OPTIONS.find((option) => option.value === blockFormat)?.labelKey ??
    "editor.normalText";

  return (
    <div
      className={`
        ${className}

        [&_.ql-container]:border!
        [&_.ql-container]:h-full!
        ${error ? "[&_.ql-container]:border-red-500!" : "[&_.ql-container]:border-[#C1C8C2]!"}
        [&_.ql-container]:bg-[#F8FAF8]!
        [&_.ql-container]:font-sans!

        [&_.ql-editor]:bg-[#F8FAF8]!
        [&_.ql-editor]:text-base!
        [&_.ql-editor]:h-full!
        [&_.ql-editor]:leading-8!
        [&_.ql-editor]:p-6!

        [&_.ql-editor_h1]:font-heading!
        [&_.ql-editor_h1]:text-5xl!
        [&_.ql-editor_h1]:font-semibold!
        [&_.ql-editor_h1]:text-[#191C1B]!
        [&_.ql-editor_h1]:mb-6!

        [&_.ql-editor_h2]:font-heading!
        [&_.ql-editor_h2]:text-3xl!
        [&_.ql-editor_h2]:font-semibold!
        [&_.ql-editor_h2]:text-[#191C1B]!
        [&_.ql-editor_h2]:mb-4!

        [&_.ql-editor_h3]:font-heading!
        [&_.ql-editor_h3]:text-2xl!
        [&_.ql-editor_h3]:font-semibold!
        [&_.ql-editor_h3]:text-[#191C1B]!
        [&_.ql-editor_h3]:mb-3!

        [&_.ql-editor_p]:font-sans!
        [&_.ql-editor_p]:text-lg!
        [&_.ql-editor_p]:text-[#414844]!
        [&_.ql-editor_p]:leading-8!
      `}
    >
      <div
        id="toolbar"
        className="flex h-auto items-center gap-3 border border-[#C1C8C2] border-b-0 bg-[#FFFFFF] p-4! [&_button]:m-0 [&_button]:flex [&_button]:h-8 [&_button]:w-8 [&_button]:items-center [&_button]:justify-center [&_button]:rounded [&_button]:text-muted-foreground [&_button:hover]:bg-accent [&_button:hover]:text-foreground [&_.ql-active]:bg-accent [&_.ql-active]:text-foreground [&_svg]:h-4 [&_svg]:w-4"
      >
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="w-auto! gap-1! px-3! font-medium!">
              {t(currentBlockKey)}
              <ChevronDownIcon className="size-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={6}
              className="z-50 min-w-40 rounded-lg border bg-popover p-1 shadow-md"
            >
              {BLOCK_OPTIONS.map((option) => (
                <DropdownMenu.Item
                  key={option.labelKey}
                  onSelect={() => applyBlockFormat(option.value)}
                  className={`cursor-pointer rounded px-3 py-2 text-sm outline-none hover:bg-accent ${
                    blockFormat === option.value
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t(option.labelKey)}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <ToolbarDivider />

        <button type="button" className="ql-bold" />
        <button type="button" className="ql-italic" />
        <button type="button" className="ql-underline" />

        <ToolbarDivider />

        <button type="button" className="ql-list" value="bullet" />
        <button type="button" className="ql-list" value="ordered" />

        <ToolbarDivider />

        <button type="button" className="ql-link" />
        <button type="button" className="ql-image" />
      </div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder ?? t("editor.placeholder")}
      />

      {error && (
        <span className="mt-2 block text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
