import { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";

const DEFAULT_EDITOR_BUTTONS = [
  "paragraph",
  "|",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "|",
  "ul",
  "ol",
  "|",
  "outdent",
  "indent",
  "|",
  "align",
  "|",
  "link",
  "table",
  "hr",
  "|",
  "undo",
  "redo",
];

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing here...",
  minHeight = 320,
  height = "auto",
  maxHeight = null,
  className = "",
}) => {
  const editorRef = useRef(null);
  const editorConfig = useMemo(
    () => ({
      readonly: false,
      placeholder,
      minHeight,
      height,
      maxHeight: maxHeight ?? height,
      toolbarAdaptive: false,
      toolbarSticky: false,
      statusbar: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      buttons: DEFAULT_EDITOR_BUTTONS,
      removeButtons: ["image", "video", "file", "copyformat", "cut", "copy", "paste"],
    }),
    [height, maxHeight, minHeight, placeholder]
  );

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-green-700 ${className}`.trim()}
    >
      <JoditEditor
        ref={editorRef}
        value={value}
        config={editorConfig}
        tabIndex={1}
        onBlur={(nextValue) => onChange?.(nextValue)}
        onChange={(nextValue) => onChange?.(nextValue)}
      />
    </div>
  );
};

export default RichTextEditor;
