"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import { uploadFile } from "../../../lib/admin-api";
import {
  buildImageFigureHtml,
  getSelectionClientRect,
  insertHeading,
  insertHtmlAtCursor,
  insertLink,
  execFormat,
  isSelectionInside,
  queryBlockFormat,
  queryFormat,
  sanitizeBlogBodyHtml,
} from "../../../lib/rich-text-editor";
import MediaPicker from "./MediaPicker";

type Props = {
  initialHtml?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
};

type BubblePosition = {
  top: number;
  left: number;
  placement: "above" | "below";
};

function ToolbarButton({
  title,
  icon,
  onClick,
  active,
  disabled,
  compact,
}: {
  title: string;
  icon: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded transition-colors hover:bg-overlay-muted disabled:opacity-40 ${
        compact ? "p-1.5" : "p-2"
      } ${active ? "bg-overlay-muted text-primary" : "text-on-surface-variant"}`}
    >
      <span className={`material-symbols-outlined ${compact ? "text-[18px]" : "text-[20px]"}`}>
        {icon}
      </span>
    </button>
  );
}

function FormatToolbar({
  compact,
  uploading,
  blockFormat,
  onBold,
  onItalic,
  onHeading,
  onSubheading,
  onParagraph,
  onQuote,
  onList,
  onLink,
  onImage,
  onDivider,
}: {
  compact?: boolean;
  uploading: boolean;
  blockFormat: string;
  onBold: () => void;
  onItalic: () => void;
  onHeading: () => void;
  onSubheading: () => void;
  onParagraph: () => void;
  onQuote: () => void;
  onList: () => void;
  onLink: () => void;
  onImage: () => void;
  onDivider: () => void;
}) {
  return (
    <>
      <ToolbarButton
        title="Bold"
        icon="format_bold"
        compact={compact}
        active={queryFormat("bold")}
        onClick={onBold}
      />
      <ToolbarButton
        title="Italic"
        icon="format_italic"
        compact={compact}
        active={queryFormat("italic")}
        onClick={onItalic}
      />
      <div className={`${compact ? "mx-0.5" : "mx-1"} h-5 w-px bg-divider-strong`} />
      <ToolbarButton
        title="Heading"
        icon="title"
        compact={compact}
        active={blockFormat === "h2"}
        onClick={onHeading}
      />
      <ToolbarButton
        title="Subheading"
        icon="format_h3"
        compact={compact}
        active={blockFormat === "h3"}
        onClick={onSubheading}
      />
      <ToolbarButton
        title="Paragraph"
        icon="format_paragraph"
        compact={compact}
        active={blockFormat === "p" || blockFormat === "div"}
        onClick={onParagraph}
      />
      <ToolbarButton
        title="Quote"
        icon="format_quote"
        compact={compact}
        active={blockFormat === "blockquote"}
        onClick={onQuote}
      />
      <ToolbarButton
        title="Bullet list"
        icon="format_list_bulleted"
        compact={compact}
        onClick={onList}
      />
      <div className={`${compact ? "mx-0.5" : "mx-1"} h-5 w-px bg-divider-strong`} />
      <ToolbarButton title="Link" icon="link" compact={compact} onClick={onLink} />
      <ToolbarButton
        title="Insert image"
        icon="image"
        compact={compact}
        disabled={uploading}
        onClick={onImage}
      />
      {!compact && (
        <ToolbarButton title="Divider" icon="horizontal_rule" onClick={onDivider} />
      )}
    </>
  );
}

export default function RichTextEditor({
  initialHtml = "",
  onChange,
  placeholder = "Tell your story…",
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bubble, setBubble] = useState<BubblePosition | null>(null);
  const [blockFormat, setBlockFormat] = useState("");
  const [formatVersion, setFormatVersion] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;
    if (initialHtml && editorRef.current.innerHTML !== initialHtml) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml]);

  const emitChange = useCallback(() => {
    onChange?.(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  const updateBubble = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !isSelectionInside(editor)) {
      setBubble(null);
      return;
    }

    const rect = getSelectionClientRect();
    if (!rect) {
      setBubble(null);
      return;
    }

    setBlockFormat(queryBlockFormat());
    setFormatVersion((v) => v + 1);

    const bubbleHeight = 44;
    const gap = 10;
    const viewportPadding = 12;
    const centerX = rect.left + rect.width / 2;
    const clampedLeft = Math.min(
      window.innerWidth - viewportPadding,
      Math.max(viewportPadding, centerX),
    );

    const spaceAbove = rect.top;
    const placement = spaceAbove > bubbleHeight + gap + viewportPadding ? "above" : "below";
    const top =
      placement === "above" ? rect.top - gap : rect.bottom + gap;

    setBubble({ top, left: clampedLeft, placement });
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => updateBubble();
    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", handleSelectionChange, true);
    window.addEventListener("resize", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", handleSelectionChange, true);
      window.removeEventListener("resize", handleSelectionChange);
    };
  }, [updateBubble]);

  const runFormat = useCallback(
    (action: () => void) => {
      action();
      editorRef.current?.focus();
      emitChange();
      requestAnimationFrame(updateBubble);
    },
    [emitChange, updateBubble],
  );

  const insertImageSrc = useCallback(
    (src: string, alt: string) => {
      insertHtmlAtCursor(buildImageFigureHtml(src, alt), editorRef.current);
      emitChange();
      setBubble(null);
    },
    [emitChange],
  );

  const insertImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploading(true);
      try {
        const result = await uploadFile(file);
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        insertImageSrc(result.src, alt);
      } finally {
        setUploading(false);
      }
    },
    [insertImageSrc],
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await insertImageFile(file);
          return;
        }
      }

      const html = e.clipboardData?.getData("text/html");
      if (html?.trim()) {
        e.preventDefault();
        insertHtmlAtCursor(sanitizeBlogBodyHtml(html), editorRef.current);
        onChange?.(editorRef.current?.innerHTML ?? "");
      }
    },
    [insertImageFile, onChange],
  );

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) await insertImageFile(file);
    },
    [insertImageFile],
  );

  const formatProps = {
    uploading,
    blockFormat,
    onBold: () => runFormat(() => execFormat("bold")),
    onItalic: () => runFormat(() => execFormat("italic")),
    onHeading: () => runFormat(() => insertHeading("h2", editorRef.current)),
    onSubheading: () => runFormat(() => insertHeading("h3", editorRef.current)),
    onParagraph: () => runFormat(() => execFormat("formatBlock", "p")),
    onQuote: () => runFormat(() => execFormat("formatBlock", "blockquote")),
    onList: () => runFormat(() => execFormat("insertUnorderedList")),
    onLink: () => runFormat(() => insertLink(editorRef.current)),
    onImage: () => setPickerOpen(true),
    onDivider: () =>
      runFormat(() =>
        insertHtmlAtCursor('<hr class="editor-divider" /><p><br></p>', editorRef.current),
      ),
  };

  return (
    <div ref={shellRef} className="rich-editor-shell relative">
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => {
          const alt = item.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
          insertImageSrc(item.src, alt);
        }}
        title="Insert image from Media"
      />

      {bubble && (
        <div
          key={formatVersion}
          role="toolbar"
          aria-label="Text formatting"
          className="rich-editor-bubble fixed z-[100] flex items-center gap-0.5 rounded-full border border-divider-strong bg-surface-container-highest px-2 py-1 shadow-lg"
          style={{
            top: bubble.top,
            left: bubble.left,
            transform:
              bubble.placement === "above" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <FormatToolbar compact {...formatProps} />
        </div>
      )}

      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-divider bg-surface-container-low/95 px-3 py-2 backdrop-blur-sm">
        <FormatToolbar {...formatProps} />
        {uploading && (
          <span className="ml-2 font-label-caps text-[10px] text-on-surface-variant">
            Uploading image…
          </span>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label="Post content"
        data-placeholder={placeholder}
        onInput={emitChange}
        onMouseUp={updateBubble}
        onKeyUp={updateBubble}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rich-editor min-h-[480px] px-1 py-8 outline-none md:px-4"
      />
    </div>
  );
}
