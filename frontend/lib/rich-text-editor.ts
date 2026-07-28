import { resolveMediaUrl } from "./api";

export function stripScripts(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

/** Strip pasted Doc/AI junk + inline typography that fights article CSS. */
export function sanitizeBlogBodyHtml(html: string): string {
  if (!html.trim()) return html;

  let out = stripScripts(html);

  // Drop AI / paste artifact wrappers
  out = out.replace(/<\/?(?:response-element|single-image|font)[^>]*>/gi, "");
  out = out.replace(
    /<div[^>]*class=["'][^"']*attachment-container[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    "",
  );

  // Strip inline styles — pasted Google Docs/Gemini force line-height: 1.15 !important
  out = out.replace(/\sstyle=(["'])[\s\S]*?\1/gi, "");

  // Drop path/editor metadata attributes that bloat markup
  out = out.replace(/\sdata-path-to-node=(["'])[\s\S]*?\1/gi, "");
  out = out.replace(/\sng-version=(["'])[\s\S]*?\1/gi, "");
  out = out.replace(/\s_nghost-[a-z0-9-]+(?:=(["'])[\s\S]*?\1)?/gi, "");
  out = out.replace(/\sclass=["']ng-star-inserted["']/gi, "");
  out = out.replace(/\sdata-is-interactive=(["'])[\s\S]*?\1/gi, "");
  out = out.replace(/\sdata-image-attachment-index=(["'])[\s\S]*?\1/gi, "");

  // Unwrap figures incorrectly nested inside paragraphs
  out = out.replace(
    /<p[^>]*>\s*(<figure[\s\S]*?<\/figure>)\s*(?:<p>\s*<br\s*\/?>\s*<\/p>)?\s*<\/p>/gi,
    "$1",
  );

  // Remove empty paragraphs
  out = out.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, "");

  // Collapse leftover HTML comments / empty markers
  out = out.replace(/<!---->/g, "");
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
}

export function resolveBodyHtmlMedia(html: string): string {
  if (!html.trim()) return html;

  const cleaned = sanitizeBlogBodyHtml(html);

  return cleaned.replace(
    /(<img[^>]*\ssrc=["'])([^"']+)(["'][^>]*>)/gi,
    (_match, prefix: string, src: string, suffix: string) =>
      `${prefix}${resolveMediaUrl(src)}${suffix}`,
  );
}

export function buildImageFigureHtml(src: string, alt = ""): string {
  const safeAlt = alt.replace(/"/g, "&quot;");
  return `<figure class="editor-figure" contenteditable="false"><img src="${src}" alt="${safeAlt}" /><figcaption contenteditable="true" data-placeholder="Add a caption…"></figcaption></figure><p><br></p>`;
}

export function insertHtmlAtCursor(html: string, root?: HTMLElement | null) {
  root?.focus();
  const selection = window.getSelection();
  if (!selection) return;

  if (selection.rangeCount === 0 && root) {
    root.insertAdjacentHTML("beforeend", html);
    placeCaretAtEnd(root);
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  const lastNode = fragment.lastChild;
  range.insertNode(fragment);

  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function placeCaretAtEnd(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function execFormat(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function queryFormat(command: string) {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

export function queryBlockFormat(): string {
  try {
    const value = document.queryCommandValue("formatBlock");
    return value.replace(/[<>]/g, "").toLowerCase();
  } catch {
    return "";
  }
}

export function isSelectionInside(root: HTMLElement | null): boolean {
  if (!root) return false;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  return root.contains(range.commonAncestorContainer);
}

export function getSelectionClientRect(): DOMRect | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    const clone = range.cloneRange();
    clone.collapse(true);
    const marker = document.createElement("span");
    marker.textContent = "\u200b";
    clone.insertNode(marker);
    const markerRect = marker.getBoundingClientRect();
    marker.remove();
    return markerRect.width || markerRect.height ? markerRect : null;
  }
  return rect;
}

export function insertHeading(level: "h2" | "h3", root?: HTMLElement | null) {
  execFormat("formatBlock", level);
  root?.focus();
}

export function insertLink(root?: HTMLElement | null) {
  const url = window.prompt("Link URL");
  if (!url?.trim()) return;
  execFormat("createLink", url.trim());
  root?.focus();
}
